import unittest
import json
from pathlib import Path
import re


PROJECT_ROOT = Path(__file__).resolve().parents[1]


class CricfyUiFilterTests(unittest.TestCase):
    def setUp(self):
        self.script = (PROJECT_ROOT / "script.js").read_text(encoding="utf-8")
        self.html = (PROJECT_ROOT / "index.html").read_text(encoding="utf-8")
        self.css = (PROJECT_ROOT / "styles.css").read_text(encoding="utf-8")

    def test_directory_has_gender_format_and_recency_filters(self):
        self.assertIn('id="directoryGender"', self.script)
        self.assertIn('id="directoryRecency"', self.script)
        self.assertIn('record?.gender!==gender', self.script)
        self.assertIn("CURRENT_YEAR_START", self.script)
        self.assertIn("Active in ${CURRENT_YEAR}", self.script)
        self.assertIn("function directoryProfileMatchesFilters", self.script)
        self.assertIn("function updateDirectoryCountryOptions", self.script)
        self.assertIn("count===0?'disabled':''", self.script)
        self.assertIn("directoryGender').onchange=()=>{directoryVisible=48;updateDirectoryCountryOptions();renderDirectory()}", self.script)

    def test_best_xi_has_separate_gender_and_all_formats(self):
        self.assertIn('option value="male">Men', self.script)
        self.assertIn('option value="female">Women', self.script)
        self.assertIn("record.gender!==gender", self.script)
        for match_format in ("ODI", "T20", "Test"):
            self.assertIn(match_format, self.script)
        self.assertIn("RANKED SELECTION", self.script)
        self.assertIn("slice(0,6)", self.script)
        self.assertIn("This player is already selected", self.script)
        self.assertIn("function activeXiRecords", self.script)
        self.assertIn("latestBatting>=CURRENT_YEAR_START||latestBowling>=CURRENT_YEAR_START", self.script)

    def test_live_refresh_and_photo_cache_are_wired(self):
        self.assertIn("/api/refresh", self.script)
        self.assertIn("Refresh requires the Cricfy Python server.", self.script)
        self.assertIn("cricfy-photo:", self.script)
        self.assertIn("xi-player-photo", self.script)
        self.assertIn("Best XI", self.html)

    def test_player_photos_load_lazily_and_update_as_they_resolve(self):
        self.assertIn("const playerPhotoObserver=", self.script)
        self.assertIn("function updatePhotoImages", self.script)
        self.assertIn("titles.join('|')", self.script)
        self.assertIn("while(photoWorkers<4&&photoQueue.length)", self.script)
        self.assertIn(".then(src=>updatePhotoImages(name,src))", self.script)

    def test_live_provider_embeds_are_contained(self):
        self.assertIn("GOOGLE_CRICKET_LIVE_URL", self.script)
        self.assertIn("MATCHDEKHO_LIVE_URL", self.script)
        self.assertIn("matchdekho.in", self.script)
        self.assertIn("live-source-grid", self.script)
        self.assertIn('id="matchPlayerFrame"', self.script)
        self.assertIn('scrolling="no"', self.script)
        self.assertIn(".google-score-frame, .match-player-frame", self.css)
        self.assertIn("max-width: 100%", self.css.split(".google-score-frame, .match-player-frame", 1)[1])
        self.assertIn('data-page="matches"', self.html)

    def test_live_fixtures_page_is_wired_to_navigation_and_refresh(self):
        self.assertIn('data-page="matches"', self.html)
        self.assertIn('id="pageMatches"', self.html)
        self.assertIn("matches:matchesPage", self.script)
        self.assertIn("MATCHDEKHO_LIVE_URL", self.script)
        self.assertIn("GOOGLE_CRICKET_LIVE_URL", self.script)
        self.assertIn('<iframe class="google-score-frame"', self.script)
        self.assertIn('<iframe id="matchPlayerFrame"', self.script)
        self.assertIn('id="matchesFormat"', self.script)
        self.assertIn('id="matchesState"', self.script)

    def test_live_filters_show_provider_availability(self):
        self.assertIn("fetch('/api/cricket-matches'", self.script)
        self.assertIn("function updateMatchFilterOptions()", self.script)
        self.assertIn("availability unknown", self.script)
        self.assertIn("`${count} available`", self.script)
        self.assertIn("matchesLoadState==='ready'", self.script)
        self.assertIn("CRICFY_CRICKET_API_KEY", self.script)

    def test_country_flags_cover_cricsheet_countries(self):
        self.assertIn("flagHtml(match.team1)", self.script)
        self.assertIn("flagHtml(match.team2)", self.script)
        mapping_text = self.script.split("const COUNTRY_CODES={", 1)[1].split("\n};", 1)[0]
        mapped_countries = {country for country, _ in re.findall(r"'([^']+)':'([^']*)'", mapping_text)}
        data_script = (PROJECT_ROOT / "assets" / "data" / "cricsheet-stats.js").read_text(encoding="utf-8")
        dataset = json.loads(data_script.split("=", 1)[1].rstrip().rstrip(";"))
        teams = {player["team"] for player in dataset["players"].values() if player.get("team")}
        countries = {team[:-6] if team.endswith(" Women") else team for team in teams}
        self.assertLessEqual(countries, mapped_countries)
        self.assertIn("'United States':'US'", self.script)

    def test_country_flags_are_wired_across_player_views(self):
        self.assertIn("COUNTRY_CODES", self.script)
        self.assertIn("function countryFlag", self.script)
        self.assertIn("function flagHtml", self.script)
        self.assertIn("directory-card-head", self.script)
        self.assertIn("xi-country-flag", self.script)
        self.assertIn("let womenTeams=sourceTeams.filter(team=>team.endsWith(' Women'))", self.script)
        self.assertIn("countryFlag(country)", self.script)

    def test_model_accuracy_is_visible_and_uses_tolerance_hit_rate(self):
        self.assertIn("function evaluatePrototype", self.script)
        self.assertIn("Model accuracy &amp; backtest", self.script)
        self.assertIn("Model accuracy · within ±10 runs", self.script)
        self.assertIn("withinTenCount", self.script)
        self.assertIn("let modelAccuracy=evaluatePrototype('ODI','male')", self.script)

    def test_five_over_cricket_game_is_available_and_playable(self):
        self.assertIn('data-page="game"', self.html)
        self.assertIn('id="pageGame"', self.html)
        self.assertIn("function gamePage()", self.script)
        self.assertIn("game:gamePage", self.script)
        self.assertIn("if(page==='game')", self.script)
        self.assertIn("balls>=GAME_OVERS*6", self.script)
        self.assertIn("gameState.wickets>=10", self.script)
        self.assertIn("shot===bowlerShot", self.script)
        self.assertIn('data-game-shot="${shot}"', self.script)
        self.assertIn(".game-arena", self.css)

    def test_game_supports_selected_bowler_and_replay(self):
        self.assertIn('id="gameBowler"', self.script)
        self.assertIn("function gameBowlerNames()", self.script)
        self.assertIn("gameState.bowler", self.script)
        self.assertIn("if(player===bowler)", self.script)
        self.assertIn('id="gameReplay"', self.script)
        self.assertIn("$('gameReplay').onclick=startCricketGame", self.script)
        self.assertIn(".game-bowler-chip", self.css)

    def test_developer_photo_has_responsive_local_image_and_fallback(self):
        photo = PROJECT_ROOT / "assets" / "images" / "ram-krishna-sarkar.jpeg"
        self.assertTrue(photo.is_file())
        self.assertIn('src="./assets/images/ram-krishna-sarkar.jpeg"', self.script)
        self.assertIn("this.src=getFallback('Ram Krishna Sarkar')", self.script)
        self.assertIn(".about-me-photo", self.css)
        self.assertIn(".about-linkedin-photo { width: 72px; height: 72px;", self.css)

    def test_desktop_navigation_does_not_overlap_player_search(self):
        self.assertIn("flex: 1 1 0;", self.css)
        self.assertIn("overflow-x: auto;", self.css)
        self.assertIn("flex: 0 0 190px;", self.css)

    def test_team_analysis_lists_dataset_countries_with_flags(self):
        self.assertIn("function teamPage()", self.script)
        self.assertIn("Object.values(CRICFY_CRICSHEET.players).map(record=>record.team)", self.script)
        self.assertIn("countryFlag(team)", self.script)
        self.assertIn("flagHtml(players[name].team)", self.script)

    def test_feedback_and_support_links_are_wired(self):
        self.assertIn("https://www.linkedin.com/in/rksarkar/", self.script)
        self.assertIn("tel:+917085391047", self.script)
        self.assertIn("https://wa.me/917085391047", self.script)
        self.assertIn('id="feedbackForm"', self.script)
        self.assertIn("https://formsubmit.co/ajax/ramkrishnasarkar820@gmail.com", self.script)
        self.assertIn("_subject:'New Cricfy.iq feedback'", self.script)
        self.assertNotIn("localStorage.setItem('cricfy-feedback'", self.script)
        self.assertIn("whatsapp-icon", self.script)
        self.assertIn("linkedin-icon", self.script)
        self.assertIn("https://www.youtube.com/@Ramkrishna28005", self.script)
        self.assertIn("youtube-icon", self.script)


if __name__ == "__main__":
    unittest.main()
