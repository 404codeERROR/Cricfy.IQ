import argparse
import csv
import datetime
import json
import re
import tempfile
import unicodedata
import urllib.request
import zipfile
from collections import defaultdict
from pathlib import Path


ARCHIVE_URL = "https://cricsheet.org/downloads/all_json.zip"
PEOPLE_URL = "https://cricsheet.org/register/people.csv"
NAMES_URL = "https://cricsheet.org/register/names.csv"
FORMATS = {"Test", "ODI", "T20"}


def normalize_name(value):
    decomposed = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]", "", decomposed.lower())


def initial_last_name(value):
    decomposed = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode().lower()
    parts = re.findall(r"[a-z0-9]+", decomposed)
    return normalize_name(parts[0][0] + parts[-1]) if len(parts) > 1 else ""


def download(url, destination):
    request = urllib.request.Request(url, headers={"User-Agent": "Cricfy.iq stats builder"})
    with urllib.request.urlopen(request) as response, destination.open("wb") as output:
        while chunk := response.read(1024 * 1024):
            output.write(chunk)


def load_csv(url, local_path):
    if local_path:
        content = Path(local_path).read_text(encoding="utf-8-sig")
    else:
        request = urllib.request.Request(url, headers={"User-Agent": "Cricfy.iq stats builder"})
        with urllib.request.urlopen(request) as response:
            content = response.read().decode("utf-8-sig")
    return list(csv.DictReader(content.splitlines()))


def empty_format():
    return {
        "matches": 0,
        "innings": 0,
        "outs": 0,
        "runs": 0,
        "balls": 0,
        "high": 0,
        "centuries": 0,
        "fifties": 0,
        "fours": 0,
        "sixes": 0,
        "recent": [],
        "inningsLog": [],
        "bowlingMatches": 0,
        "ballsBowled": 0,
        "runsConceded": 0,
        "maidens": 0,
        "wickets": 0,
        "economy": None,
        "bowlingAverage": None,
        "bowlingStrikeRate": None,
        "lastBattingDate": "",
        "lastBowlingDate": "",
    }


def build(archive_path, people_rows, name_rows):
    people = {}
    aliases = defaultdict(set)
    initial_aliases = defaultdict(set)
    for row in people_rows:
        identifier = row["identifier"]
        people[identifier] = {
            "name": row["name"],
            "cricinfoIds": sorted({
                value.strip()
                for key, value in row.items()
                if key.startswith("key_cricinfo") and value and value.strip()
            }),
        }
        for value in (row.get("name", ""), row.get("unique_name", "")):
            normalized = normalize_name(value)
            if normalized:
                aliases[normalized].add(identifier)
            short_name = initial_last_name(value)
            if short_name:
                initial_aliases[short_name].add(identifier)
    for row in name_rows:
        normalized = normalize_name(row.get("name", ""))
        if normalized and row.get("identifier") in people:
            aliases[normalized].add(row["identifier"])
        short_name = initial_last_name(row.get("name", ""))
        if short_name and row.get("identifier") in people:
            initial_aliases[short_name].add(row["identifier"])

    records = {}
    match_counts = defaultdict(int)
    data_through = ""
    with zipfile.ZipFile(archive_path) as archive:
        for filename in archive.namelist():
            if not filename.endswith(".json"):
                continue
            match = json.loads(archive.read(filename))
            info = match["info"]
            match_type = info.get("match_type")
            if info.get("team_type") != "international" or match_type not in FORMATS:
                continue

            match_counts[match_type] += 1
            match_date = max(info.get("dates", [""]))
            data_through = max(data_through, match_date)
            registry = info.get("registry", {}).get("people", {})

            def player_id(name):
                identifier = registry.get(name)
                return identifier if identifier in people else None

            team_by_player = {}
            for team, team_players in info.get("players", {}).items():
                for name in team_players:
                    identifier = player_id(name)
                    if identifier:
                        team_by_player[identifier] = team
            match_players = set(team_by_player)
            for identifier in match_players:
                record = records.setdefault(identifier, {
                    "name": people[identifier]["name"],
                    "cricinfoIds": people[identifier]["cricinfoIds"],
                    "team": "",
                    "gender": info.get("gender", ""),
                    "formats": {format_name: empty_format() for format_name in sorted(FORMATS)},
                })
                team = team_by_player[identifier]
                record["team"] = f"{team} Women" if info.get("gender") == "female" else team
                record["formats"][match_type]["matches"] += 1

            teams = info.get("teams", [])
            match_bowlers = set()
            for innings_number, innings in enumerate(match.get("innings", []), start=1):
                batting_team = innings.get("team", "")
                opponent = next((team for team in teams if team != batting_team), "")
                scores = {}
                dismissed = set()
                for over in innings.get("overs", []):
                    over_runs = 0
                    over_bowler = None
                    for delivery in over.get("deliveries", []):
                        bowler = delivery.get("bowler")
                        bowler_id = player_id(bowler) if bowler else None
                        if bowler_id:
                            over_bowler = bowler_id
                            match_bowlers.add(bowler_id)
                            record = records.setdefault(bowler_id, {
                                "name": people[bowler_id]["name"],
                                "cricinfoIds": people[bowler_id]["cricinfoIds"],
                                "team": team_by_player.get(bowler_id, ""),
                                "gender": info.get("gender", ""),
                                "formats": {format_name: empty_format() for format_name in sorted(FORMATS)},
                            })
                            bowling = record["formats"][match_type]
                            bowling["lastBowlingDate"] = max(bowling["lastBowlingDate"], match_date)
                            if "wides" not in delivery.get("extras", {}) and "noballs" not in delivery.get("extras", {}):
                                bowling["ballsBowled"] += 1
                            extras = delivery.get("extras", {})
                            conceded = delivery.get("runs", {}).get("total", 0) - extras.get("byes", 0) - extras.get("legbyes", 0)
                            bowling["runsConceded"] += conceded
                            over_runs += conceded

                            credited_wicket_kinds = {
                                "bowled", "caught", "caught and bowled", "lbw", "stumped", "hit wicket",
                            }
                            for wicket in delivery.get("wickets", []):
                                if wicket.get("kind") in credited_wicket_kinds:
                                    bowling["wickets"] += 1

                        batter = delivery.get("batter")
                        identifier = player_id(batter)
                        if not identifier:
                            continue
                        score = scores.setdefault(identifier, {
                            "runs": 0,
                            "balls": 0,
                            "fours": 0,
                            "sixes": 0,
                        })
                        runs = delivery.get("runs", {}).get("batter", 0)
                        score["runs"] += runs
                        if "wides" not in delivery.get("extras", {}):
                            score["balls"] += 1
                        if not delivery.get("non_boundary", False):
                            score["fours"] += int(runs == 4)
                            score["sixes"] += int(runs == 6)
                        for wicket in delivery.get("wickets", []):
                            dismissed_id = player_id(wicket.get("player_out", ""))
                            if dismissed_id and wicket.get("kind") != "retired hurt":
                                dismissed.add(dismissed_id)
                    if over_bowler and over_runs == 0:
                        records[over_bowler]["formats"][match_type]["maidens"] += 1

                for identifier, score in scores.items():
                    record = records.setdefault(identifier, {
                        "name": people[identifier]["name"],
                        "cricinfoIds": people[identifier]["cricinfoIds"],
                        "team": "",
                        "gender": info.get("gender", ""),
                        "formats": {format_name: empty_format() for format_name in sorted(FORMATS)},
                    })
                    batting = record["formats"][match_type]
                    is_not_out = identifier not in dismissed
                    batting["innings"] += 1
                    batting["outs"] += int(not is_not_out)
                    batting["runs"] += score["runs"]
                    batting["balls"] += score["balls"]
                    batting["high"] = max(batting["high"], score["runs"])
                    batting["centuries"] += int(score["runs"] >= 100)
                    batting["fifties"] += int(50 <= score["runs"] < 100)
                    batting["fours"] += score["fours"]
                    batting["sixes"] += score["sixes"]
                    batting["lastBattingDate"] = max(batting["lastBattingDate"], match_date)
                    batting["recent"].append({
                        "date": match_date,
                        "innings": innings_number,
                        "opponent": opponent,
                        "runs": score["runs"],
                        "notOut": is_not_out,
                        "balls": score["balls"],
                    })
                    batting["inningsLog"].append({
                        "date": match_date,
                        "opponent": opponent,
                        "venue": info.get("venue") or info.get("city") or "",
                        "innings": innings_number,
                        "runs": score["runs"],
                        "balls": score["balls"],
                        "notOut": is_not_out,
                        "fours": score["fours"],
                        "sixes": score["sixes"],
                    })
            for bowler_id in match_bowlers:
                records[bowler_id]["formats"][match_type]["bowlingMatches"] += 1

    for record in records.values():
        for batting in record["formats"].values():
            batting["average"] = round(batting["runs"] / batting["outs"], 2) if batting["outs"] else None
            batting["strikeRate"] = round(batting["runs"] * 100 / batting["balls"], 2) if batting["balls"] else None
            batting["economy"] = round(batting["runsConceded"] * 6 / batting["ballsBowled"], 2) if batting["ballsBowled"] else None
            batting["bowlingAverage"] = round(batting["runsConceded"] / batting["wickets"], 2) if batting["wickets"] else None
            batting["bowlingStrikeRate"] = round(batting["ballsBowled"] / batting["wickets"], 2) if batting["wickets"] else None
            batting["recent"].sort(key=lambda innings: (innings["date"], innings["innings"]), reverse=True)
            batting["recent"] = batting["recent"][:5]
            batting["inningsLog"].sort(key=lambda innings: (innings["date"], innings["innings"]), reverse=True)

    name_index = {
        name: sorted(identifier for identifier in identifiers if identifier in records)
        for name, identifiers in aliases.items()
        if any(identifier in records for identifier in identifiers)
    }
    initial_last_index = defaultdict(set)
    for alias, identifiers in initial_aliases.items():
        for identifier in identifiers:
            if identifier not in records:
                continue
            initial_last_index[alias].add(identifier)
    return {
        "meta": {
            "source": "Cricsheet",
            "sourceUrl": "https://cricsheet.org/downloads/",
            "license": "Open Data Commons Attribution License 1.0",
            "licenseUrl": "https://opendatacommons.org/licenses/by/1.0/",
            "playerRegisterUrl": "https://cricsheet.org/register/",
            "matchTypes": "International Test, ODI and T20 matches only",
            "dataThrough": data_through,
            "matches": dict(sorted(match_counts.items())),
            "withheldMatchesNotice": "Cricsheet withholds some Afghanistan men's and Afghanistan Premier League matches.",
        },
        "players": records,
        "nameIndex": name_index,
        "initialLastIndex": {
            name: sorted(identifiers) for name, identifiers in initial_last_index.items()
        },
    }


def write_snapshot(data, output_path):
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    temporary_path = None
    try:
        with tempfile.NamedTemporaryFile(
            mode="w",
            encoding="utf-8",
            dir=output_path.parent,
            prefix=f"{output_path.name}.",
            suffix=".tmp",
            delete=False,
        ) as output_file:
            temporary_path = Path(output_file.name)
            output_file.write(
                "window.CRICFY_CRICSHEET="
                + json.dumps(data, ensure_ascii=False, separators=(",", ":"))
                + ";\n"
            )
        temporary_path.replace(output_path)
    finally:
        if temporary_path and temporary_path.exists():
            temporary_path.unlink()


def main():
    parser = argparse.ArgumentParser(description="Build Cricfy's real batting stats from Cricsheet data.")
    parser.add_argument("--archive", help="Use an already downloaded all_json.zip archive.")
    parser.add_argument("--people-csv", help="Use a local Cricsheet people.csv file.")
    parser.add_argument("--names-csv", help="Use a local Cricsheet names.csv file.")
    parser.add_argument(
        "--output",
        default=str(Path(__file__).resolve().parents[1] / "assets" / "data" / "cricsheet-stats.js"),
    )
    args = parser.parse_args()

    with tempfile.TemporaryDirectory() as temporary_directory:
        temporary_path = Path(temporary_directory)
        archive_path = Path(args.archive) if args.archive else temporary_path / "all_json.zip"
        if not args.archive:
            download(ARCHIVE_URL, archive_path)
        people_rows = load_csv(PEOPLE_URL, args.people_csv)
        name_rows = load_csv(NAMES_URL, args.names_csv)
        data = build(archive_path, people_rows, name_rows)

    data["meta"]["generatedAt"] = datetime.datetime.now(datetime.timezone.utc).isoformat()
    output_path = Path(args.output)
    write_snapshot(data, output_path)
    print(
        f"Wrote {len(data['players']):,} players and {sum(data['meta']['matches'].values()):,} matches "
        f"through {data['meta']['dataThrough']} to {output_path}"
    )


if __name__ == "__main__":
    main()
