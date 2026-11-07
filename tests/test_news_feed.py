"""Offline regression checks for the unattended Home news update."""

import importlib.util
import json
import tempfile
import unittest
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta, timezone
from pathlib import Path
from unittest.mock import patch


SCRIPT = Path(__file__).resolve().parents[1] / "scripts/update_news_feed.py"
spec = importlib.util.spec_from_file_location("update_news_feed", SCRIPT)
news = importlib.util.module_from_spec(spec)
spec.loader.exec_module(news)


class NewsFeedTests(unittest.TestCase):
    def setUp(self):
        self.now = datetime.now(timezone.utc)
        self.published = self.now.strftime("%a, %d %b %Y %H:%M:%S +0000")

    def rss(self, items):
        return ET.fromstring("<rss><channel>" + "".join(items) + "</channel></rss>")

    def item(self, title, url, description="Descrição original", when=None):
        return (f"<item><title>{title}</title><link>{url}</link>"
                f"<pubDate>{when or self.published}</pubDate>"
                f"<description><![CDATA[{description}]]></description></item>")

    def rows(self, kind):
        return [{
            "title": f"Notícia {kind} {i}",
            "url": f"https://publisher.example/{kind}/{i}",
            "source": "Publisher",
            "publishedAt": self.now.isoformat().replace("+00:00", "Z"),
            "description": "Descrição verificada",
            "image": "https://publisher.example/image.jpg" if i < 2 else "",
        } for i in range(4)]

    def valid_payload(self):
        return {"updatedAt": self.now.isoformat().replace("+00:00", "Z"),
                "health": self.rows("health"), "world": self.rows("world")}

    def test_direct_links_tracking_and_rss_image(self):
        self.assertEqual(news.safe_url("", "https://publisher.example/article"), "")
        xml = self.rss([self.item(
            "Hospital reforça cuidados de saúde",
            "https://publisher.example/story?utm_source=rss&amp;page=2#utm_campaign=test",
            '<p>Mais notícias <img src="https://images.example/photo.jpg?width=350&amp;q=50"></p>',
        )])
        with patch.object(news, "fetch_xml", return_value=xml):
            rows = news.parse_feed("https://publisher.example/feed", "Publisher", "health", True, self.now)
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]["url"], "https://publisher.example/story?page=2")
        self.assertEqual(rows[0]["image"], "https://images.example/photo.jpg?width=350&q=50")
        self.assertIn("Mais notícias", rows[0]["description"])

    def test_health_filter_rejects_unrelated_titles(self):
        xml = self.rss([
            self.item("Festival de cinema", "https://publisher.example/culture"),
            self.item("Enfermagem no hospital", "https://publisher.example/health"),
        ])
        with patch.object(news, "fetch_xml", return_value=xml):
            rows = news.parse_feed("https://publisher.example/feed", "Publisher", "health", True, self.now)
        self.assertEqual([row["title"] for row in rows], ["Enfermagem no hospital"])

    def test_media_thumbnail_and_stale_article(self):
        xml = ET.fromstring(f'''<rss xmlns:media="http://search.yahoo.com/mrss/"><channel>
            <item><title>World</title><link>https://publisher.example/a</link>
            <pubDate>{self.published}</pubDate><description>Story</description>
            <media:thumbnail url="https://publisher.example/a.jpg"/></item></channel></rss>''')
        with patch.object(news, "fetch_xml", return_value=xml):
            rows = news.parse_feed("https://publisher.example/feed", "Publisher", "world", False, self.now)
        self.assertEqual(rows[0]["image"], "https://publisher.example/a.jpg")
        old = self.rss([self.item("Old", "https://publisher.example/old",
                                  when=(self.now - timedelta(days=20)).strftime("%a, %d %b %Y %H:%M:%S +0000"))])
        with patch.object(news, "fetch_xml", return_value=old):
            self.assertEqual(news.parse_feed("https://publisher.example/feed", "Publisher", "world", False, self.now), [])

    def test_group_survives_one_failed_publisher_and_deduplicates(self):
        sample = self.rows("health")
        def fetch(url, publisher, kind, health_only, now):
            if "healthnews" in url:
                raise OSError("temporary upstream failure")
            return sample
        with patch.object(news, "parse_feed", side_effect=fetch), patch.object(news, "enrich_group", side_effect=lambda x: x):
            rows = news.collect_group("health", self.now)
        self.assertEqual(len(rows), 4)
        self.assertEqual(len({row["url"] for row in rows}), 4)

    def test_validation_rejects_unresolved_and_old_data(self):
        data = self.valid_payload()
        news.validate_data(data, self.now)
        data["health"][0]["url"] = "https://news.google.com/rss/articles/encoded"
        with self.assertRaisesRegex(ValueError, "unresolved"):
            news.validate_data(data, self.now)
        data = self.valid_payload()
        data["updatedAt"] = (self.now - timedelta(days=40)).isoformat()
        with self.assertRaisesRegex(ValueError, "stale"):
            news.validate_data(data, self.now)

    def test_failed_refresh_preserves_existing_feed(self):
        with tempfile.TemporaryDirectory() as directory:
            target = Path(directory) / "news-feed.json"
            target.write_text('{"original": true}', encoding="utf-8")
            with patch.object(news, "OUT", target), patch.object(news, "collect_group", return_value=[]), \
                 patch("sys.argv", ["update_news_feed.py"]):
                self.assertEqual(news.main(), 1)
            self.assertEqual(json.loads(target.read_text(encoding="utf-8")), {"original": True})


if __name__ == "__main__":
    unittest.main()
