from decimal import Decimal, ROUND_HALF_UP
from statistics import median
from abc import ABC, abstractmethod
from typing import Any
from functools import cached_property

from django.db.models import F, FloatField, QuerySet, Q
from django.db.models.functions import Coalesce, Round

from .models import Facility, FacilityDetail
from .constants import is_v2_eligible


def round_half_up(value: float | int | None, places: int = 2) -> float | None:
    """Round half-up to ``places`` decimals (Python's built-in round() is banker's
    rounding). Returns None unchanged so NULL KPIs stay NULL."""
    if value is None:
        return None
    quantum = Decimal(1).scaleb(-places)  # e.g. Decimal('0.01')
    return float(Decimal(str(value)).quantize(quantum, rounding=ROUND_HALF_UP))


# Minimum number of facilities with a non-NULL value required before a NEW (V2)
# KPI is shown in a category-wide comparison (N-06 / FR-04). Applies ONLY to the
# new V2 KPIs — existing KPIs keep their original aggregation so that pre-V2
# benchmark outputs remain identical (AC-09).
MIN_PARTICIPANTS = 5

# --- V2 / Netzwerk-2 derived KPI keys (Cat.1 + Cat.2 only) ---
V2_COST_KPI_KEYS = [
    'depreciation_ratio',
    'repair_maintenance_ratio',
    'rent_lease_ratio',
]
V2_GROUP_KPI_KEYS = [
    'own_groups_share',
    'own_participants_share',
    'returning_groups_share',
]
_PERSONNEL_AREAS = ['admin', 'kitchen', 'cleaning', 'tech', 'edu']
V2_PERSONNEL_KPI_KEYS = [
    key
    for area in _PERSONNEL_AREAS
    for key in (f'pers_{area}_cost_per_hour', f'pers_{area}_cost_share')
]
V2_ALL_KPI_KEYS = set(V2_COST_KPI_KEYS + V2_GROUP_KPI_KEYS + V2_PERSONNEL_KPI_KEYS)

# Raw columns pulled into the queryset so the V2 KPIs can be computed in Python
# (these KPIs are nullable and must return NULL on a 0/NULL denominator, which the
# existing ORM-annotation path does not express).
_V2_RAW_FIELDS = [
    'total_revenue', 'overnight_stays', 'personnel_costs',
    'donations_subsidies_income', 'outsourced_services_costs',
    'depreciation_costs', 'repair_maintenance_costs', 'rent_lease_costs',
    'total_groups', 'own_groups', 'own_participants', 'returning_groups',
    'pers_admin_hours', 'pers_admin_wage',
    'pers_kitchen_hours', 'pers_kitchen_wage',
    'pers_cleaning_hours', 'pers_cleaning_wage',
    'pers_tech_hours', 'pers_tech_wage',
    'pers_edu_hours', 'pers_edu_wage',
]


def compute_v2_kpis(row: dict) -> dict[str, float | None]:
    """Compute the 16 V2 derived KPIs for a single annual record.

    Every KPI returns None when its denominator is 0 or NULL, or when its
    numerator is NULL (NULL != 0). Formulas per Benchmarking V3 guide §2.8/2.9/4.3.
    """
    result: dict[str, float | None] = {}

    # FR-03: cost ratios as % of operational revenue (total_revenue − subsidies).
    op_rev = (row['total_revenue'] or 0) - (row['donations_subsidies_income'] or 0)

    def ratio(cost):
        if not op_rev or cost is None:
            return None
        return round_half_up(float(cost) / float(op_rev) * 100)

    result['depreciation_ratio'] = ratio(row['depreciation_costs'])
    result['repair_maintenance_ratio'] = ratio(row['repair_maintenance_costs'])
    result['rent_lease_ratio'] = ratio(row['rent_lease_costs'])

    # FR-07: group / event shares.
    total_groups = row['total_groups']
    overnight_stays = row['overnight_stays']

    def share(numerator, denominator):
        if not denominator or numerator is None:
            return None
        return round_half_up(numerator / denominator * 100)

    result['own_groups_share'] = share(row['own_groups'], total_groups)
    result['own_participants_share'] = share(row['own_participants'], overnight_stays)
    result['returning_groups_share'] = share(row['returning_groups'], total_groups)

    # FR-08: per-area personnel cost/hour and cost share.
    # Cost-share denominator = personnel_costs + outsourced_services_costs (OQ-5b).
    pers_denominator = (row['personnel_costs'] or 0) + (row['outsourced_services_costs'] or 0)
    for area in _PERSONNEL_AREAS:
        hours = row[f'pers_{area}_hours']
        wage = row[f'pers_{area}_wage']
        result[f'pers_{area}_cost_per_hour'] = (
            round_half_up(float(wage) / hours) if hours and wage is not None else None
        )
        result[f'pers_{area}_cost_share'] = (
            round_half_up(float(wage) / float(pers_denominator) * 100)
            if pers_denominator and wage is not None else None
        )

    return result


class AbstractBenchmark(ABC):
    # Existing (V1) KPI groups — order and keys MUST stay stable (AC-09).
    BASE_KPI_GROUPS = {
        'occupancy_utilization': [
            'occupancy_rate',
            'overnight_stays_per_year_per_bed',
            'overnight_stays_per_opening_day',
            'average_length_of_stay',
        ],
        'revenue_kpis': [
            'revenue_per_overnight_stay',
            'revenue_per_bed_per_opening_day',
            'average_daily_rate',
            'revenue_per_available_room',
        ],
        'cost_efficiency_kpis': [
            'personnel_cost_ratio',
            'personnel_cost_per_overnight_stay',
            'energy_cost_per_overnight_stay',
            'cleaning_cost_per_overnight_stay',
            'total_cost_per_overnight_stay',
            'meals_per_night',
        ],
        'category_specific_kpis': [
            'room_occupancy_rate',
            'cleaning_cost_per_room',
            'catering_cost_ratio',
            'revenue_per_occupancy_day',
            'energy_cost_per_occupancy_day',
            'maintenance_cost_per_occupancy_day',
        ],
    }

    def get_annual_stats(self, filters: Q) -> QuerySet[FacilityDetail, dict[str, int | float]]:
        return (
            FacilityDetail.objects
            .select_related('facility')
            .filter(
                filters,
                is_published=True
            )
            .annotate(
                occupancy_rate=Round(
                    (F('overnight_stays') * 1.0 / (F('facility__beds') * F('facility__opening_days_per_year'))) * 100,
                    2
                ),
                overnight_stays_per_year_per_bed=Round(
                    F('overnight_stays') * 1.0 / F('facility__beds'),
                    2
                ),
                overnight_stays_per_opening_day=Round(
                    F('overnight_stays') * 1.0 / F('facility__opening_days_per_year'),
                    2
                ),
                average_length_of_stay=Round(
                    Coalesce(
                        F('overnight_stays') * 1.0 / F('guests'),
                        0,
                        output_field=FloatField()
                    ),
                    2
                ),
                revenue_per_overnight_stay=Round(
                    F('total_revenue') / F('overnight_stays'),
                    2
                ),
                revenue_per_bed_per_opening_day=Round(
                    F('total_revenue') / (F('facility__beds') * F('facility__opening_days_per_year')),
                    2
                ),
                average_daily_rate=Round(
                    Coalesce(
                        F('accommodation_income') / F('rooms_sold'),
                        0,
                        output_field=FloatField()
                    ),
                    2
                ),
                revenue_per_available_room=Round(
                    Coalesce(
                        F('accommodation_income') / (F('facility__rooms') * F('facility__opening_days_per_year')),
                        0,
                        output_field=FloatField()
                    ),
                    2
                ),
                personnel_cost_ratio=Round(
                    (F('personnel_costs') / F('total_revenue')) * 100,
                    2
                ),
                personnel_cost_per_overnight_stay=Round(
                    F('personnel_costs') / F('overnight_stays'),
                    2
                ),
                energy_cost_per_overnight_stay=Round(
                    F('energy_costs') / F('overnight_stays'),
                    2
                ),
                cleaning_cost_per_overnight_stay=Round(
                    F('outsourced_services_costs') / F('overnight_stays'),
                    2
                ),
                total_cost_per_overnight_stay=Round(
                    F('total_costs') / F('overnight_stays'),
                    2
                ),
                meals_per_night=Round(
                    F('material_goods_costs') / F('overnight_stays'),
                    2
                ),
                room_occupancy_rate=Round(
                    (F('rooms_sold') * 1.0 / (F('facility__rooms') * F('facility__opening_days_per_year'))) * 100,
                    2
                ),
                cleaning_cost_per_room=Round(
                    F('outsourced_services_costs') / F('facility__rooms'),
                    2
                ),
                catering_cost_ratio=Round(
                    (F('material_goods_costs') / F('total_revenue')) * 100,
                    2
                ),
                revenue_per_occupancy_day=Round(
                    Coalesce(
                        F('total_revenue') / (F('rooms_sold') * F('facility__opening_days_per_year')),
                        0,
                        output_field=FloatField()
                    ),
                    2
                ),
                energy_cost_per_occupancy_day=Round(
                    Coalesce(
                        F('energy_costs') / (F('rooms_sold') * F('facility__opening_days_per_year')),
                        0,
                        output_field=FloatField()
                    ),
                    2
                ),
                maintenance_cost_per_occupancy_day=Round(
                    Coalesce(
                        F('other_operating_costs') / (F('rooms_sold') * F('facility__opening_days_per_year')),
                        0,
                        output_field=FloatField()
                    ),
                    2
                )
            )
            .values(
                'facility_id',
                'facility__name',
                'occupancy_rate',
                'overnight_stays_per_year_per_bed',
                'overnight_stays_per_opening_day',
                'average_length_of_stay',
                'revenue_per_overnight_stay',
                'revenue_per_bed_per_opening_day',
                'average_daily_rate',
                'revenue_per_available_room',
                'personnel_cost_ratio',
                'personnel_cost_per_overnight_stay',
                'energy_cost_per_overnight_stay',
                'cleaning_cost_per_overnight_stay',
                'total_cost_per_overnight_stay',
                'meals_per_night',
                'room_occupancy_rate',
                'cleaning_cost_per_room',
                'catering_cost_ratio',
                'revenue_per_occupancy_day',
                'energy_cost_per_occupancy_day',
                'maintenance_cost_per_occupancy_day',
                *_V2_RAW_FIELDS,
            )
        )

    @staticmethod
    def augment_rows(rows: list[dict]) -> list[dict]:
        """Attach the 16 derived V2 KPI keys to each annual-stats row."""
        for row in rows:
            row.update(compute_v2_kpis(row))
        return rows

    def effective_groups(self, eligible: bool) -> dict[str, list[str]]:
        """KPI groups to emit. Cat.1/2 facilities get 3 extra cost KPIs appended
        to Cost & Efficiency plus two new groups; others get the V1 groups only."""
        groups = {key: list(value) for key, value in self.BASE_KPI_GROUPS.items()}
        if eligible:
            groups['cost_efficiency_kpis'] += V2_COST_KPI_KEYS
            groups['group_event_kpis'] = list(V2_GROUP_KPI_KEYS)
            groups['personnel_area_kpis'] = list(V2_PERSONNEL_KPI_KEYS)
        return groups

    def median(self, values: list[float]) -> float:
        return median(values)

    def average(self, values: list[float]) -> float:
        return sum(values) / len(values)

    def min(self, values: list[float]) -> float:
        return min(values)

    def max(self, values: list[float]) -> float:
        return max(values)

    def get_labels(self, eligible: bool = False) -> dict[str, list[dict[str, str]]]:
        occupancy_utilization_labels = [
            {
                'label': 'Auslastung',
                'help_text': 'Verhältnis der tatsächlichen Übernachtungen zur maximal möglichen Kapazität',
                'unit': '%'
            },
            {
                'label': 'Übernachtungen pro Bett/Jahr',
                'help_text': 'Zeigt die Nutzungsintensität pro Bett',
                'unit': 'Nächte'
            },
            {
                'label': 'Übernachtungen pro Öffnungstag',
                'help_text': 'Durchschnittliche Belegung pro Tag',
                'unit': 'Nächte'
            },
            {
                'label': 'Durchschnittliche Aufenthaltsdauer',
                'help_text': 'Wie lange Gäste im Durchschnitt bleiben',
                'unit': 'Tage'
            }
        ]
        revenue_kpis_labels = [
            {
                'label': 'Umsatz pro Übernachtung',
                'help_text': 'Zentrale Vergleichsgröße für wirtschaftliche Leistung',
                'unit': '€'
            },
            {
                'label': 'Umsatz pro Bett/Öffnungstag',
                'help_text': 'Zeigt wirtschaftliche Nutzung der Kapazität',
                'unit': '€'
            },
            {
                'label': 'Durchschnittlicher Zimmerpreis (ADR)',
                'help_text': 'Durchschnittlicher Preis pro verkauftem Zimmer (für Hotels)',
                'unit': '€'
            },
            {
                'label': 'Umsatz pro verfügbarem Zimmer (RevPAR)',
                'help_text': 'Kombiniert Preis und Auslastung (für Hotels)',
                'unit': '€'
            }
        ]
        cost_efficiency_kpis_labels = [
            {
                'label': 'Personalkostenquote',
                'help_text': 'Anteil der Personalkosten am Gesamtumsatz',
                'unit': '%'
            },
            {
                'label': 'Personalkosten pro Übernachtung',
                'help_text': 'Personalaufwand pro Gast',
                'unit': '€'
            },
            {
                'label': 'Energiekosten pro Übernachtung',
                'help_text': 'Energieaufwand pro Gast',
                'unit': '€'
            },
            {
                'label': 'Reinigungskosten pro Übernachtung',
                'help_text': 'Reinigungsaufwand pro Gast',
                'unit': '€'
            },
            {
                'label': 'Gesamtkosten pro Übernachtung',
                'help_text': 'Summe aller Kosten pro Gast',
                'unit': '€'
            },
            {
                'label': 'Beköstigung pro Übernachtung',
                'help_text': 'Beköstigung pro Übernachtung',
                'unit': '€'
            }
        ]
        category_specific_kpis_labels = [
            {
                'label': 'Zimmerauslastung',
                'help_text': 'Verhältnis verkaufter zu verfügbaren Zimmern (Hotels)',
                'unit': '%'
            },
            {
                'label': 'Reinigungskosten pro Zimmer',
                'help_text': 'Reinigungsaufwand pro Zimmereinheit (Hotels)',
                'unit': '€'
            },
            {
                'label': 'Wareneinsatzquote',
                'help_text': 'Anteil der Verpflegungskosten am Umsatz (Gästehäuser/Tagungshäuser)',
                'unit': '%'
            },
            {
                'label': 'Umsatz pro Belegungstag',
                'help_text': 'Durchschnittlicher Tagesumsatz bei Belegung (Selbstversorger)',
                'unit': '€'
            },
            {
                'label': 'Energiekosten pro Belegungstag',
                'help_text': 'Energiekosten bezogen auf tatsächliche Nutzungstage (Selbstversorger)',
                'unit': '€'
            },
            {
                'label': 'Instandhaltung pro Belegungstag',
                'help_text': 'Instandhaltungskosten bezogen auf tatsächliche Nutzungstage (Selbstversorger)',
                'unit': '€'
            }
        ]

        labels = {
            'occupancy_utilization': occupancy_utilization_labels,
            'revenue_kpis': revenue_kpis_labels,
            'cost_efficiency_kpis': cost_efficiency_kpis_labels,
            'category_specific_kpis': category_specific_kpis_labels
        }

        if eligible:
            labels['cost_efficiency_kpis'] = cost_efficiency_kpis_labels + self._v2_cost_labels()
            labels['group_event_kpis'] = self._v2_group_labels()
            labels['personnel_area_kpis'] = self._v2_personnel_labels()

        return labels

    @staticmethod
    def _v2_cost_labels() -> list[dict[str, str]]:
        return [
            {
                'label': 'Abschreibungen',
                'help_text': 'Anteil der Abschreibungen am operativen Umsatz',
                'unit': '%'
            },
            {
                'label': 'Reparatur / Instandhaltung',
                'help_text': 'Anteil der Reparatur-/Instandhaltungskosten am operativen Umsatz',
                'unit': '%'
            },
            {
                'label': 'Pacht / Miete',
                'help_text': 'Anteil der Pacht-/Mietkosten am operativen Umsatz',
                'unit': '%'
            },
        ]

    @staticmethod
    def _v2_group_labels() -> list[dict[str, str]]:
        return [
            {
                'label': 'Eigene Gruppen / Seminare',
                'help_text': 'Anteil eigener Gruppen an allen Gruppen / Seminaren',
                'unit': '%'
            },
            {
                'label': 'Eigene Teilnehmer',
                'help_text': 'Anteil eigener Teilnehmer an den Übernachtungen',
                'unit': '%'
            },
            {
                'label': 'Stammgruppen',
                'help_text': 'Anteil der Stammgruppen an allen Gruppen / Seminaren',
                'unit': '%'
            },
        ]

    @staticmethod
    def _v2_personnel_labels() -> list[dict[str, str]]:
        area_labels = {
            'admin': 'Verwaltung',
            'kitchen': 'Hauswirtschaft-Küche',
            'cleaning': 'Hauswirtschaft-Reinigung',
            'tech': 'Technik',
            'edu': 'Pädagogik',
        }
        labels = []
        for area in _PERSONNEL_AREAS:
            name = area_labels[area]
            labels.append({
                'label': f'{name} – Personalkosten/Std',
                'help_text': f'Lohnkosten je Jahresstunde im Bereich {name}',
                'unit': '€'
            })
            labels.append({
                'label': f'{name} – Kostenanteil',
                'help_text': f'Anteil des Bereichs {name} an Personal- + Fremdfirmenkosten',
                'unit': '%'
            })
        return labels

    @abstractmethod
    def build(self) -> Any:
        raise NotImplementedError()


class InternalBenchmark(AbstractBenchmark):
    def __init__(self, federation: Facility, year: int):
        self._federation = federation
        self._year = year

    def build(self) -> dict[str, dict[str, Any]]:
        # InternalBenchmark keeps the V1 group structure (renames only). The new
        # V2 KPIs are surfaced via the category-wide benchmark, which avoids
        # injecting nullable values into the federation peer charts (AC-09).
        groups = self.effective_groups(eligible=False)
        labels = self.get_labels(eligible=False)

        queryset = list(
            self.get_annual_stats(
                Q(
                    facility__federation=self._federation,
                    facility__is_federation=False,
                    year=self._year,
                )
            )
        )

        per_facility: dict[int, dict[str, Any]] = {}
        for item in queryset:
            facility_id = item['facility_id']
            if facility_id not in per_facility:
                per_facility[facility_id] = {
                    'name': item['facility__name'],
                    'data': {group: [] for group in groups}
                }
            for group, keys in groups.items():
                per_facility[facility_id]['data'][group] = [item[key] for key in keys]

        return {
            group: {
                'labels': labels[group],
                'data': [
                    {'name': facility['name'], 'data': facility['data'][group]}
                    for facility in per_facility.values()
                ]
            }
            for group in groups
        }


class CategoryWideBenchmark(AbstractBenchmark):
    AGGREGATIONS = ['median', 'average', 'min', 'max']

    def __init__(self, facility: Facility, year: int):
        self._facility = facility
        self._year = year

    @cached_property
    def _eligible(self) -> bool:
        return is_v2_eligible(self._facility.category)

    @cached_property
    def _groups(self) -> dict[str, list[str]]:
        return self.effective_groups(self._eligible)

    @cached_property
    def my_annual_stats(self) -> dict | None:
        row = self.get_annual_stats(
            Q(
                facility_id=self._facility.id
            )
        ).first()
        if row is not None:
            row = dict(row)
            row.update(compute_v2_kpis(row))
        return row

    @cached_property
    def my_data(self) -> dict[str, list]:
        row = self.my_annual_stats
        return {
            group: [round_half_up(row[key]) if row else None for key in keys]
            for group, keys in self._groups.items()
        }

    def get_data(self, data: list, func: Any) -> dict[str, list]:
        result: dict[str, list] = {}
        for group, keys in self._groups.items():
            values = []
            for key in keys:
                if key in V2_ALL_KPI_KEYS:
                    # New KPIs: NULL-safe + per-KPI min-5 suppression (FR-04).
                    clean = [item[key] for item in data if item.get(key) is not None]
                    values.append(round_half_up(func(clean)) if len(clean) >= MIN_PARTICIPANTS else None)
                else:
                    # Existing KPIs: aggregate then round half-up to 2 decimals.
                    values.append(round_half_up(func([item[key] for item in data])))
            result[group] = values
        return result

    def build(self) -> dict[str, dict[str, dict[str, list]]]:
        queryset = self.augment_rows(list(
            self.get_annual_stats(
                Q(
                    ~Q(facility_id=self._facility.id),
                    facility__category_id=self._facility.category_id,
                    year=self._year,
                )
            )
        ))
        labels = self.get_labels(self._eligible)

        return {
            agg: {
                group: {
                    'labels': labels[group],
                    'my_data': self.my_data[group],
                    'category_data': category_data[group],
                }
                for group in self._groups
            }
            for agg in self.AGGREGATIONS
            for category_data in [self.get_data(queryset, getattr(self, agg))]
        }
