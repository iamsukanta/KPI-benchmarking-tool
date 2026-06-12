# Benchmark Calculation Rules

This document explains how the **Category-Wide Benchmark** ("Kategorie-Benchmark") is
calculated. It covers every KPI group, the formulas behind each KPI, and how the
statistics (median / average / min / max) and "Meine Einrichtung" values are produced.

> Source of truth: `Benchmarking-Tool-Backend/apps/facilities/benchmark.py`
> + `constants.py`. Frontend labels live in `category-benchmark/benchmark.tsx`.

---

## 1. How the benchmark works (the shared engine)

Every group below uses the **same engine** (`CategoryWideBenchmark`). Only the KPI
formulas differ between groups.

For a chosen **facility** and **year**, the benchmark returns two things per KPI:

| Term | German | What it is |
|---|---|---|
| `my_data` | **Meine Einrichtung** | Your own facility's raw KPI value. **No aggregation.** Just your number for that year. |
| `category_data` | **Kategorie** | An aggregated value across all *other* facilities in the **same category**, **same year**. |

**Peer set for `category_data`:** all facilities where
`category = your category`, `year = selected year`, `is_published = True`, and
`facility_id != your facility` (you are excluded so you don't benchmark against yourself).

**The four statistics** (`AGGREGATIONS = ['median', 'average', 'min', 'max']`) are each
computed over that peer set:

| Statistics label | German meaning | Definition |
|---|---|---|
| `median` | Median | Middle value of all peers (robust typical value) |
| `average` | Durchschnitt | Arithmetic mean = `sum / count` |
| `min` | Minimum | Lowest peer value |
| `max` | Maximum | Highest peer value |

So the final result is structured as:

```
{ median:  { <group>: { my_data: [...], category_data: [median per KPI] } },
  average: { <group>: { my_data: [...], category_data: [avg    per KPI] } },
  min:     { <group>: { my_data: [...], category_data: [min    per KPI] } },
  max:     { <group>: { my_data: [...], category_data: [max    per KPI] } } }
```

---

## 2. Two aggregation paths: V1 (legacy) vs V2 (new)

This is the single most important rule. KPIs fall into one of two paths.

### V1 / legacy KPIs — simple path
- Every peer value is fed straight into median/average/min/max.
- **No NULL filtering**, **no minimum-participant rule**.
- Kept byte-identical to the original tool on purpose (requirement AC-09).

### V2 / new KPIs — strict path
Applies only to the new KPIs (cost ratios, group shares, personnel-per-area). These:
1. Are computed **in Python**, returning **`None`** (empty) — never `0` — when a
   denominator is `0`/`NULL` or the numerator is `NULL` ("no data" stays empty).
2. **Drop NULLs** before aggregating (only peers that actually reported the value count).
3. Are **suppressed** (the whole statistic is returned as `None`) unless at least
   **`MIN_PARTICIPANTS = 5`** peers reported a value — for statistical validity / privacy (FR-04).

### Who sees V2 KPIs? (category eligibility)
V2 KPIs are **only added for these categories** (matched by name, see `constants.py`):
- **Hotels / Tagungshotels** (Category 1)
- **Tagungshaus / Familienferienstätte** (Category 2)

For all other categories, the V2 groups/KPIs are not shown at all. Eligibility is
checked via `is_v2_eligible(facility.category)`.

---

## 3. KPI Groups

### 3.1 Belegung & Nutzung — `occupancy_utilization` (V1, all categories)

Occupancy & utilization. **4 KPIs**, all legacy → simple aggregation path.

| German Label | KPI key | Formula | Database fields | Unit | Null handling |
|---|---|---|---|---|---|
| Auslastung | `occupancy_rate` | `overnight_stays / (beds × opening_days_per_year) × 100` | `overnight_stays`, `facility.beds`, `facility.opening_days_per_year` | % | — |
| Übernachtungen pro Bett/Jahr | `overnight_stays_per_year_per_bed` | `overnight_stays / beds` | `overnight_stays`, `facility.beds` | Nächte | — |
| Übernachtungen pro Öffnungstag | `overnight_stays_per_opening_day` | `overnight_stays / opening_days_per_year` | `overnight_stays`, `facility.opening_days_per_year` | Nächte | — |
| Durchschnittliche Aufenthaltsdauer | `average_length_of_stay` | `overnight_stays / guests` | `overnight_stays`, `guests` | Tage | → `0` if null |

---

### 3.2 Erlöskennzahlen — `revenue_kpis` (V1, all categories)

Revenue KPIs. **4 KPIs**, all legacy → simple aggregation path.

| German Label | KPI key | Formula | Database fields | Unit | Null handling |
|---|---|---|---|---|---|
| Umsatz pro Übernachtung | `revenue_per_overnight_stay` | `total_revenue / overnight_stays` | `total_revenue`, `overnight_stays` | € | — |
| Umsatz pro Bett/Öffnungstag | `revenue_per_bed_per_opening_day` | `total_revenue / (beds × opening_days_per_year)` | `total_revenue`, `facility.beds`, `facility.opening_days_per_year` | € | — |
| Durchschnittlicher Zimmerpreis (ADR) | `average_daily_rate` | `accommodation_income / rooms_sold` | `accommodation_income`, `rooms_sold` | € | → `0` if null |
| Umsatz pro verfügbarem Zimmer (RevPAR) | `revenue_per_available_room` | `accommodation_income / (rooms × opening_days_per_year)` | `accommodation_income`, `facility.rooms`, `facility.opening_days_per_year` | € | → `0` if null |

---

### 3.3 Kosten & Effizienzkennzahlen — `cost_efficiency_kpis` (V1 base + V2 extension)

Cost & efficiency. **6 base KPIs (all categories)** + **3 extra KPIs for eligible categories**.

**Base 6 (V1 → simple path):**

| German Label | KPI key | Formula | Database fields | Unit |
|---|---|---|---|---|
| Personalkostenquote | `personnel_cost_ratio` | `personnel_costs / total_revenue × 100` | `personnel_costs`, `total_revenue` | % |
| Personalkosten pro Übernachtung | `personnel_cost_per_overnight_stay` | `personnel_costs / overnight_stays` | `personnel_costs`, `overnight_stays` | € |
| Energiekosten pro Übernachtung | `energy_cost_per_overnight_stay` | `energy_costs / overnight_stays` | `energy_costs`, `overnight_stays` | € |
| Reinigungskosten pro Übernachtung | `cleaning_cost_per_overnight_stay` | `outsourced_services_costs / overnight_stays` | `outsourced_services_costs`, `overnight_stays` | € |
| Gesamtkosten pro Übernachtung | `total_cost_per_overnight_stay` | `total_costs / overnight_stays` | `total_costs`, `overnight_stays` | € |
| Beköstigung pro Übernachtung | `meals_per_night` | `material_goods_costs / overnight_stays` | `material_goods_costs`, `overnight_stays` | € |

**Extra 3 (V2 → strict path, only Cat. 1 & 2):**
Denominator = **operativer Umsatz** = `total_revenue − donations_subsidies_income`.

| German Label | KPI key | Formula | Database fields | Unit |
|---|---|---|---|---|
| Abschreibungen | `depreciation_ratio` | `depreciation_costs / operational_revenue × 100` | `depreciation_costs`, `total_revenue`, `donations_subsidies_income` | % |
| Reparatur / Instandhaltung | `repair_maintenance_ratio` | `repair_maintenance_costs / operational_revenue × 100` | `repair_maintenance_costs`, `total_revenue`, `donations_subsidies_income` | % |
| Pacht / Miete | `rent_lease_ratio` | `rent_lease_costs / operational_revenue × 100` | `rent_lease_costs`, `total_revenue`, `donations_subsidies_income` | % |

---

### 3.4 Kategorie-spezifische Kennzahlen — `category_specific_kpis` (V1, all categories)

Category-specific KPIs (different rows are meaningful for different facility types —
hotels, guesthouses, self-catering). **6 KPIs**, all legacy → simple aggregation path.

| German Label | KPI key | Formula | Database fields | Unit | Null handling |
|---|---|---|---|---|---|
| Zimmerauslastung | `room_occupancy_rate` | `rooms_sold / (rooms × opening_days_per_year) × 100` | `rooms_sold`, `facility.rooms`, `facility.opening_days_per_year` | % | — |
| Reinigungskosten pro Zimmer | `cleaning_cost_per_room` | `outsourced_services_costs / rooms` | `outsourced_services_costs`, `facility.rooms` | € | — |
| Wareneinsatzquote | `catering_cost_ratio` | `material_goods_costs / total_revenue × 100` | `material_goods_costs`, `total_revenue` | % | — |
| Umsatz pro Belegungstag | `revenue_per_occupancy_day` | `total_revenue / (rooms_sold × opening_days_per_year)` | `total_revenue`, `rooms_sold`, `facility.opening_days_per_year` | € | → `0` if null |
| Energiekosten pro Belegungstag | `energy_cost_per_occupancy_day` | `energy_costs / (rooms_sold × opening_days_per_year)` | `energy_costs`, `rooms_sold`, `facility.opening_days_per_year` | € | → `0` if null |
| Instandhaltung pro Belegungstag | `maintenance_cost_per_occupancy_day` | `other_operating_costs / (rooms_sold × opening_days_per_year)` | `other_operating_costs`, `rooms_sold`, `facility.opening_days_per_year` | € | → `0` if null |

---

### 3.5 Gruppen & Veranstaltungen — `group_event_kpis` (V2, only Cat. 1 & 2)

Groups & events. **3 KPIs**, all V2 → strict path (NULL-safe + 5-participant minimum).
This entire group is **hidden for non-eligible categories**.

| German Label | KPI key | Formula | Database fields | Unit |
|---|---|---|---|---|
| Eigene Gruppen / Seminare | `own_groups_share` | `own_groups / total_groups × 100` | `own_groups`, `total_groups` | % |
| Eigene Teilnehmer | `own_participants_share` | `own_participants / overnight_stays × 100` | `own_participants`, `overnight_stays` | % |
| Stammgruppen | `returning_groups_share` | `returning_groups / total_groups × 100` | `returning_groups`, `total_groups` | % |

Each returns `None` (empty) if its denominator is 0/NULL or numerator is NULL.

---

### 3.6 Personalkosten je Bereich — `personnel_area_kpis` (V2, only Cat. 1 & 2)

Personnel cost per area. **5 areas × 2 KPIs = 10 KPIs**, all V2 → strict path.
This entire group is **hidden for non-eligible categories**.

**Areas:**

| German | area key | input fields |
|---|---|---|
| Verwaltung | `admin` | `pers_admin_hours`, `pers_admin_wage` |
| Hauswirtschaft-Küche | `kitchen` | `pers_kitchen_hours`, `pers_kitchen_wage` |
| Hauswirtschaft-Reinigung | `cleaning` | `pers_cleaning_hours`, `pers_cleaning_wage` |
| Technik | `tech` | `pers_tech_hours`, `pers_tech_wage` |
| Pädagogik | `edu` | `pers_edu_hours`, `pers_edu_wage` |

**Two KPIs per area** (`{name}` = the German area label above):

| German Label | KPI key pattern | Formula | Unit |
|---|---|---|---|
| {name} – Personalkosten/Std | `pers_<area>_cost_per_hour` | `wage / hours` | € |
| {name} – Kostenanteil | `pers_<area>_cost_share` | `wage / (personnel_costs + outsourced_services_costs) × 100` | % |

- `cost_per_hour` → `None` if `hours` is 0/NULL or `wage` is NULL.
- `cost_share` → `None` if the personnel+outsourced denominator is 0/NULL or `wage` is NULL.
- The cost-share denominator (`personnel_costs + outsourced_services_costs`) is shared
  across all five areas.

---

## 4. Quick reference — group summary

| German group | key | # KPIs | Path | Shown to |
|---|---|---|---|---|
| Belegung & Nutzung | `occupancy_utilization` | 4 | V1 simple | All categories |
| Erlöskennzahlen | `revenue_kpis` | 4 | V1 simple | All categories |
| Kosten & Effizienzkennzahlen | `cost_efficiency_kpis` | 6 (+3) | V1 simple (+V2 strict) | All (+3 only Cat. 1 & 2) |
| Kategorie-spezifische Kennzahlen | `category_specific_kpis` | 6 | V1 simple | All categories |
| Gruppen & Veranstaltungen | `group_event_kpis` | 3 | V2 strict | Only Cat. 1 & 2 |
| Personalkosten je Bereich | `personnel_area_kpis` | 10 | V2 strict | Only Cat. 1 & 2 |

**Key reminders:**
- **Meine Einrichtung** = your own raw value, never aggregated.
- **median / average / min / max** are computed only over *other* same-category, same-year, published facilities.
- **V1 KPIs**: all peers counted, missing values may fall back to `0`.
- **V2 KPIs**: missing stays empty (`None`), and the statistic is hidden unless **≥ 5 peers** reported it.
- All KPI values are rounded to **2 decimal places**.
