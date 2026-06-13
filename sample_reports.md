# VoluLink V3 — Sample Reports & Expected Values

> **How to use this file:**  
> After importing `V3_extended_seed.sql`, open each benchmark described below, then compare every number here.  
> Tolerance: ±1 in the last digit is acceptable (rounding). A value shown as `—` means the category reference is **suppressed** (fewer than 5 facilities have a non-NULL value for that KPI — this is the min-5 rule). An own value of `NULL / nicht berechenbar` means the facility has no input for that field.  
> All passwords = **123456789**

---

## Accounts Reference

| Role | Email | Manages |
|---|---|---|
| Admin | `admin@volulink.de` | Everything |
| Federation Manager | `laubmann@volulink.de` | Laubmann Verband (Cat.1, 7 houses) |
| Federation Manager | `shanta@gmail.com` | Dhaka Conference Federation (Cat.1, 2 houses) |
| Federation Manager | `bildung@volulink.de` | Bildungswerk Verbund (Cat.5, 6 houses) |
| Facility Manager | `foyer@volulink.de` | Foyer le Pont (Cat.1, standalone) |
| Facility Manager | `saladia@volulink.de` | Hotel Saladia (Cat.1, standalone) |
| Facility Manager | `stadtmitte@volulink.de` | Stadthotel Mitte (Cat.1, **all V3 fields NULL**) |
| Facility Manager | `tagungshaus.bergfrieden@cat2.de` | Tagungshaus Bergfrieden (Cat.2) |
| Facility Manager | `jugendherberge.altstadt@cat3.de` | Jugendherberge Altstadt (Cat.3, no V3 KPIs) |
| Facility Manager | `ferienhaus.lindenhof@cat4.de` | Ferienhaus Lindenhof (Cat.4, no V3 KPIs) |
| Facility Manager | `tagungshaus.waldruh@cat2.de` | Tagungshaus Waldruh (Cat.2) |
| Facility Manager | `tagungshaus.sonnenhang@cat2.de` | Tagungshaus Sonnenhang (Cat.2) |
| Facility Manager | `tagungshaus.eifel@cat2.de` | Tagungshaus Eifel (Cat.2) |
| Facility Manager | `tagungshaus.havel@cat2.de` | Tagungshaus Havel (Cat.2) |
| Facility Manager | `vereinsheim.seepark@cat7.de` | Vereinsheim Seepark (Cat.7, no V3 KPIs) |
| Facility Manager | `vereinsheim.bergblick@cat7.de` | Vereinsheim Bergblick (Cat.7, no V3 KPIs) |
| Facility Manager | `vereinsheim.waldeck@cat7.de` | Vereinsheim Waldeck (Cat.7, no V3 KPIs) |
| Facility Manager | `glockenberg@bildung.de` | Bildungshaus Glockenberg (Cat.5, federation) |
| Facility Manager | `kinderfreizeitheim.sonne@cat6.de` | Kinderfreizeitheim Sonne (Cat.6, no V3 KPIs) |
| Facility Manager | `sportheim.rotenberg@cat7.de` | Sportheim Rotenberg (Cat.7, no V3 KPIs) |

---

## Dataset Summary

| Category | Name | Facilities | Eligible (V3) | Benchmark active | Depreciation KPI |
|---|---|---|---|---|---|
| 1 | Hotels / Tagungshotels | 19 | ✅ | ✅ | **shown** (13/19 have value) |
| 2 | Tagungshaus / Familienferienstatte | 8 | ✅ | ✅ | **suppressed** (4/8 < 5) |
| 3 | Jugendherbergen / Jugendgaestehaeuser | 8 | ❌ | ✅ | not applicable |
| 4 | Selbstversorgerhaeuser / Ferienwohnungen | 7 | ❌ | ✅ | not applicable |
| 5 | Bildungsstaetten / Seminarhaeuser | 10 | ✅ | ✅ | **suppressed** (4/10 < 5) |
| 6 | Kinder- und Jugendfreizeitheime | 7 | ❌ | ✅ | not applicable |
| 7 | Sportstaetten / Vereinsheime | 6 | ❌ | ✅ | not applicable |
| Federations | Laubmann Verband (Cat.1), Dhaka (Cat.1), Bildungswerk (Cat.5) | 3 | — | — | — |

---

## Part 1 — Facility Manager Views

### 1.1 Foyer le Pont — Category-Wide Benchmark (Cat.1, 2025)

Login: `foyer@volulink.de`  
Navigate: **Benchmark → Kategorieweiter Benchmark → Foyer le Pont → 2025**

#### Belegung & Nutzung

| Kennzahl | Eigener Wert | Median | Ø | Min | Max |
|---|---|---|---|---|---|
| Auslastung % | 57.53 | 51.74 | 51.55 | 36.95 | 60.27 |
| Übernachtungen/Bett | 210 | 188.8 | 188.2 | 134.9 | 219.99 |
| Übernachtungen/Öffnungstag | 23.01 | 29.40 | 31.05 | 22.47 | 47.95 |
| Aufenthaltsdauer (Tage) | 2.00 | 2.29 | 2.34 | 2.00 | 2.61 |

#### Erlöskennzahlen

| Kennzahl | Eigener Wert | Median | Ø | Min | Max |
|---|---|---|---|---|---|
| Umsatz/Übernachtung € | 65.00 | 64.86 | 64.27 | 60.74 | 65.11 |
| Umsatz/Bett/Öffnungstag € | 37.40 | 33.60 | 33.15 | 30.56 | 37.40 |
| ADR € | 45.81 | 42.29 | 42.15 | 0 | 45.81 |
| RevPAR € | 22.23 | 19.91 | 17.86 | 0 | 22.23 |

> ADR/RevPAR Min = 0.00 → Stadthotel Mitte has `rooms_sold = 0`.

#### Kosten & Effizienz

| Kennzahl | Eigener Wert | Median | Ø | Min | Max |
|---|---|---|---|---|---|
| Personalkostenquote % | 39.93 | 42.00 | 42.00 | 39.93 | 44.01 |
| Personalkosten/ÜN € | 25.95 | 27.26 | 27.00 | 25.60 | 28.71 |
| Energiekosten/ÜN € | 3.21 | 3.25 | 3.24 | 2.98 | 3.60 |
| Reinigungskosten/ÜN € | 4.52 | 4.48 | 4.49 | 4.24 | 4.77 |
| Gesamtkosten/ÜN € | 46.07 | 46.88 | 46.74 | 44.46 | 48.72 |
| Beköstigung/ÜN € | 8.45 | 8.38 | 8.34 | 7.79 | 9.09 |
| Wareneinsatzquote % | 13.00 | 13.00 | 13.00 | 11.99 | 14.00 |

#### Neue V3-Kostenkennzahlen

| Kennzahl | Eigener Wert | Median | Ø | Min | Max | Note |
|---|---|---|---|---|---|---|
| Abschreibungen % | 9.76 | 9.89 | 9.89 | 9.76 | 10.04 | shown (13 values) |
| Reparatur/Instandhaltung % | 4.18 | 4.39 | 4.39 | 4.18 | 4.47 | shown |
| Pacht/Miete % | 5.38 | 5.48 | 5.49 | 5.38 | 5.59 | shown |

#### Verband Gruppen/Events (V3)

| Kennzahl | Eigener Wert | Median | Ø | Min | Max |
|---|---|---|---|---|---|
| eigene Gruppen % | 62.00 | 57.50 | 58.09 | 54.55 | 62.00 |
| eigene Teilnehmer % | 20.24 | 17.16 | 17.28 | 15.12 | 20.24 |
| Stammgruppen % | 33.00 | 33.00 | 34.41 | 27.78 | 42.22 |

#### Personal je Bereich (V3)

| Bereich | €/Std | Anteil % |
|---|---|---|
| Verwaltung | 16.25 | 30.14 |
| Küche | 13.33 | 22.27 |
| Reinigung | 12.19 | 18.10 |
| Technik | 13.75 | 15.32 |
| Pädagogik | 12.69 | 15.32 |

---

### 1.2 Stadthotel Mitte — NULL-Handling Check (Cat.1, 2025)

Login: `stadtmitte@volulink.de`  
All 17 new V3 fields were left empty.

**What you must see:**
- `rooms_sold = 0` → ADR = 0, RevPAR = 0 (the facility affects the category Min for these KPIs)
- All V3 cost KPIs (Abschreibungen, Reparatur, Pacht/Miete): own value = `nicht berechenbar / NULL`
- All group KPIs: own value = `nicht berechenbar / NULL`
- All personnel KPIs: own value = `nicht berechenbar / NULL`
- The category reference columns still show (based on other facilities)

---

### 1.3 Tagungshaus Bergfrieden — Category-Wide Benchmark (Cat.2, 2025)

Login: `tagungshaus.bergfrieden@cat2.de`  
Navigate: **Benchmark → Kategorieweiter Benchmark → Tagungshaus Bergfrieden → 2025**

#### Belegung & Nutzung

| Kennzahl | Eigener Wert | Median | Ø | Min | Max |
|---|---|---|---|---|---|
| Auslastung % | 47.00 | 47.50 | 47.88 | 45.00 | 51.00 |
| Übernachtungen/Bett | 159.8 | 161.5 | 162.8 | 153.0 | 173.4 |
| Übernachtungen/Öffnungstag | 30.87 | 31.67 | 31.67 | 29.09 | 34.06 |
| Aufenthaltsdauer (Tage) | 3.10 | 3.15 | 3.16 | 2.90 | 3.40 |

#### Neue V3-Kostenkennzahlen — KEY TEST

| Kennzahl | Eigener Wert | Median | Note |
|---|---|---|---|
| Abschreibungen % | 9.89 | **—** | ⚠️ SUPPRESSED — only 4 of 8 facilities have a value |
| Reparatur/Instandhaltung % | 4.39 | 4.40 | shown normally (8 values) |
| Pacht/Miete % | 5.48 | 5.50 | shown normally (8 values) |

> This is the primary min-5 suppression test for Cat.2. The own value **must** show; only the category reference is suppressed.

---

### 1.4 Jugendherberge Altstadt — Cat.3 (NOT eligible)

Login: `jugendherberge.altstadt@cat3.de`

**What you must see:**
- Standard KPIs benchmark normally (8 facilities ≥ 5)
- **No V3 fields in the input form** (Abschreibungen, Reparatur, Pacht/Miete, groups, personnel sections invisible)
- **No V3 KPIs in the benchmark report**

| Kennzahl | Eigener Wert | Median | Ø | Min | Max |
|---|---|---|---|---|---|
| Auslastung % | 41.00 | 42.00 | 42.25 | 39.00 | 46.00 |
| Übernachtungen/Bett | 123.0 | 126.0 | 126.8 | 117.0 | 138.0 |
| Umsatz/Übernachtung € | 34.00 | 34.50 | 34.63 | 33.00 | 37.00 |
| Personalkostenquote % | 42.00 | 42.00 | 42.00 | 40.02 | 43.99 |

---

### 1.5 Ferienhaus Lindenhof — Cat.4 (NOT eligible)

Login: `ferienhaus.lindenhof@cat4.de`

**What you must see:** no V3 fields in form, no V3 KPIs in report.

| Kennzahl | Eigener Wert | Median | Ø | Min | Max |
|---|---|---|---|---|---|
| Auslastung % | 43.00 | 44.00 | 43.57 | 40.00 | 46.00 |
| Aufenthaltsdauer (Tage) | 4.50 | 4.60 | 4.71 | 4.40 | 5.20 |
| Umsatz/Übernachtung € | 44.00 | 45.00 | 45.14 | 42.00 | 47.00 |
| Wareneinsatzquote % | 13.00 | 13.00 | 13.00 | 12.01 | 13.98 |

---

### 1.6 Bildungshaus Glockenberg — Cat.5 Bildungsstaetten (ELIGIBLE, federation member)

Login: `glockenberg@bildung.de`

Cat.5 is a **new eligible category** — V3 fields visible and benchmarked.  
Abschreibungen suppressed (only 4 of 10 facilities have a value).

#### Key KPIs

| Kennzahl | Eigener Wert | Median | Ø | Min | Max |
|---|---|---|---|---|---|
| Auslastung % | 52.00 | 50.75 | 50.70 | 47.00 | 55.00 |
| Übernachtungen/Bett | 182.0 | 177.6 | 177.5 | 164.5 | 192.5 |
| Umsatz/Übernachtung € | 58.00 | 57.50 | 57.50 | 55.00 | 61.00 |
| Personalkostenquote % | 42.00 | 42.00 | 42.00 | 40.02 | 43.99 |

#### V3 Cost KPIs

| Kennzahl | Eigener Wert | Median | Note |
|---|---|---|---|
| Abschreibungen % | 9.89 | **—** | SUPPRESSED (4/10) |
| Reparatur/Instandhaltung % | 4.37 | 4.38 | shown |
| Pacht/Miete % | 5.47 | 5.49 | shown |

---

### 1.7 Kinderfreizeitheim Sonne — Cat.6 (NOT eligible)

Login: `kinderfreizeitheim.sonne@cat6.de`

| Kennzahl | Eigener Wert | Median | Ø | Min | Max |
|---|---|---|---|---|---|
| Auslastung % | 55.00 | 53.00 | 52.86 | 48.00 | 57.00 |
| Aufenthaltsdauer (Tage) | 7.00 | 6.80 | 6.80 | 6.50 | 7.50 |
| Umsatz/Übernachtung € | 28.00 | 27.00 | 27.14 | 26.00 | 29.00 |
| Wareneinsatzquote % | 13.00 | 13.00 | 13.00 | 12.01 | 13.98 |

---

### 1.8 Sportheim Rotenberg — Cat.7 (NOT eligible)

Login: `sportheim.rotenberg@cat7.de`

| Kennzahl | Eigener Wert | Median | Ø | Min | Max |
|---|---|---|---|---|---|
| Auslastung % | 45.00 | 43.50 | 43.17 | 40.00 | 48.00 |
| Übernachtungen/Bett | 117.0 | 113.1 | 112.2 | 104.0 | 124.8 |
| Umsatz/Übernachtung € | 22.00 | 22.50 | 22.50 | 20.00 | 24.00 |
| Personalkostenquote % | 42.00 | 42.00 | 42.00 | 40.02 | 43.98 |

---

## Part 2 — Federation Manager Views

### 2.1 Laubmann Verband — Internal Benchmark (Cat.1, 2025)

Login: `laubmann@volulink.de`  
Navigate: **Benchmark → Interner Benchmark → Laubmann Verband → 2025**

The internal benchmark compares the **7 Laubmann houses** against each other (not the full category).

#### Federation Dashboard — Aggregated Totals

| Kennzahl | Aggregiert (Summe/Ø über 7 Häuser) |
|---|---|
| Gesamtübernachtungen | ~65,350 |
| Gesamtumsatz € | ~3,842,000 |
| Ø Auslastung % | ~50.6 |
| Ø Personalkostenquote % | ~42.0 |

#### Internal Benchmark — Ranking der 7 Häuser (2025, Auslastung %)

| Rank | Einrichtung | Auslastung % | Umsatz/ÜN € |
|---|---|---|---|
| 1 | Laubmann Haus 04 | ~55.0 | ~63.0 |
| 2 | Laubmann Haus 02 | ~53.0 | ~62.0 |
| 3 | Laubmann Haus 06 | ~52.0 | ~64.0 |
| 4 | Laubmann Haus 01 | ~51.0 | ~60.0 |
| 5 | Laubmann Haus 05 | ~50.0 | ~61.0 |
| 6 | Laubmann Haus 03 | ~49.0 | ~59.0 |
| 7 | Laubmann Haus 07 | ~48.0 | ~58.0 |

> Exact ranking depends on the jitter applied — values within ±2 % of above are correct.

#### Category-Wide Benchmark (also available to Federation Manager)

Federation Manager can also open **Kategorieweiter Benchmark** for any of the 7 houses.  
Expected: same as Section 1.1 (category median across all 19 Cat.1 facilities).

---

### 2.2 Dhaka Conference Federation — Internal Benchmark (Cat.1, 2025)

Login: `shanta@gmail.com`  
Navigate: **Benchmark → Interner Benchmark → Dhaka Conference Federation → 2025**

Only 2 houses → internal benchmark shows them side-by-side (no statistical median; just comparison view).

| Einrichtung | Betten | Auslastung % | Umsatz € | Personalkostenquote % |
|---|---|---|---|---|
| Dhaka Club | 60 | ~51.0 | ~583,000 | ~42.0 |
| Gulshan Club | 70 | ~51.0 | ~680,000 | ~42.0 |

---

### 2.3 Bildungswerk Verbund — Internal Benchmark (Cat.5, 2025)

Login: `bildung@volulink.de`  
Navigate: **Benchmark → Interner Benchmark → Bildungswerk Verbund → 2025**

6 houses in Cat.5 (eligible). V3 KPIs visible. Depreciation suppressed here too (4 with value across all Cat.5 = 4 < 5).

| Einrichtung | Auslastung % | Umsatz/ÜN € | Abschreibungen % | Reparatur % |
|---|---|---|---|---|
| Bildungshaus Glockenberg | ~52.0 | ~58.0 | 9.89 | ~4.37 |
| Seminarhaus Seehof | ~50.0 | ~56.0 | 9.84 | ~4.34 |
| Bildungshaus Weinberg | ~54.0 | ~60.0 | 9.93 | ~4.41 |
| Seminarhaus Waldfrieden | ~48.0 | ~55.0 | 9.80 | ~4.32 |
| Bildungshaus Bergkuppe | ~51.0 | ~57.0 | NULL | ~4.36 |
| Seminarhaus Sonnenkuppe | ~49.0 | ~56.0 | NULL | ~4.33 |

---

## Part 3 — Admin Views

### 3.1 Admin Dashboard

Login: `admin@volulink.de`  
**Benchmark-Cockpit** shows:

| Kennzahl | Wert |
|---|---|
| Total Facilities & Federations | 68 |
| Total Federations | 3 |
| Total Facilities | 65 |

**Categories:** 7 categories listed, all active.  
**Facilities list:** all 65 facilities, grouped under their federation (Laubmann: 7 houses, Dhaka: 2, Bildungswerk: 6; remaining 50 standalone).

### 3.2 Admin — View Annual Data for Any Facility

Admin can open any facility and see annual data year-by-year (2024 + 2025). All 65 facilities have both years populated.

### 3.3 Joining Requests

Any new user who signs up and selects a facility/federation will appear in **User Requests**. The admin approves them with one click.

---

## Part 4 — PDF/Excel Export Checklist

When you click **Als PDF exportieren** or **Als Excel exportieren** in the benchmark view, verify:

### PDF structure (4 variants, one per page block)

| Section | What to check |
|---|---|
| Title page | Logo, „Kategorieweiter Benchmark", Einrichtung name, Kategorie, Jahr, Export-Datum |
| MEDIAN block | All KPIs from Sections 1.x above, own value + Median + deviation |
| DURCHSCHNITT block | Same KPIs with Ø column |
| MINIMUM block | Same with Min |
| MAXIMUM block | Same with Max |
| V3 KPIs (Cat.1+2+5) | Abschreibungen, Reparatur, Pacht/Miete, group KPIs, personnel KPIs — visible |
| V3 KPIs (Cat.3+4+6+7) | These sections must be **absent** from the PDF |
| Suppressed KPI | `—` shown as category reference, own value still visible |

### Excel structure

| Column | Content |
|---|---|
| Kennzahl | German KPI label (new V3 labels, FR-01) |
| Eigener Wert | Facility's own computed value |
| Median | Category median (or — if suppressed) |
| Durchschnitt | Category average |
| Minimum | Category minimum |
| Maximum | Category maximum |

**Cross-check:** Excel values must match the tables in Part 1 above to 2 decimal places.

---

## Part 5 — Rule Checklist

| Rule | Test | Pass condition |
|---|---|---|
| FR-01 | Open add-detail form for Cat.1 facility | 8 fields have new German labels |
| FR-04 visibility ON | Cat.1/2/5 add-detail form | V3 cost + group + personnel sections visible |
| FR-04 visibility OFF | Cat.3/4/6/7 add-detail form | V3 sections absent |
| FR-07 groups | Cat.1 benchmark, Foyer le Pont | eigene Gruppen % = 62.00 |
| FR-08 personnel | Cat.1 benchmark, Foyer le Pont | Verwaltung €/Std = 16.25 |
| N-06 gate | Cat.7 (6 facilities ≥ 5) | benchmark runs |
| N-06 per-KPI | Cat.2 Abschreibungen % | own value shows, category reference = — |
| R001 NULL | Stadthotel Mitte | own V3 KPIs = NULL/nicht berechenbar |
| AC-09 backward compat | Any facility, Gesamtkosten/ÜN | = (Pers+Mat+Energy+Outs+Other)/ÜN, NOT including repair/deprec/rent |
| AC-08 federation agg | `laubmann@volulink.de` dashboard | aggregated totals for 7 houses |
| AC-10 export labels | PDF/Excel for Cat.1 facility | new V3 KPI labels present, old labels gone |

---

## Part 6 — Year-over-Year Check (2024 vs 2025)

For every facility, 2024 data is ~4–7 % lower than 2025 (occupancy −4 pp, revenue −2 €/ÜN).  
In the dashboard trend chart, **2025 bars must be higher than 2024** for Total Revenue and Auslastung.

| Facility | 2024 Umsatz (approx) | 2025 Umsatz | Δ |
|---|---|---|---|
| Foyer le Pont | 507,780 | 546,000 | +7.5 % |
| Hotel Saladia | 918,840 | 988,000 | +7.5 % |
| Alpenhof Tagungshotel | 667,740 | 718,000 | +7.5 % |
| Rheinblick Hotel | 519,870 | 559,000 | +7.5 % |
| Seehotel Bodensee | 1,041,600 | 1,120,000 | +7.5 % |

---

*Generated from `V3_extended_seed.sql` · All passwords = 123456789 · Year = 2025*
