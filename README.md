# Flight Logbook

A personal digital flight logbook, built as a single-page Claude artifact. It mirrors a paper military logbook (the Flying page and the Details page, Section 4) and is used as the day-to-day working log. The paper book stays the official record; the app shows exactly what to write in it and does the math.

## Features

- **Add flight, step by step:** jet → duty → day hours → night hours → captain (only if Dual) → save. Answers are typed, with one-tap shortcuts that learn your usual jets, duties, hours and names. Solo / Dual can be switched on both hours steps. The date opens a calendar directly.
- **Book by month:** one month at a time, like a paper page. Total brought forward (B/F) on the top line, the month's flights in date order, then the month's total (in red) and Total carried forward (C/F). Every month can be opened, including empty and future ones; a month without flights carries its B/F straight to C/F. On a phone, swipe between the Flying and Details pages.
- **Copy to book:** the flights not yet written in the paper book, oldest first, one at a time in large type. Tick each line once it is copied.
- **Night currency:** 45-day limit by default, warns from day 38. Stats shows the days left and the date to fly at night by.
- **Stats:** days since the last flight and last night flight, hours in the last 30 and 90 days, logbook totals, hours by month and by year.
- **Setup:** logbook totals as of a date (the app blocks earlier dates so nothing is counted twice), night currency settings, default Type & Mark, and 7 themes (Ledger, Logbook Paper, Cockpit, Night Ops, Desert, Clean, Sunlight).
- **Backup:** CSV (opens in Excel) or full JSON.

## How the columns are filled

| Situation | Columns |
|---|---|
| Solo (only you aboard) | Day → (1), Night → (4), Total (7), Captain (8). Captain = SELF, Crew blank. |
| Dual (anyone else aboard) | Day → (3), Night → (6), Total (7). Captain = the other pilot, Crew = SELF. |
| F/A-18 | Total also goes in (14). |
| Not used | (2), (5), (9)–(13) |

Hours are decimal tenths (1.4). All math is done in whole tenths, so totals never drift.

## Data and privacy

No flight data is stored in this repository. The app saves each user's logbook privately in their own Claude account (artifact storage under `data/users/<user id>/`: a `settings` document plus one document per year, such as `y2026`). Only the signed-in owner can read it, even if the app link is shared.

## Project layout

```
index.html               The whole app: HTML, CSS and JavaScript in one file.
tests/logic.test.mjs     Tests for the pure logic block in index.html.
docs/spec.md             The full spec: rules, screens and design decisions.
```

The pure logic (column rules, month totals, night currency, CSV, hours parsing) sits between `/*LOGIC-START*/` and `/*LOGIC-END*/` in `index.html`, so it can be tested without a browser.

## Run the tests

Needs Node 18 or newer. No packages to install.

```
npm test
```

or `node tests/logic.test.mjs`.

## Publishing

The live app is a Claude artifact. To release a change, publish `index.html` as the artifact's `index.html`. The app uses the artifact runtime's `db`, `user` and `downloads` capabilities, so it only saves data when opened inside Claude while signed in.
