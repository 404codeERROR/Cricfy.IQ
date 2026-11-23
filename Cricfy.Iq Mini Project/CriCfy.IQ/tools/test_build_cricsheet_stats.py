import json
import tempfile
import unittest
import zipfile
from pathlib import Path

from build_cricsheet_stats import build, write_snapshot


class BuildCricsheetStatsTests(unittest.TestCase):
    def test_snapshot_replacement_is_complete_and_cleans_temporary_output(self):
        data = {"meta": {"dataThrough": "2027-01-02"}, "players": {}}
        with tempfile.TemporaryDirectory() as directory:
            output_path = Path(directory) / "cricsheet-stats.js"
            output_path.write_text("old snapshot", encoding="utf-8")

            write_snapshot(data, output_path)

            payload = json.loads(output_path.read_text(encoding="utf-8").split("=", 1)[1].rstrip().rstrip(";"))
            self.assertEqual(payload, data)
            self.assertEqual(list(Path(directory).glob("*.tmp")), [])

    def test_derives_real_innings_and_ignores_domestic_matches(self):
        match = {
            "info": {
                "match_type": "ODI",
                "team_type": "international",
                "gender": "male",
                "dates": ["2026-10-01"],
                "teams": ["Testers", "Opposition"],
                "players": {
                    "Testers": ["A One", "B Two"],
                    "Opposition": ["Bowler"],
                },
                "registry": {
                    "people": {
                        "A One": "player-one",
                        "B Two": "player-two",
                        "Bowler": "bowler",
                    },
                },
            },
            "innings": [{
                "team": "Testers",
                "overs": [{
                    "over": 0,
                    "deliveries": [
                        {
                            "batter": "A One",
                            "runs": {"batter": 4, "extras": 0, "total": 4},
                            "bowler": "Bowler",
                        },
                        {
                            "batter": "A One",
                            "runs": {"batter": 0, "extras": 0, "total": 0},
                            "bowler": "Bowler",
                            "wickets": [{"player_out": "A One", "kind": "caught"}],
                        },
                        {
                            "batter": "B Two",
                            "runs": {"batter": 2, "extras": 0, "total": 2},
                            "bowler": "Bowler",
                        },
                    ],
                }],
            }],
        }
        domestic_match = {
            "info": {
                **match["info"],
                "match_type": "T20",
                "team_type": "club",
                "dates": ["2026-10-02"],
            },
            "innings": match["innings"],
        }
        people = [
            {"identifier": "player-one", "name": "A One", "unique_name": "A One", "key_cricinfo": "100"},
            {"identifier": "player-two", "name": "B Two", "unique_name": "B Two", "key_cricinfo": "200"},
            {"identifier": "bowler", "name": "Bowler", "unique_name": "Bowler", "key_cricinfo": ""},
        ]
        aliases = [{"identifier": "player-one", "name": "Alice One"}]

        with tempfile.TemporaryDirectory() as directory:
            archive_path = Path(directory) / "matches.zip"
            with zipfile.ZipFile(archive_path, "w") as archive:
                archive.writestr("match-odi.json", json.dumps(match))
                archive.writestr("match-domestic.json", json.dumps(domestic_match))
            result = build(archive_path, people, aliases)

        player = result["players"]["player-one"]["formats"]["ODI"]
        self.assertEqual(player["matches"], 1)
        self.assertEqual(player["innings"], 1)
        self.assertEqual(player["outs"], 1)
        self.assertEqual(player["runs"], 4)
        self.assertEqual(player["balls"], 2)
        self.assertEqual(player["average"], 4.0)
        self.assertEqual(player["strikeRate"], 200.0)
        self.assertEqual(player["fours"], 1)
        self.assertEqual(player["recent"][0]["opponent"], "Opposition")
        self.assertFalse(player["recent"][0]["notOut"])
        self.assertEqual(result["players"]["player-two"]["formats"]["ODI"]["average"], None)
        self.assertTrue(result["players"]["player-two"]["formats"]["ODI"]["recent"][0]["notOut"])
        self.assertEqual(result["meta"]["matches"], {"ODI": 1})
        self.assertEqual(result["meta"]["dataThrough"], "2026-10-01")
        self.assertIn("aliceone", result["nameIndex"])
        self.assertEqual(result["nameIndex"]["aliceone"], ["player-one"])
        bowler = result["players"]["bowler"]["formats"]["ODI"]
        self.assertEqual(bowler["bowlingMatches"], 1)
        self.assertEqual(bowler["ballsBowled"], 3)
        self.assertEqual(bowler["runsConceded"], 6)
        self.assertEqual(bowler["wickets"], 1)
        self.assertEqual(bowler["economy"], 12.0)
        self.assertEqual(bowler["bowlingAverage"], 6.0)
        self.assertEqual(bowler["lastBowlingDate"], "2026-10-01")
        self.assertEqual(player["lastBattingDate"], "2026-10-01")


class CricsheetSnapshotTests(unittest.TestCase):
    def test_snapshot_contains_women_and_current_format_dates(self):
        dataset_path = Path(__file__).resolve().parents[1] / "assets" / "data" / "cricsheet-stats.js"
        if not dataset_path.exists():
            self.skipTest("Generated Cricsheet snapshot is not present.")
        text = dataset_path.read_text(encoding="utf-8")
        payload = json.loads(text.removeprefix("window.CRICFY_CRICSHEET=").removesuffix(";\n"))
        records = list(payload["players"].values())
        women = [record for record in records if record.get("gender") == "female"]
        men = [record for record in records if record.get("gender") == "male"]
        self.assertGreater(len(women), 1000)
        self.assertGreater(len(men), 1000)
        snapshot_year = payload["meta"]["dataThrough"][:4]
        active_women = [
            record for record in women
            if any(
                (stats.get("lastBattingDate") or stats.get("lastBowlingDate") or "") >= f"{snapshot_year}-01-01"
                for stats in record["formats"].values()
            )
        ]
        self.assertGreater(len(active_women), 0)


if __name__ == "__main__":
    unittest.main()
