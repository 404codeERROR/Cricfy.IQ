# Cricfy.iq

## Cricket Player Performance Analysis and Prediction System

**A Mini Project Report**

Submitted by: **Ram Krishna Sarkar**  
Department: **Computer Science and Engineering**  
Institution: **Adamas University**  
Academic Year: **2026**

---

## Abstract

Cricfy.iq is a browser-based cricket analytics application that presents batting and bowling information for international Test, ODI, and T20 formats. The project addresses unreliable and synthetic statistics by generating a local data snapshot from Cricsheet international match records. It provides player directory browsing, men/women and country filtering, 2026 active-player filtering, multi-player comparison, recent innings, bowling metrics, team analysis, player photography, Best XI construction, and transparent prediction estimates.

The frontend is implemented using HTML, CSS, and JavaScript with Chart.js for visualization. Python standard-library scripts build and refresh the source dataset. Unit tests verify batting, bowling, recency, women's coverage, UI filters, image caching, and live-refresh wiring.

The system is an educational analytics prototype. It does not claim direct ESPNcricinfo integration, live-score access, or a validated predictive model.

## 1. Introduction

Cricket analysis normally combines match totals, batting averages, strike rates, bowling economy, recent form, and opponent conditions. Presenting these values through an interactive dashboard makes it easier for users to compare players and understand form without searching separate records.

The original project used synthetic or hard-coded values for some players. These values could not be described as genuine match statistics. The current implementation replaces them with records derived from a Cricsheet international match archive and clearly displays unavailable values instead of fabricating data.

## 2. Problem Statement

The project was required to provide:

- Player information for India and other cricket countries
- Separate men's and women's views
- All supported formats
- Correct batting statistics
- Bowling wickets and averages
- Recent player performance
- Player comparison and Best XI selection
- Player images
- Clear source and coverage information
- Automated testing and documentation

A major challenge was data authenticity. ESPNcricinfo access was blocked in the project environment, so Cricsheet was used as the documented alternative source.

## 3. Objectives

1. Build an accessible web-based cricket analytics dashboard.
2. Represent international Test, ODI, and T20 records consistently.
3. Separate male and female player records.
4. Remove fabricated player statistics and recent-form values.
5. Support country and format filters.
6. Show bowling metrics such as wickets, economy, and average.
7. Rank current players for a gender-, country-, and format-specific Best XI.
8. Provide player photos with a dependable fallback.
9. Include an auditable refresh process.
10. Test and document the complete system.

## 4. Scope

### Included

- Player search and A-Z directory
- Men's and women's teams
- Country filtering
- 2026 recency filtering
- Batting and bowling tables
- Player and team analysis
- Up to six-player comparison
- Top-four role alternatives in Best XI
- CSV export
- Prediction baseline and backtesting metrics
- Live local refresh workflow

### Excluded

- Real-time scores
- Live television or video streaming
- Betting or match-gambling features
- Cloud deployment
- A certified machine-learning prediction model

## 5. System Analysis

### 5.1 Existing Approach

An earlier or purely static approach can use hard-coded player cards and manually prepared statistics. This approach is difficult to maintain and risks mixing fictional values with real records.

### 5.2 Proposed Approach

The proposed approach downloads Cricsheet's all-match JSON archive, filters it to international Test, ODI, and T20 matches, combines it with player-register name aliases, and writes a local JavaScript snapshot.

The frontend reads the snapshot instead of generating fake random values. When no record exists, the interface displays `—` or **No recorded innings**.

## 6. System Architecture

```text
Cricsheet Archive + Player Register
              |
              v
build_cricsheet_stats.py
              |
              v
cricsheet-stats.js
              |
              v
Browser script.js
              |
              v
HTML/CSS Interface + Chart.js
```

The live server wraps the same builder in a local HTTP API:

```text
Browser Refresh Button
          |
          v
POST /api/refresh
          |
          v
Live Python Server
          |
          v
Regenerate and reload dataset
```

## 7. Implementation

### 7.1 Data Generation

`build_cricsheet_stats.py`:

- Downloads Cricsheet JSON and player-register CSV files.
- Filters on `team_type = international`.
- Supports Test, ODI, and T20.
- Excludes domestic and club matches.
- Processes batter runs, balls, dismissals, fours, and sixes.
- Processes bowler deliveries, runs conceded, wickets, maidens, economy, average, and strike rate.
- Stores the last batting and bowling date for recency filtering.
- Creates normalized name and initial-surname indexes.

### 7.2 Frontend

The main frontend is implemented in `index.html`, `styles.css`, and `script.js`.

It includes:

- Responsive navigation
- Search
- Player modal
- Comparison cards
- Chart.js visualizations
- Directory filters
- Gender filters
- Format selectors
- Bowling table
- Best XI interface
- CSV export
- Player photo cache

### 7.3 Men and Women Handling

The Cricsheet player records include `male` or `female` gender metadata. Both directory filtering and Best XI ranking use this metadata to prevent mixed-gender pools.

### 7.4 Player Recency

Each format keeps `lastBattingDate` and `lastBowlingDate`. The application considers 2026 matches for "active in 2026" selections and excludes archived-only players from current XI rankings.

### 7.5 Player Images

The application:

1. Uses a manually stored player image when available.
2. Queries Wikipedia page images for the player's name.
3. Tries cricket-qualified title variants.
4. Stores successful photo URLs in browser local storage.
5. Displays an SVG initials portrait if no image is available.

This is more dependable than a single external avatar service and avoids broken-image output.

### 7.6 Prediction Prototype

The browser prediction baseline uses the average of the latest two recorded innings. The UI adds optional batting-position and pitch-condition adjustments. The Prediction screen also reports backtested prototype metrics.

Evaluation is chronological. Earlier innings are used to forecast later innings; the process is reported separately for gender and format.

## 8. Technology Stack

| Technology | Purpose |
|---|---|
| HTML5 | Page structure |
| CSS3 | Responsive interface |
| JavaScript | Application logic and filtering |
| Chart.js | Data visualization |
| Python | Data generation and local refresh |
| unittest | Automated tests |
| Cricsheet | Match and player-register data |
| Wikipedia | Optional player images |

## 9. Testing

### 9.1 Data Tests

The unittest suite verifies:

- Real innings aggregation
- Not-out handling
- Caught dismissal handling
- Domestic match exclusion
- Batting average and strike rate
- Bowling wickets and conceded runs
- Economy and bowling average
- Last batting and bowling dates
- Women's snapshot coverage
- Men's snapshot coverage

### 9.2 UI Tests

The UI test suite checks that:

- Gender filters exist
- Recency filters exist
- ODI, T20, and Test options exist
- Men's and women's XI pools are separated
- Live refresh is wired
- Photo caching is wired
- XI photo markup is present

### 9.3 Test Command

```powershell
python -m unittest discover -s tools -p "test_*.py" -v
```

## 10. Results

The implemented system provides:

- 8,419 Cricsheet-identified player records
- International Test, ODI, and T20 formats
- Separate men's and women's filters
- Country selection for all represented cricket teams
- 2026 active-player selection
- Batting and bowling tables
- A-Z directory ordering
- Player photos or initials fallbacks
- Top-four Best XI alternatives
- Source refresh workflow
- Documented testing results

## 11. Data and Image Limitations

- Cricsheet records may not include every ESPNcricinfo career match.
- Cricsheet withholds some Afghanistan men's and Afghanistan Premier League matches.
- Totals are complete only for source matches represented in the archive.
- Player-register names can contain abbreviations or duplicate names.
- Wikipedia can reject requests or omit a player's image.
- Image availability does not affect the correctness of statistics.

## 12. Future Scope

- Direct licensed data-provider integration
- Daily scheduled refresh
- A trained and validated machine-learning model
- Larger chronologically complete prediction training sets
- Local image assets for all frequent players
- Cloud database and hosting
- Authentication and saved teams
- Mobile application packaging
- Automatic testing in CI/CD

## 13. Conclusion

Cricfy.iq successfully converts a static cricket mini-project concept into a data-backed analytics application. It removes fabricated batting and recent-form values, separates men and women, supports all Cricsheet formats and represented countries, and adds bowling metrics and a 2026-current XI builder.

The application remains a transparent educational prototype. Its prediction output is not a match result, and its statistics should be interpreted within the stated Cricsheet coverage limitations.

## 14. References

- Cricsheet: https://cricsheet.org/
- Cricsheet Downloads: https://cricsheet.org/downloads/
- Cricsheet Player Register: https://cricsheet.org/register/
- Cricsheet Licensing: https://cricsheet.org/licensing/
- Open Data Commons Attribution License: https://opendatacommons.org/licenses/by/1.0/
- Chart.js: https://www.chartjs.org/
- Wikipedia API: https://en.wikipedia.org/w/api.php

---

**Student:** Ram Krishna Sarkar  
**Project:** Cricfy.iq Cricket Analytics
