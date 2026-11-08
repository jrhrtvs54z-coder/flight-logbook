// Runs the logbook's pure logic (the LOGIC block inside index.html) against known cases.
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const block = html.split("/*LOGIC-START*/")[1].split("/*LOGIC-END*/")[0];
const L = new Function(block + "\nreturn Logic;")();

let n = 0;
const t = (name, fn) => { fn(); n++; console.log("ok -", name); };

const settings = { startPage: 23, rowsPerPage: 15, bf: { c1: 300.0, c3: 50.5, c4: 40.2, c6: 10.0, c7: 400.7, c8: 340.2, c14: 380.1 } };
let seq = 0;
const fl = (date, day, night, role = "solo", extra = {}) => ({ id: "f" + (++seq), date, day, night, role, type: "F/A-18", tail: "431", duty: "BFM", copied: false, pos: seq * 1024, createdAt: seq, ...extra });

t("solo flight fills (1)/(4), (7), Captain (8) and F/A-18 (14)", () => {
  assert.deepEqual(L.rowCols(fl("2026-11-08", 1.4, 0)), { c1: 14, c3: 0, c4: 0, c6: 0, c7: 14, c8: 14, c14: 14 });
  assert.deepEqual(L.rowCols(fl("2026-11-08", 0.8, 0.6)), { c1: 8, c3: 0, c4: 6, c6: 0, c7: 14, c8: 14, c14: 14 });
});
t("dual flight fills (3)/(6) and (7), no Captain time", () => {
  assert.deepEqual(L.rowCols(fl("2026-11-08", 0, 1.2, "dual")), { c1: 0, c3: 0, c4: 0, c6: 12, c7: 12, c8: 0, c14: 12 });
  assert.deepEqual(L.rowCols(fl("2026-11-08", 1.1, 0.3, "dual")), { c1: 0, c3: 11, c4: 0, c6: 3, c7: 14, c8: 0, c14: 14 });
});
t("(14) only for F/A-18 types", () => {
  for (const ty of ["F/A-18", "f/a-18", "FA-18", "F/A 18", "F/A-18D"]) assert.equal(L.isHornet(ty), true, ty);
  for (const ty of ["Hawk", "PC-21", "", "C-130"]) assert.equal(L.isHornet(ty), false, ty);
  assert.equal(L.rowCols(fl("2026-11-08", 1.0, 0, "solo", { type: "PC-21" })).c14, 0);
});
t("names: solo = SELF / blank, dual = other pilot / SELF", () => {
  assert.equal(L.captainOf({ role: "solo" }), "SELF");
  assert.equal(L.crewOf({ role: "solo" }), "");
  assert.equal(L.captainOf({ role: "dual", captain: "Maj Ali" }), "Maj Ali");
  assert.equal(L.crewOf({ role: "dual" }), "SELF");
});
t("tenths stay exact over many flights (no float drift)", () => {
  const rows = Array.from({ length: 300 }, (_, i) => fl("2026-01-01", 0.1, 0.2));
  const s = L.sumRows(rows);
  assert.equal(s.c7, 900);
  assert.equal(L.fmtT(s.c7), "90.0");
});
t("months: B/F + month = C/F, chained month to month, empty months carry B/F to C/F", () => {
  seq = 0;
  const rows = L.sortRows([
    fl("2026-11-03", 1.2, 0), fl("2026-10-30", 1.0, 0.5, "dual"), fl("2026-11-01", 0.9, 0), fl("2027-01-02", 1.1, 0), fl("2026-10-12", 1.3, 0),
  ]);
  const ms = L.buildMonths(rows, settings, "2026-10", "2027-02");
  assert.deepEqual(ms.map((m) => [m.key, m.month, m.y, m.rows.length]),
    [["2026-10", "OCT", 2026, 2], ["2026-11", "NOV", 2026, 2], ["2026-12", "DEC", 2026, 0], ["2027-01", "JAN", 2027, 1], ["2027-02", "FEB", 2027, 0]]);
  assert.deepEqual(ms[0].before, L.bfTenths(settings));
  assert.equal(ms[0].first, true);
  assert.equal(ms[1].first, false);
  for (let i = 0; i < ms.length; i++) {
    assert.deepEqual(ms[i].toDate, L.add(ms[i].before, ms[i].sum));
    if (i) assert.deepEqual(ms[i].before, ms[i - 1].toDate);
  }
  // DEC: no flights, so its C/F equals its B/F and carries into JAN
  assert.deepEqual(ms[2].sum, L.zero());
  assert.deepEqual(ms[2].toDate, ms[1].toDate);
  assert.deepEqual(ms[3].before, ms[1].toDate);
  assert.deepEqual(ms[4].toDate, L.add(L.bfTenths(settings), L.sumRows(rows)));
  assert.equal(ms[0].sum.c7, 13 + 15);
  assert.equal(ms[0].sum.c3, 10);
  assert.equal(ms[0].sum.c6, 5);
  // (7) always equals (1)+(3)+(4)+(6) for rows; Captain (8) = (1)+(4)
  const s = L.sumRows(rows);
  assert.equal(s.c7, s.c1 + s.c3 + s.c4 + s.c6);
  assert.equal(s.c8, s.c1 + s.c4);
  // No flights at all: the month still shows the totals before the app as B/F and C/F
  const none = L.buildMonths([], settings, "2026-11", "2026-11");
  assert.equal(none.length, 1);
  assert.deepEqual(none[0].before, L.bfTenths(settings));
  assert.deepEqual(none[0].toDate, L.bfTenths(settings));
  // Flights before the first month shown count into its B/F
  const later = L.buildMonths(rows, settings, "2026-11", "2026-11");
  assert.deepEqual(later[0].before, ms[1].before);
});
t("month keys step across years", () => {
  assert.equal(L.monthKey("2026-11-08"), "2026-11");
  assert.equal(L.shiftMonth("2026-12", 1), "2027-01");
  assert.equal(L.shiftMonth("2027-01", -1), "2026-12");
  assert.equal(L.shiftMonth("2026-11", 14), "2028-01");
  assert.equal(L.shiftMonth("2026-03", -15), "2024-12");
});
t("book order: by date; same date keeps the order added; new flights go last on their date", () => {
  seq = 0;
  const a = fl("2026-11-06", 1, 0), b = fl("2026-11-01", 1, 0, "solo", { copied: true }), c = fl("2026-11-06", 1.1, 0);
  const rows = L.sortRows([c, a, b]);
  assert.deepEqual(rows.map((r) => r.id), [b.id, a.id, c.id]);
  const p = L.nextPos(rows);
  assert.ok(p > c.pos);
  const d = { ...fl("2026-11-06", 0.9, 0), pos: p };
  assert.deepEqual(L.sortRows(rows.concat([d])).map((r) => r.id), [b.id, a.id, c.id, d.id]);
  // An older date sorts by its date, even when added later
  const e = { ...fl("2026-10-30", 1, 0), pos: L.nextPos(rows) };
  assert.equal(L.sortRows(rows.concat([e]))[0].id, e.id);
  assert.equal(L.nextPos([]), 1024);
  assert.equal(L.nextPos([{ id: "x", pos: 1536.5 }]), 2048);
  assert.equal(L.nextPos([{ id: "x", pos: 4096 }], "x"), 1024);
});
t("hours input: decimals, commas, blanks and bad input", () => {
  assert.deepEqual(L.parseHours("1.4", 240), { ok: true, t: 14 });
  assert.deepEqual(L.parseHours("1,4", 240), { ok: true, t: 14 });
  assert.deepEqual(L.parseHours(".5", 240), { ok: true, t: 5 });
  assert.deepEqual(L.parseHours("2", 240), { ok: true, t: 20 });
  assert.equal(L.parseHours("", 240).t, 0);
  assert.equal(L.parseHours("1.45", 240).ok, false);
  assert.equal(L.parseHours("abc", 240).ok, false);
  assert.equal(L.parseHours("1.2.3", 240).ok, false);
  assert.equal(L.parseHours("25", 240).ok, false);
  assert.deepEqual(L.parseHours("4521.7", 999999), { ok: true, t: 45217 });
});
t("dates: validation, month and day format like the book", () => {
  assert.equal(L.validISO("2026-11-08"), true);
  assert.equal(L.validISO("2026-02-30"), false);
  assert.equal(L.validISO(""), false);
  const p = L.parts("2026-11-08");
  assert.equal(p.month, "NOV");
  assert.equal(p.day, "8");
  assert.equal(L.longDate("2026-11-08"), "8 NOV 2026");
});
t("recency: last flight, last night flight, 30/90-day windows", () => {
  seq = 0;
  const rows = L.sortRows([
    fl("2026-06-01", 1.0, 0),      // 160 days before: outside 90
    fl("2026-08-20", 1.0, 0.5),    // 80 days: in 90, last night flight
    fl("2026-10-10", 1.5, 0),      // 29 days: in 30 and 90
    fl("2026-10-09", 1.0, 0),      // exactly 30 days: outside 30
    fl("2026-11-05", 1.2, 0),      // 3 days: last flight
    fl("2026-12-01", 1.0, 1.0),    // future: ignored
  ]);
  const r = L.recency(rows, "2026-11-08");
  assert.equal(r.last.date, "2026-11-05");
  assert.equal(r.sinceLast, 3);
  assert.equal(r.lastNight.date, "2026-08-20");
  assert.equal(r.sinceNight, 80);
  assert.equal(r.t30, 15 + 12);
  assert.equal(r.n30, 2);
  assert.equal(r.t90, 15 + 15 + 10 + 12);
  assert.equal(r.n90, 4);
  assert.equal(r.first.date, "2026-06-01");
});
t("monthly and yearly totals", () => {
  seq = 0;
  const rows = [fl("2026-11-01", 1.2, 0), fl("2026-11-20", 0.5, 0.9), fl("2026-10-02", 1.0, 0), fl("2025-12-31", 2.0, 0)];
  const m = L.monthly(rows, 2026);
  assert.equal(m[10].n, 2);
  assert.equal(m[10].total, 26);
  assert.equal(m[10].night, 9);
  assert.equal(m[9].total, 10);
  assert.equal(m[11].total, 0);
  const y = L.yearly(rows);
  assert.deepEqual(y.map((o) => [o.year, o.n, o.total]), [[2026, 3, 36], [2025, 1, 20]]);
});
t("chart scale is clean", () => {
  assert.deepEqual(L.niceScale(124), { step: 50, max: 150 });
  assert.deepEqual(L.niceScale(8), { step: 2, max: 8 });
  assert.equal(L.fmtTick(50, 50), "5");
  assert.equal(L.fmtTick(4, 2), "0.4");
});
t("CSV backup: header, totals before the app, rows, total to date, Excel-safe text", () => {
  seq = 0;
  const rows = [fl("2026-11-08", 1.4, 0, "solo", { duty: "=SUM(A1)" }), fl("2026-11-09", 0, 1.1, "dual", { captain: 'Maj "Ali"', copied: true })];
  const csv = L.toCSV(rows, settings).split("\r\n");
  assert.equal(csv.length, 5);
  assert.ok(csv[0].startsWith("Year,Month,Date,Type & Mark,No.,"));
  assert.ok(csv[1].startsWith(",,,,,,,Totals before the app,300.0,50.5,40.2,10.0,400.7,340.2,380.1"));
  assert.equal(csv[2], "2026,NOV,8,F/A-18,431,SELF,,'=SUM(A1),1.4,,,,1.4,1.4,1.4,No,2026-11-08");
  assert.equal(csv[3], '2026,NOV,9,F/A-18,431,"Maj ""Ali""",SELF,BFM,,,,1.1,1.1,,1.1,Yes,2026-11-09');
  assert.ok(csv[4].endsWith("Total to date,301.4,50.5,40.2,11.1,403.2,341.6,382.6,,"));
  // With a totals date, the first row names it
  assert.ok(L.toCSV(rows, { ...settings, asOf: "2026-10-31" }).split("\r\n")[1].startsWith(",,,,,,,Totals as of 31 OCT 2026,300.0,"));
});

t("date helpers: add days across months, short date", () => {
  assert.equal(L.addDays("2026-11-08", -1), "2026-11-07");
  assert.equal(L.addDays("2026-10-01", 45), "2026-11-15");
  assert.equal(L.addDays("2026-12-31", 1), "2027-01-01");
  assert.equal(L.shortDate("2026-11-08"), "8 NOV");
});
t("night currency: 45 days, warns from day 38, lapses after day 45", () => {
  seq = 0;
  const s45 = { ...settings, nightLimit: 45 };
  const rows = [fl("2026-10-01", 0.5, 0.8), fl("2026-11-05", 1.2, 0)];
  let ns = L.nightStatus(rows, s45, "2026-11-08");
  assert.equal(ns.state, "warn");
  assert.equal(ns.since, 38);
  assert.equal(ns.left, 7);
  assert.equal(ns.until, "2026-11-15");
  assert.equal(L.nightStatus(rows, s45, "2026-11-07").state, "ok");
  assert.equal(L.nightStatus(rows, s45, "2026-11-15").state, "warn");
  assert.equal(L.nightStatus(rows, s45, "2026-11-15").left, 0);
  assert.equal(L.nightStatus(rows, s45, "2026-11-16").state, "lapsed");
  // Setup date counts only until a later night flight is logged
  ns = L.nightStatus([], { nightLimit: 45, lastNightBefore: "2026-10-20" }, "2026-11-08");
  assert.equal(ns.state, "ok"); assert.equal(ns.source, "setup"); assert.equal(ns.since, 19);
  ns = L.nightStatus(rows, { nightLimit: 45, lastNightBefore: "2026-09-01" }, "2026-11-08");
  assert.equal(ns.last, "2026-10-01"); assert.equal(ns.source, "app");
  assert.equal(L.nightStatus([], {}, "2026-11-08").state, "none");
  assert.equal(L.nightStatus([], {}, "2026-11-08").limit, 45);
});
t("copy list: flights not yet copied, oldest first, no totals", () => {
  seq = 0;
  const rows = L.sortRows([fl("2026-11-05", 1, 0), fl("2026-11-01", 1, 0, "solo", { copied: true }), fl("2026-10-28", 1, 0)]);
  assert.deepEqual(L.copyList(rows).map((id) => rows.find((r) => r.id === id).date), ["2026-10-28", "2026-11-05"]);
  assert.deepEqual(L.copyList(rows.map((r) => ({ ...r, copied: true }))), []);
});
t("duplicate check: same date and hours, same or missing tail", () => {
  seq = 0;
  const rows = [fl("2026-11-08", 1.3, 0, "solo", { tail: "431" })];
  assert.ok(L.findDuplicate(rows, { date: "2026-11-08", tail: "431", day: 1.3, night: 0 }));
  assert.ok(L.findDuplicate(rows, { date: "2026-11-08", tail: "", day: 1.3, night: 0 }));
  assert.ok(L.findDuplicate(rows, { date: "2026-11-08", tail: " 431 ", day: 0.9, night: 0.4 }));
  assert.equal(L.findDuplicate(rows, { date: "2026-11-08", tail: "435", day: 1.3, night: 0 }), null);
  assert.equal(L.findDuplicate(rows, { date: "2026-11-08", tail: "431", day: 1.2, night: 0 }), null);
  assert.equal(L.findDuplicate(rows, { date: "2026-11-07", tail: "431", day: 1.3, night: 0 }), null);
});
t("one-tap choices: most used first, then most recent; hours fill to 8 and sort", () => {
  seq = 0;
  const rows = [
    fl("2026-11-01", 1.3, 0, "solo", { tail: "431", duty: "BFM" }),
    fl("2026-11-02", 1.3, 0, "solo", { tail: "435", duty: "ACM" }),
    fl("2026-11-03", 1.1, 0, "solo", { tail: "431", duty: "BFM" }),
    fl("2026-11-04", 0.7, 0.5, "solo", { tail: "438", duty: "CAS" }),
  ];
  assert.deepEqual(L.topValues(rows, (r) => r.tail, 8), ["431", "438", "435"]);
  assert.deepEqual(L.topValues(rows, (r) => r.duty, 2), ["BFM", "CAS"]);
  const h = L.hourChips(rows, 8);
  assert.equal(h.length, 8);
  assert.deepEqual(h, [...h].sort((a, b) => a - b));
  for (const v of [13, 11, 12]) assert.ok(h.includes(v), "includes " + v);
  assert.deepEqual(L.hourChips([], 8), [9, 10, 11, 12, 13, 14, 15, 16]);
});

t("typed answers reuse the logbook's spelling; shortcuts filter as you type", () => {
  assert.equal(L.matchKnown("bfm", ["BFM", "CAS"]), "BFM");
  assert.equal(L.matchKnown("  night   intcp ", ["Night INTCP"]), "Night INTCP");
  assert.equal(L.matchKnown("DACT", ["BFM"]), "DACT");
  assert.equal(L.matchKnown("", ["BFM"]), "");
  assert.deepEqual(L.filterChips(["441", "429", "438", "435", "431"], "43"), ["438", "435", "431"]);
  assert.deepEqual(L.filterChips(["BFM", "CAS", "ACM", "Night INTCP"], "c"), ["CAS", "ACM", "Night INTCP"]);
  assert.deepEqual(L.filterChips(["0.9", "1.0", "1.3"], "1."), ["1.0", "1.3"]);
  assert.deepEqual(L.filterChips(["A", "B"], ""), ["A", "B"]);
});

t("day and night shortcuts: learned values per field, topped up, sorted", () => {
  seq = 0;
  const rows = [fl("2026-11-01", 1.3, 0), fl("2026-11-02", 1.3, 0), fl("2026-11-03", 0.9, 0.4), fl("2026-11-04", 0, 1.4)];
  const day = L.tenthChips(rows, (r) => L.toT(r.day), 7, [12, 13, 11, 14, 10, 15, 9, 16, 8]);
  assert.equal(day.length, 7);
  assert.ok(day.includes(13) && day.includes(9));
  assert.deepEqual(day, [...day].sort((a, b) => a - b));
  const night = L.tenthChips(rows, (r) => L.toT(r.night), 7, [13, 12, 14, 10, 15, 5, 8]);
  assert.ok(night.includes(4) && night.includes(14));
  assert.ok(!night.includes(0));
  assert.deepEqual(L.tenthChips([], (r) => L.toT(r.night), 3, [13, 12, 14]), [12, 13, 14]);
});

console.log(`\n${n} checks passed`);
