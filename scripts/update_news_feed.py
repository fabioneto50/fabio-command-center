from __future__ import annotations

import json
import sys
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path

OUT = Path(__file__).resolve().parents[1] / "news-feed.json"
UA = "Mozilla/5.0 (compatible; FabioCommandCenter/1.0; +https://github.com/fabioneto50/fabio-command-center)"
MAX_ITEMS = 12

HEALTH_QUERY = "when:3d (saúde OR medicina OR hospital OR enfermagem OR OMS OR vacina OR doença OR medicamento)"
WORLD_QUERY = "when:2d (Ucrânia OR Rússia OR Médio Oriente OR China OR Estados Unidos OR União Europeia OR NATO OR África OR Ásia OR guerra OR diplomacia)"
HEALTH_URL = "https://news.google.com/rss/search?" + urllib.parse.urlencode(
    {"q": HEALTH_QUERY, "hl": "pt-PT", "gl": "PT", "ceid": "PT:pt-150"}
)
WORLD_URL = "https://news.google.com/rss/search?" + urllib.parse.urlencode(
    {"q": WORLD_QUERY, "hl": "pt-PT", "gl": "PT", "ceid": "PT:pt-150"}
)


def fetch_xml(url: str) -> ET.Element:
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/rss+xml, application/xml;q=0.9, */*;q=0.8"})
    with urllib.request.urlopen(req, timeout=20) as response:
        data = response.read()
    return ET.fromstring(data)


def iso_date(value: str) -> str:
    try:
        dt = parsedate_to_datetime(value)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")
    except Exception:
        return ""


def parse_feed(url: str) -> list[dict[str, str]]:
    root = fetch_xml(url)
    rows: list[dict[str, str]] = []
    seen: set[str] = set()
    for item in root.findall("./channel/item"):
        title = (item.findtext("title") or "").strip()
        link = (item.findtext("link") or "").strip()
        pub = (item.findtext("pubDate") or "").strip()
        source_node = item.find("source")
        source = ((source_node.text if source_node is not None else "") or "Google News").strip()
        if not title or not link:
            continue
        key = title.casefold()
        if key in seen:
            continue
        seen.add(key)
        rows.append({"title": title, "url": link, "source": source, "publishedAt": iso_date(pub)})
        if len(rows) >= MAX_ITEMS:
            break
    return rows


def main() -> int:
    try:
        health = parse_feed(HEALTH_URL)
        world = parse_feed(WORLD_URL)
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
