from __future__ import annotations

import argparse
import html
import json
import os
import re
import sys
import tempfile
import unicodedata
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timedelta, timezone
from email.utils import parsedate_to_datetime
from html.parser import HTMLParser
from pathlib import Path

OUT = Path(__file__).resolve().parents[1] / "news-feed.json"
UA = "Mozilla/5.0 (compatible; FabioCommandCenter/1.0; +https://github.com/fabioneto50/fabio-command-center)"
MAX_ITEMS = 12
MIN_ITEMS = 4
MAX_FEED_AGE = timedelta(hours=48)
MAX_ARTICLE_AGE = {"health": timedelta(days=7), "world": timedelta(days=4)}

# Direct publisher RSS feeds give stable article URLs; Google News decoding broke
# in October 2026. The quota reserves room for more than one publisher.
# (publisher, RSS URL, quota, filter by health terms)
SOURCES = {
    "health": (
        ("HealthNews", "https://healthnews.pt/feed/", 8, False),
        ("RTP Notícias", "https://www.rtp.pt/noticias/rss/pais", 4, True),
        ("RTP Notícias", "https://www.rtp.pt/noticias/rss", 4, True),
    ),
    "world": (
        ("RTP Notícias", "https://www.rtp.pt/noticias/rss/mundo", 6, False),
        ("Euronews", "https://pt.euronews.com/rss?level=vertical&name=news", 6, False),
    ),
}
HEALTH_TERMS = (
    "saude", "hospital", "urgencia", "medic", "enfermag", "sns", "doent",
    "vacina", "infecc", "farmac", "covid", "cancro", "ambul", "transplante",
    "clinica", "cirurg", "tratamento", "doenca",
)
CONTENT_TAG = "{http://purl.org/rss/1.0/modules/content/}encoded"
MEDIA_NS = "{http://search.yahoo.com/mrss/}"


class MetaParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.meta: dict[str, str] = {}
        self.first_image = ""

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        data = {str(k).lower(): str(v or "") for k, v in attrs}
        if tag.lower() == "img" and not self.first_image:
            self.first_image = data.get("src") or data.get("data-src") or ""
        if tag.lower() != "meta":
            return
        key = (data.get("property") or data.get("name") or "").lower()
        value = data.get("content", "").strip()
        if key and value and key not in self.meta:
            self.meta[key] = value


def fetch_xml(url: str) -> ET.Element:
    req = urllib.request.Request(
        url,
        headers={"User-Agent": UA, "Accept": "application/rss+xml, application/xml;q=0.9, */*;q=0.8"},
    )
    with urllib.request.urlopen(req, timeout=15) as response:
        return ET.fromstring(response.read(3_000_000))


def safe_url(value: str, base: str = "") -> str:
    value = html.unescape((value or "").strip())
    if not value:
        return ""
    if base:
        value = urllib.parse.urljoin(base, value)
    try:
        parts = urllib.parse.urlsplit(value)
        return value if parts.scheme in ("http", "https") and parts.hostname else ""
    except ValueError:
        return ""


def direct_url(value: str) -> str:
    url = safe_url(value)
    if not url:
        return ""
    parts = urllib.parse.urlsplit(url)
    query = urllib.parse.parse_qsl(parts.query, keep_blank_values=True)
    query = [(k, v) for k, v in query if not k.casefold().startswith("utm_")
             and k.casefold() not in ("fbclid", "gclid")]
    return urllib.parse.urlunsplit((parts.scheme, parts.netloc, parts.path, urllib.parse.urlencode(query), ""))


def parse_iso(value: str) -> datetime:
    return datetime.fromisoformat(value.replace("Z", "+00:00")).astimezone(timezone.utc)


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


def useful_description(value: str, title: str) -> str:
    value = clean_text(value)
    low = value.casefold()
    if not value or value.casefold() == title.casefold():
        return ""
    if "comprehensive up-to-date news coverage" in low or "google news" in low:
        return ""
    return value


def is_health_headline(title: str) -> bool:
    normalized = unicodedata.normalize("NFD", title.casefold())
    normalized = "".join(ch for ch in normalized if unicodedata.category(ch) != "Mn")
    return any(term in normalized for term in HEALTH_TERMS)


def image_from_rss(item: ET.Element, link: str, markup: str) -> str:
    for tag in (f"{MEDIA_NS}thumbnail", f"{MEDIA_NS}content", "enclosure"):
        for node in item.findall(tag):
            if tag == "enclosure" and not node.get("type", "").startswith("image/"):
                continue
            image = safe_url(node.get("url", ""), link)
            if image:
                return image
    parser = MetaParser()
    parser.feed(markup)
    return safe_url(parser.first_image, link)


def parse_feed(url: str, publisher: str, kind: str, health_only: bool, now: datetime) -> list[dict[str, str]]:
    root = fetch_xml(url)
    rows: list[dict[str, str]] = []
    seen: set[str] = set()
    for item in root.findall("./channel/item"):
        title = clean_text(item.findtext("title") or "", 240)
        link = direct_url(item.findtext("link") or "")
        pub = (item.findtext("pubDate") or "").strip()
        published = iso_date(pub)
        if not title or not link or not published or (health_only and not is_health_headline(title)):
            continue
        if "news.google.com" in urllib.parse.urlsplit(link).hostname.lower():
            continue
        posted = parse_iso(published)
        if posted < now - MAX_ARTICLE_AGE[kind] or posted > now + timedelta(minutes=30):
            continue
        if link in seen:
            continue
        seen.add(link)
        description_html = item.findtext("description") or ""
        full_html = item.findtext(CONTENT_TAG) or ""
        rows.append(
            {
                "title": title,
                "url": link,
                "source": publisher,
                "publishedAt": published,
                "description": useful_description(description_html or full_html, title)
                               or f"Notícia de {publisher}. Consulte o artigo na fonte original.",
                "image": image_from_rss(item, link, description_html + " " + full_html),
            }
        )
    return rows


def fetch_article_metadata(article_url: str, title: str) -> tuple[str, str]:
    if "news.google.com" in urllib.parse.urlparse(article_url).netloc:
        return "", ""
    req = urllib.request.Request(
        article_url,
        headers={"User-Agent": UA, "Accept": "text/html,application/xhtml+xml"},
    )
    with urllib.request.urlopen(req, timeout=8) as response:
        final_url = response.geturl()
        raw = response.read(900_000)
        charset = response.headers.get_content_charset() or "utf-8"
    parser = MetaParser()
    parser.feed(raw.decode(charset, errors="replace"))
    image = (
        parser.meta.get("og:image")
        or parser.meta.get("twitter:image")
        or parser.meta.get("twitter:image:src")
        or ""
    )
    if image:
        image = urllib.parse.urljoin(final_url, image)
        host = urllib.parse.urlparse(image).netloc.casefold()
        if "googleusercontent.com" in host or "gstatic.com" in host:
            image = ""
    description = useful_description(
        parser.meta.get("og:description")
        or parser.meta.get("twitter:description")
        or parser.meta.get("description")
        or "",
        title,
    )
    return image, description


def enrich(row: dict[str, str]) -> dict[str, str]:
    out = dict(row)
    if out.get("image"):
        return out
    try:
        image, description = fetch_article_metadata(row["url"], row["title"])
        if image:
            out["image"] = image
        if description and out["description"].startswith("Notícia de "):
            out["description"] = description
    except Exception:
        pass
    return out


def enrich_group(rows: list[dict[str, str]]) -> list[dict[str, str]]:
    results: list[dict[str, str] | None] = [None] * len(rows)
    with ThreadPoolExecutor(max_workers=6) as pool:
        futures = {pool.submit(enrich, row): i for i, row in enumerate(rows)}
        for future in as_completed(futures):
            index = futures[future]
            try:
                results[index] = future.result()
            except Exception:
                results[index] = rows[index]
    return [row or rows[i] for i, row in enumerate(results)]


def collect_group(kind: str, now: datetime) -> list[dict[str, str]]:
    definitions = SOURCES[kind]
    by_source: dict[str, list[dict[str, str]]] = {}
    with ThreadPoolExecutor(max_workers=len(definitions)) as pool:
        futures = {pool.submit(parse_feed, url, publisher, kind, health_only, now): url
                   for publisher, url, _, health_only in definitions}
        for future in as_completed(futures):
            url = futures[future]
            try:
                by_source[url] = future.result()
                print(f"{kind}: {url} -> {len(by_source[url])} recent articles")
            except Exception as exc:
                by_source[url] = []
                print(f"WARN {kind}: {url} unavailable: {exc}", file=sys.stderr)

    selected: list[dict[str, str]] = []
    seen: set[str] = set()

    def add(row: dict[str, str]) -> None:
        if len(selected) < MAX_ITEMS and row["url"] not in seen:
            selected.append(row)
            seen.add(row["url"])

    # First give each publisher a place; then fill unused slots with fresh items.
    for _, url, quota, _ in definitions:
        for row in by_source[url][:quota]:
            add(row)
    remaining = sorted((row for rows in by_source.values() for row in rows),
                       key=lambda row: row["publishedAt"], reverse=True)
    for row in remaining:
        add(row)
    selected.sort(key=lambda row: row["publishedAt"], reverse=True)
    return enrich_group(selected)


def validate_data(data: dict, now: datetime | None = None) -> None:
    now = now or datetime.now(timezone.utc)
    updated = parse_iso(data["updatedAt"])
    if updated < now - MAX_FEED_AGE or updated > now + timedelta(minutes=30):
        raise ValueError(f"Feed timestamp is stale or in the future: {data['updatedAt']}")
    for kind in ("health", "world"):
        rows = data.get(kind)
        if not isinstance(rows, list) or len(rows) < MIN_ITEMS:
            raise ValueError(f"{kind}: fewer than {MIN_ITEMS} articles")
        seen: set[str] = set()
        for row in rows:
            url = safe_url(row.get("url", ""))
            if not url or "news.google.com" in urllib.parse.urlsplit(url).hostname.lower():
                raise ValueError(f"{kind}: invalid or unresolved article URL")
            if url in seen or not row.get("title") or not row.get("source") or not row.get("description"):
                raise ValueError(f"{kind}: duplicate article or missing fields")
            seen.add(url)
            published = parse_iso(row["publishedAt"])
            if published < now - MAX_ARTICLE_AGE[kind] or published > now + timedelta(minutes=30):
                raise ValueError(f"{kind}: article outside freshness window")
            if row.get("image") and not safe_url(row["image"]):
                raise ValueError(f"{kind}: invalid image URL")
        images = sum(bool(row.get("image")) for row in rows)
        print(f"{kind}: direct_urls={len(rows)} images={images}")
        if images < 2:
            print(f"WARN {kind}: fewer than two editorial images; text is still valid", file=sys.stderr)


def write_atomically(data: dict) -> None:
    filename = ""
    try:
        with tempfile.NamedTemporaryFile("w", encoding="utf-8", dir=OUT.parent,
                                         prefix=".news-feed-", suffix=".tmp", delete=False) as handle:
            filename = handle.name
            json.dump(data, handle, ensure_ascii=False, indent=2)
            handle.write("\n")
        os.replace(filename, OUT)
    finally:
        if filename and os.path.exists(filename):
            os.unlink(filename)


def main() -> int:
    parser = argparse.ArgumentParser(description="Update or validate the Home news feed")
    parser.add_argument("--validate", action="store_true", help="Only validate the existing news-feed.json")
    args = parser.parse_args()
    try:
        if args.validate:
            validate_data(json.loads(OUT.read_text(encoding="utf-8")))
            print("News feed validation: PASS")
            return 0
        now = datetime.now(timezone.utc)
        payload = {
            "updatedAt": now.isoformat().replace("+00:00", "Z"),
            "health": collect_group("health", now),
            "world": collect_group("world", now),
        }
        validate_data(payload, now)
        write_atomically(payload)
        print(f"Updated {OUT.name} at {payload['updatedAt']}")
        return 0
    except (OSError, ValueError, KeyError, TypeError) as exc:
        print(f"ERROR News refresh failed; existing feed preserved: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
