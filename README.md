# Flight Logbook

A personal digital flight logbook. It mirrors a paper military logbook (the Flying page and the Details page, Section 4) and is used as the day-to-day working log. The paper book stays the official record; the app shows exactly what to write in it and does the math.

**Open it:** https://jrhrtvs54z-coder.github.io/flight-logbook/

## Install

- **iPhone:** open the link in Safari → Share → Add to Home Screen → Add. Then open Logbook from your home screen.
- **Android:** open the link in Chrome → ⋮ → Add to Home screen (or Install app).

On iPhone, the home-screen app keeps its own data, separate from Safari. Install it first, then set it up or restore a backup inside the app. After the first open it also works offline.

## Move your logbook from the Claude version

1. In the Claude version, open **Setup → Copy backup as text** (or **Back up now** for a file).
2. Open Logbook from your home screen and tap **Restore a backup** (on the first screen, or later in **Setup**).
3. Paste the text, or choose the file, then tap **Next** and **Replace with this backup**.

## Privacy

The home-screen app has no account and no server. Everything you enter stays on your phone, inside the app. Removing the app from your home screen deletes that data, so use **Setup → Back up now** once a month and keep the file somewhere safe, like iCloud Drive.

This repository holds only the app's code. It has no flights, names or totals.

## Features

- **Add flight, step by step:** jet → duty → day hours → night hours → captain (only if Dual) → save. Answers are typed, with one-tap shortcuts that learn your usual jets, duties, hours and names. Solo / Dual can be switched on both hours steps. The date opens a calendar directly.
- **Book by month:** one month at a time, like a paper page. Total brought forward (B/F) on the top line, the month's flights in date order, then the month's total (in red) and Total carried forward (C/F). Every month can be opened, including empty and future ones; a month without flights carries its B/F straight to C/F. On a phone, swipe between the Flying and Details pages.
- **Copy to book:** the flights not yet written in the paper book, oldest first, one at a time in large type. Tick each line once it is copied.
- **Night currency:** 45-day limit by default, warns from day 38. Stats shows the days left and the date to fly at night by.
- **Stats:** days since the last flight and last night flight, hours in the last 30 and 90 days, logbook totals, hours by month and by year.
- **Setup:** logbook totals as of a date (the app blocks earlier dates so nothing is counted twice), night currency settings, default Type & Mark, and 7 themes (Ledger, Logbook Paper, Cockpit, Night Ops, Desert, Clean, Sunlight).
- **Backup and restore:** a backup file or text (JSON), restore by pasting or choosing the file, and a CSV export for Excel.

## How the columns are filled

| Situation | Columns |
|---|---|
| Solo (only you aboard) | Day → (1), Night → (4), Total (7), Captain (8). Captain = SELF, Crew blank. |
| Dual (anyone else aboard) | Day → (3), Night → (6), Total (7). Captain = the other pilot, Crew = SELF. |
| F/A-18 | Total also goes in (14). |
| Not used | (2), (5), (9)–(13) |

Hours are decimal tenths (1.4). All math is done in whole tenths, so totals never drift.

## Two versions, one file

`index.html` runs in two places:

- **Home-screen app (GitHub Pages):** no Claude around, so the logbook is kept in the browser's storage on the phone (`logbook.data.v1`), using the same calls the app makes to Claude's storage. The icon, manifest and offline worker are only switched on here.
- **Claude artifact:** the logbook is saved privately in the owner's Claude account (artifact storage under `data/users/<user id>/`).

The two keep separate data. Move between them with a backup.

## Project layout

```
index.html               The whole app: HTML, CSS and JavaScript in one file.
manifest.webmanifest     Home-screen app name, colours and icons.
sw.js                    Offline support for the home-screen app.
icons/                   App icons (iPhone, Android, browser tab).
.nojekyll                Tells GitHub Pages to serve the files as they are.
tests/logic.test.mjs     Tests for the pure logic block in index.html.
docs/spec.md             The full spec: rules, screens and design decisions.
```

The pure logic (column rules, month totals, night currency, backups, CSV, hours parsing) sits between `/*LOGIC-START*/` and `/*LOGIC-END*/` in `index.html`, so it can be tested without a browser.

## Run the tests

Needs Node 18 or newer. No packages to install.

```
npm test
```

## Publishing

- **Home-screen app:** GitHub Pages serves the `main` branch (Settings → Pages → Deploy from a branch → `main`, `/ (root)`). Every push to `main` goes live; the app picks it up the next time it opens online. Bump `VERSION` in `sw.js` when the icons or manifest change.
- **Claude artifact:** publish `index.html` as the artifact's `index.html`.
