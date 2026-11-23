# Cricfy.iq Project Documentation

**Project:** Cricfy.iq - Cricket Player Performance Analysis and Prediction System  
**Developer:** Ram Krishna Sarkar  
**Version:** 1.0  
**Last Updated:** November 2026

## 1. Introduction

Cricfy.iq is a responsive web application for reviewing international cricket batting and bowling records, comparing players, constructing gender-specific best XI selections, viewing recent player form, and exploring transparent prediction estimates.

The application uses a locally generated snapshot derived from Cricsheet international ball-by-ball data. It does not claim to be a direct ESPNcricinfo API or live-score service.

## 2. Requirements

### 2.1 System Requirements

- Windows, macOS, or Linux computer
- Modern web browser
- Internet connection for player photo lookup
- Python 3.10 or newer
- Optional: Visual Studio Code with Live Server

### 2.2 Data License

Cricsheet match data is distributed under the Open Data Commons Attribution License 1.0. The application and source documentation should retain Cricsheet and licensing attribution.

## 3. Installation

1. Open the `Cricfy.IQ` project folder.
2. Confirm that `index.html`, `script.js`, `styles.css`, and `assets/data/cricsheet-stats.js` are present.
3. Open `index.html` directly in a browser, or run:

```powershell
python tools\live_server.py
```

4. Open `http://127.0.0.1:8000/index.html`.

## 4. Application Screens

### Home

The Home screen provides quick access to player profiles and an overview of the available modules.

### Player Analysis

Select a player and cricket format to view:

- Matches
- Runs
- Batting average
- Strike rate
- Highest score
- Recent five innings
- Performance chart

### Player Comparison

Add up to six players and compare:

- Runs
- Batting average
- Strike rate
- Highest score
- Matches
- Centuries and fifties
- Fours and sixes
- Latest innings

The format selector updates ODI, T20, and Test values together.

### Team Analysis

Select a national team to view its listed players, roles, images, batting totals, averages, and recent form.

### Statistics

The Statistics screen contains:

- A sortable player batting table
- A cricket-format selector
- A player-name filter
- CSV export
- A bowling table with wickets, balls, economy, average, strike rate, and maidens
- A live-data refresh button

### Player Directory

The directory is derived from every player represented in the local Cricsheet snapshot. It supports:

- A-Z sorting
- Country filtering
- Men's/women's filtering
- Format filtering
- Current-calendar-year active-player filtering
- Name and description search
- Runs, average, and recent-form sorting
- Pagination through Load More

### Best XI Builder

The Best XI builder uses separate men and women pools. For each selected gender, country, and format, it:

1. Filters out players without records in the selected format.
2. Excludes players inactive in the current calendar year.
3. Scores candidates using batting runs, average, strike rate, recent innings, wickets, balls bowled, and economy.
4. Selects one player for each cricket role.
5. Offers a top-four alternative dropdown for every slot.
6. Displays a player photo or initials fallback beside the selection.

### Prediction

The Prediction page is a clearly labeled prototype:

- The default estimate uses the mean of the two latest recorded innings.
- Batting position and pitch conditions are optional heuristic adjustments.
- Chronological backtesting provides MAE, RMSE, R², and ±10-run accuracy.
- It does not predict match results or guarantee a future score.

### About

The About page identifies the developer, project purpose, data source, coverage limitations, and portfolio link.

## 5. Live Data Refresh

The static `index.html` version works through a local data file. To refresh that file from Cricsheet:

```powershell
python tools\live_server.py
```

Open `http://127.0.0.1:8000/index.html`. The server checks the Cricsheet snapshot in the background and rebuilds it when it is more than seven days old. New players are included once they appear in Cricsheet's archive and player register. The browser checks the snapshot version and reloads after an update.

Use **Refresh live data** in the Directory or Statistics screen to force an immediate rebuild. The refresh server:

1. Receives `POST /api/refresh`.
2. Runs `tools/build_cricsheet_stats.py`.
3. Downloads the Cricsheet archive and player registers.
4. Rebuilds `assets/data/cricsheet-stats.js` using an atomic file replacement.
5. Reloads the browser after a manual refresh, or when the version monitor detects an automatic update.

The Live & Fixtures page requests current matches and scores every two minutes while open. Provider availability and supported formats depend on the configured CricketData API key and plan. Automatic Cricsheet refresh requires the Python server; a static-only server cannot run the builder.

## 6. Player Images

The application first tries the Wikipedia page image associated with a player. If no suitable image is found or an external image request fails, it displays an in-app SVG initials portrait.

Successfully found player photos are cached in browser local storage for faster reuse. An initials fallback prevents broken-image icons.

## 7. Data and File Structure

```text
Cricfy.IQ/
├── index.html
├── styles.css
├── script.js
├── README.md
├── PROJECT_DOCUMENTATION.md
├── PROJECT_REPORT.md
├── tools/
│   ├── build_cricsheet_stats.py
│   ├── live_server.py
│   ├── test_build_cricsheet_stats.py
│   └── test_ui_filters.py
└── assets/
    ├── data/
    │   └── cricsheet-stats.js
    └── images/
```

## 8. Testing

Run all tests from the project folder:

```powershell
python -m unittest discover -s tools -p "test_*.py" -v
```

Tests cover:

- Real innings calculation
- Not-out and dismissal handling
- Domestic match exclusion
- Batting averages and strike rates
- Bowling wickets, economy, and average
- Last-played recency dates
- Women's and men's snapshot coverage
- Gender, format, recency, live-refresh, and photo-cache wiring

## 9. Troubleshooting

### Player photo does not appear

The app uses an initials fallback. Verify internet access and Wikipedia availability. A fallback is not a missing-image bug.

### Live refresh does not work

Use `http://127.0.0.1:8000/index.html`, not `file:///`, and keep `live_server.py` running.

### Player format shows unavailable

`—` means Cricsheet has no matching innings or bowling record in that format. It is not replaced with a zero or invented estimate. New players appear after Cricsheet includes them in the match archive and player register and the snapshot refresh completes.

### Player is missing from Best XI

Best XI excludes a player if the player has no selected-format record or was inactive in the current calendar year.

## 10. Known Limitations

- The source snapshot is not a direct ESPNcricinfo feed.
- Coverage depends on the Cricsheet archive and player register.
- Older career totals may be incomplete.
- Wikimedia photos can be unavailable or rate-limited.
- Predictions are prototype estimates, not validated match predictions.
- Automatic statistics refresh requires the Python server and internet access; the bundled snapshot remains usable if refresh fails.
- Live scores require a configured CricketData API key and internet access.
