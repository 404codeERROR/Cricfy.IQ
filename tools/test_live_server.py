import datetime
import json
import os
import threading
import tempfile
import unittest
from http.server import ThreadingHTTPServer
from urllib.error import HTTPError
from urllib.request import urlopen
from pathlib import Path
from unittest.mock import patch

from live_server import (
    STATS_REFRESH_INTERVAL,
    CricfyHandler,
    normalize_matches,
    parse_match_date,
    stats_snapshot_is_stale,
    stats_snapshot_version,
)


class LiveMatchNormalizationTests(unittest.TestCase):
    def test_keeps_live_and_upcoming_test_odi_t20_only(self):
        now = datetime.datetime(2026, 11, 23, 12, tzinfo=datetime.timezone.utc)
        live = [{
            "id": "live-1",
            "name": "India vs Australia",
            "matchType": "ODI",
            "status": "India need 30 runs",
            "ms": "live",
            "dateTimeGMT": "2026-11-23T10:00:00Z",
            "venue": "Test Ground",
            "t1": "India",
            "t2": "Australia",
            "t1s": "220/5",
        }]
        fixtures = [
            {
                "id": "next-t20",
                "name": "India vs England",
                "matchType": "T20I",
                "status": "Match starts at 14:00 GMT",
                "dateTimeGMT": "2026-11-24T14:00:00Z",
                "venue": "Cricket Ground",
                "teams": ["India", "England"],
            },
            {
                "id": "old-test",
                "name": "Old Test",
                "matchType": "Test",
                "status": "Australia won by 5 wickets",
                "dateTimeGMT": "2026-11-20T14:00:00Z",
            },
            {
                "id": "unsupported",
                "name": "T10 Match",
                "matchType": "T10",
                "status": "Match starts at 14:00 GMT",
                "dateTimeGMT": "2026-11-24T14:00:00Z",
            },
        ]

        matches = normalize_matches(live, fixtures, now=now)

        self.assertEqual([match["id"] for match in matches], ["live-1", "next-t20"])
        self.assertTrue(matches[0]["isLive"])
        self.assertEqual(matches[0]["team1Score"], "220/5")
        self.assertFalse(matches[1]["isLive"])
        self.assertEqual(matches[1]["format"], "T20")
        self.assertEqual(matches[1]["team2"], "England")

    def test_invalid_date_values_are_ignored(self):
        self.assertIsNone(parse_match_date(None))
        self.assertIsNone(parse_match_date(123))
        self.assertIsNone(parse_match_date("not a date"))


class LiveMatchEndpointTests(unittest.TestCase):
    def test_stats_snapshot_staleness_and_version(self):
        with tempfile.TemporaryDirectory() as directory:
            snapshot = Path(directory) / "cricsheet-stats.js"
            now = 1_900_000_000
            self.assertTrue(stats_snapshot_is_stale(snapshot, now=now))
            snapshot.write_text(
                'window.CRICFY_CRICSHEET={"meta":{"dataThrough":"2027-01-02"}};\n',
                encoding="utf-8",
            )
            os.utime(snapshot, (now - STATS_REFRESH_INTERVAL - 1, now - STATS_REFRESH_INTERVAL - 1))
            self.assertTrue(stats_snapshot_is_stale(snapshot, now=now))
            self.assertEqual(stats_snapshot_version(snapshot), "2027-01-02")
            os.utime(snapshot, (now, now))
            self.assertFalse(stats_snapshot_is_stale(snapshot, now=now))

    def test_missing_api_key_returns_configuration_message(self):
        server = ThreadingHTTPServer(("127.0.0.1", 0), CricfyHandler)
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        try:
            with patch.dict(os.environ, {"CRICFY_CRICKET_API_KEY": ""}):
                url = f"http://127.0.0.1:{server.server_port}/api/cricket-matches"
                with self.assertRaises(HTTPError) as error:
                    urlopen(url, timeout=2)
                self.assertEqual(error.exception.code, 503)
                payload = json.loads(error.exception.read().decode("utf-8"))
                self.assertIn("CRICFY_CRICKET_API_KEY", payload["message"])
        finally:
            server.shutdown()
            server.server_close()
            thread.join(timeout=2)

    def test_stats_version_endpoint_returns_uncached_version(self):
        server = ThreadingHTTPServer(("127.0.0.1", 0), CricfyHandler)
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        try:
            with patch("live_server.stats_snapshot_version", return_value="2027-01-02T03:04:05Z"):
                with urlopen(f"http://127.0.0.1:{server.server_port}/api/stats-version", timeout=2) as response:
                    payload = json.loads(response.read().decode("utf-8"))
                    self.assertEqual(response.headers.get("Cache-Control"), "no-store")
            self.assertEqual(payload, {"ok": True, "version": "2027-01-02T03:04:05Z"})
        finally:
            server.shutdown()
            server.server_close()
            thread.join(timeout=2)


if __name__ == "__main__":
    unittest.main()
