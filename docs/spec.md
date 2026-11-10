# Flight Logbook: spec

## Purpose
- Main working log. The paper logbook stays the official record (the squadron checks it); the app shows exactly what to write in it, flight by flight.
- Does the math for each flight's columns and keeps running totals by month (Total brought forward, the month, Total carried forward), keeps a synced copy, shows stats.
- Starts from the day it is set up. Old flights are not entered; the logbook totals as of a date are entered once in Setup.
- One user for now; built so it can be shared later (each person gets a private logbook).

## Paper book it mirrors
- Flying page: Year (Month, Date) | Aircraft (Type & Mark, No.) | Captain or 1st Pilot | Co-Pilot / 2nd Pilot / Pupil or Crew | Duty
- Details page (Section 4): Day (1) 1st Pilot, (2) 2nd Pilot, (3) Dual | Night (4) 1st Pilot, (5) 2nd Pilot, (6) Dual | Flight time (7) Total cols 1-6, (8) Captain | Instrument flying (9) Sim, (10) Act | I/F approaches (11) Type, (12) No. | Spare (13), (14)
- The paper book has 15 flight lines per page with page totals. The app does not track paper pages; the pilot adds up the paper page totals.
- Flights are copied from the app into the book at month end, before the book is checked or signed.

## Rules
| Item | Rule |
|---|---|
| Role | Solo = only the pilot aboard. Dual = anyone else aboard, including a 1st-pilot flight with someone in the back. |
| Hours | Decimal tenths (e.g. 1.4). Day and night are entered separately. No takeoff/landing times. |
| (1) / (4) | Solo day / night hours |
| (3) / (6) | Dual day / night hours |
| (7) Total | Day + night |
| (8) Captain | Solo hours only |
| (14) | F/A-18 hours, any role. Type is written "F/A-18". |
| Not used | (2), (5), (9), (10), (11), (12), (13) |
| Names | Solo: Captain = SELF, Crew blank. Dual: Captain = the other pilot (instructor), Crew = SELF. |
| Duty | Mission only (e.g. BFM). Landings are not logged. |
| Date | Month as "NOV", date as "8"; year at the top of the page. |
| Night currency | Lapses after 45 days without a night flight; warns 7 days before (from day 38). |
| Setup totals date | The setup totals are "as of" a date: they include every flight up to the end of that day. Flights in the app must be after it (earlier dates are blocked so nothing is counted twice). |
| App layout | By month, one month at a time. B/F on the top line; month total and C/F at the bottom. Every month from the first month in the app can be opened, empty ones included, with no limit ahead. A month without flights carries its B/F straight to C/F (e.g. no flying in DEC: JAN B/F = NOV C/F). No page or line numbers in the app. |
| Month totals colour | The month's totals row (label and numbers, both sides) is red, a readable red in every theme (at least 5:1 contrast). B/F and C/F stay in normal ink. |

## Screens
- **Book:** a row pinned under the header holds the Flying page | Details page switch and the "+ Add flight" button. One month at a time, opening on this month. Top: ‹ NOV › with the year above it and a line like "4 flights · 4.7 h · 4 still to write". "Go to this month" appears when another month is on screen. ‹ goes back as far as the first month in the app (the month the setup totals stop in, or the earliest flight if earlier); › has no limit. Tapping the month lists every month, newest first, with hours, flights and "N to copy" or "Copied". If the totals date is missing, a banner asks for it.
- **Month table:** B/F on the top line; the month's flights in date order (same date: in the order added), or "No flights"; then the month total (red) and C/F. In the first month, B/F is labelled "Total brought forward · as of 31 AUG"; a mid-month totals date shows "AUG 2026 · from 16 AUG". Each line has a copy tick (empty circle = still to write, ✓ = copied). On a phone, swipe left for Details and right for Flying (a wide table scrolls sideways first); side by side on wide screens. "Mark the rest of NOV as copied" ticks the month's remaining lines.
- **Add flight:** one question per screen with the keyboard open: Which jet? → Duty? → Day hours? → Night hours? → Captain (only if Dual) → Save. Solo / Dual switch on both hours screens; switching to Dual on the night screen turns Save into Next. Day and Night offer 0.0 first; both can't be 0.0. Learned shortcuts filter as you type; typed answers reuse the logbook's spelling ("bfm" → BFM). The date (top left) opens the calendar; future dates and dates covered by the setup totals are blocked. After saving: "Saved · 8 NOV" with Undo for 6 seconds. "All fields" opens the one-screen form. The button follows the month on screen: in an earlier month it reads "+ Add to OCT" and the first step is "Which day in OCT 2026?", the month's days to tap (a dot marks days that already have a flight; days after today or covered by the setup totals can't be picked; the week starts on the phone region's first day), then the usual steps, and the Book stays on that month. In this month or a future one the date is today.
- **Edit flight:** tap a line. One screen: date calendar, Aircraft No. and Duty buttons (+ Other…), Day and Night hours buttons (0.0 first, + Other…), Solo / Dual (Dual shows Captain names), Type & Mark and "already copied" under More options, Delete with confirmation. A copied line shows a note to fix the paper book too.
- **Duplicate check:** same date and hours (and same or missing tail) asks before saving ("Save anyway").
- **Copy to book:** flights not yet copied, oldest first, one at a time ("Flight 1 of 6", the date, Flying entries, then Details numbers), then "Copied, next line". No page numbers or totals.
- **Night currency:** amber banner on Book in the last 7 days; red when lapsed. Setup holds the limit and the last night flight before the app (used until a night flight is logged in the app).
- **Stats:** a full-width "Night currency due in" tile (days left, "Fly at night by 15 NOV 2026", ✓ Current / ! Due soon / ✕ Lapsed), days since last flight and last night flight, hours in the last 30 and 90 days, logbook totals (setup totals + all flights), hours by month (chart + table) and by year. Stats count only flights in the app.
- **Setup:** "Totals as of" date (required, not in the future, before the first flight in the app) + totals (1), (3), (4), (6), (7), (8), (14), with (7) checked against (1)+(3)+(4)+(6); night currency limit and last night flight before the app; default Type & Mark; Theme; Backup.
- **Themes:** Ledger (default, follows light/dark), Logbook Paper, Cockpit, Night Ops, Desert, Clean (follows light/dark), Sunlight. Applied at once, remembered on the device and saved in settings so other devices follow.

## Two versions
- **Home-screen app (GitHub Pages):** installed from Safari (Share → Add to Home Screen). No account, no server: the logbook stays on the phone in the app's own storage (`localStorage` key `logbook.data.v1`, same document layout as below under `data/users/phone/`). Works offline after the first open (service worker: page fetched fresh when online, saved copy offline; fonts and icons cached). Removing the app deletes its data, so back up monthly. On iPhone the home-screen app and Safari keep separate data; Setup shows an install note while it runs in Safari.
- **Claude artifact:** saved in the user's Claude account (below). The icon, manifest and offline worker are only switched on in the home-screen app.
- The two keep separate data; move between them with a backup.

## Storage
- Artifact storage in the user's Claude account, under `data/users/<user id>/`: a `settings` document (totals, totals date `asOf`, night currency, defaults, theme `look`) and one document per year (`y2026`) holding that year's flights in a `flights` map.
- Writes are merged per flight; deletes are tombstones (`deleted: true`). Optimistic local update, then the server snapshot.
- Older settings may also hold `startPage` and `rowsPerPage` from the earlier page-based version; they are kept but unused.

## Backup and restore
- **Back up now:** the full backup as a JSON file (`flight-logbook-YYYY-MM-DD.json`: app "Flight Logbook", format 1, settings and every flight). On the phone it opens the share sheet (Save to Files, iCloud Drive).
- **Copy backup as text:** the same backup on the clipboard; if copying isn't allowed, it is shown in a box to select and copy by hand.
- **Restore a backup:** paste the text or choose the file → summary (date made, flights, last flight, totals date) → "Replace with this backup". It replaces everything in this copy of the app. Also offered on the first screen before setup.
- **Export for Excel (.csv):** Year, Month, Date, Type & Mark, No., Captain, Crew, Duty, the seven columns, Copied, ISO date. First row "Totals as of …", last row "Total to date". "Copy table as text (for Excel)" copies the same table.

## Decided against
- Offline logging, month-end reminders, extra per-flight fields (notes, formation position, NVG), simulator or civil flying, past hours as yearly/monthly totals, copy-last-flight, photos of old pages, airline-style summary.
- Other Add-flight styles: one screen of buttons (kept for editing), usual-sortie cards, smart guess, type-or-say one line.
- A Day / Night / Split switch with a single hours value; Today / Yesterday date buttons.
- Paper page numbers, 15-line pages and page totals in the app (replaced by months).
- B/F at the bottom of the month; opening on the newest flight's month; listing only months with flights; going back before the first month in the app.
- Swiping to change months, or flipping like the paper book; line numbers inside a month.

## Not included yet
- Landings, instrument time, approaches.
