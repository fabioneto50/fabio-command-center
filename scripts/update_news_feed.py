from __future__ import annotations

import html
import json
import re
import sys
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from html.parser import HTMLParser
from pathlib import Path

OUT = Path(__file__).resolve().parents[1] / "news-feed.json"
UA = "Mozilla/5.0 (compatible; FabioCommandCenter/1.0; +https://github.com/fabioneto50/fabio-command-center)"
MAX_ITEMS = 12
ENRICH_ITEMS = 10

HEALTH_QUERY = "when:3d (saúde OR medicina OR hospital OR enfermagem OR OMS OR vacina OR doença OR medicamento)"
WORLD_QUERY = "when:2d (Ucrânia OR Rússia OR Médio Oriente OR China OR Estados Unidos OR União Europeia OR NATO OR África OR Ásia OR guerra OR diplomacia)"
HEALTH_URL = "https://news.google.com/rss/search?" + urllib.parse.urlencode(
    {"q": HEALTH_QUERY, "hl": "pt-PT", "gl": "PT", "ceid": "PT:pt-150"}
)
WORLD_URL = "https://news.google.com/rss/search?" + urllib.parse.urlencode(
    {"q": WORLD_QUERY, "hl": "pt-PT", "gl": "PT", "ceid": "PT:pt-150"}
)


class MetaParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.meta: dict[str, str] = {}

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag.lower() != "meta":
            return
        data = {str(k).lower(): str(v or "") for k, v in attrs}
        key = (data.get("property") or data.get("name") or "").lower()
        value = data.get("content", "").strip()
        if key and value and key not in self.meta:
            self.meta[key] = value


def fetch_xml(url: str) -> ET.Element:
    req = urllib.request.Request(
        url,
        headers={"User-Agent": UA, "Accept": "application/rss+xml, application/xml;q=0.9, */*;q=0.8"},
    )
    with urllib.request.urlopen(req, timeout=20) as response:
        return ET.fromstring(response.read())


def iso_date(value: str) -> str:
    try:
        dt = parsedate_to_datetime(value)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")
    except Exception:
        return ""


def clean_text(value: str, limit: int = 380) -> str:
    value = html.unescape(re.sub(r"<[^>]+>", " ", value or ""))
    value = re.sub(r"\s+", " ", value).strip()
    if len(value) > limit:
        value = value[:limit].rsplit(" ", 1)[0] + "…"
    return value


def parse_feed(url: str) -> list[dict[str, str]]:
    root = fetch_xml(url)
    rows: list[dict[str, str]] = []
    seen: set[str] = set()
    for item in root.findall("./channel/item"):
        title = (item.findtext("title") or "").strip()
        link = (item.findtext("link") or "").strip()
        pub = (item.findtext("pubDate") or "").strip()
        rss_desc = clean_text(item.findtext("description") or "")
        source_node = item.find("source")
        source = ((source_node.text if source_node is not None else "") or "Google News").strip()
        if not title or not link:
            continue
        key = title.casefold()
        if key in seen:
            continue
        seen.add(key)
        rows.append(
            {
                "title": title,
                "url": link,
                "source": source,
                "publishedAt": iso_date(pub),
                "description": rss_desc,
                "image": "",
            }
        )
        if len(rows) >= MAX_ITEMS:
            break
    return rows


def enrich(row: dict[str, str]) -> dict[str, str]:
    out = dict(row)
    try:
        req = urllib.request.Request(
            row["url"],
            headers={"User-Agent": UA, "Accept": "text/html,application/xhtml+xml"},
        )
        with urllib.request.urlopen(req, timeout=8) as response:
            final_url = response.geturl()
            raw = response.read(800_000)
            charset = response.headers.get_content_charset() or "utf-8"
        text = raw.decode(charset, errors="replace")
        parser = MetaParser()
        parser.feed(text)

        image = (
            parser.meta.get("og:image")
            or parser.meta.get("twitter:image")
            or parser.meta.get("twitter:image:src")
            or ""
        )
        description = (
            parser.meta.get("og:description")
            or parser.meta.get("twitter:description")
            or parser.meta.get("description")
            or ""
        )
        if image:
            out["image"] = urllib.parse.urljoin(final_url, image)
        description = clean_text(description)
        if description and description.casefold() != out["title"].casefold():
            out["description"] = description
        if final_url and "news.google.com" not in urllib.parse.urlparse(final_url).netloc:
            out["articleUrl"] = final_url
    except Exception:
        pass

    if not out.get("description"):
        out["description"] = f"Leia os principais detalhes desta notícia publicada por {out.get('source') or 'a fonte original'}."
    return out


def enrich_group(rows: list[dict[str, str]]) -> list[dict[str, str]]:
    first = rows[:ENRICH_ITEMS]
    results: list[dict[str, str] | None] = [None] * len(first)
    with ThreadPoolExecutor(max_workers=5) as pool:
        futures = {pool.submit(enrich, row): i for i, row in enumerate(first)}
        for future in as_completed(futures):
            index = futures[future]
            try:
                results[index] = future.result()
            except Exception:
                results[index] = first[index]
    return [row or first[i] for i, row in enumerate(results)] + rows[ENRICH_ITEMS:]


def main() -> int:
    try:
        health = enrich_group(parse_feed(HEALTH_URL))
        world = enrich_group(parse_feed(WORLD_URL))
    except Exception as exc:
        print(f"News fetch failed; keeping existing feed: {exc}", file=sys.stderr)
        return 0

    if len(health) < 4 or len(world) < 4:
        print(f"Feed incomplete (health={len(health)}, world={len(world)}); keeping existing feed", file=sys.stderr)
        return 0

    payload = {
        "updatedAt": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "health": health,
        "world": world,
    }
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Updated {OUT.name}: health={len(health)}, world={len(world)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
