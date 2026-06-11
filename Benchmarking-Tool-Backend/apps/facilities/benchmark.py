from statistics import median
from abc import ABC, abstractmethod
from typing import Any
from functools import cached_property

from django.db.models import F, FloatField, QuerySet, Q
from django.db.models.functions import Coalesce, Round

from .models import Facility, FacilityDetail


class AbstractBenchmark(ABC):
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
                    (F('overnight_stays') / (F('facility__beds') * F('facility__opening_days_per_year'))) * 100,
                    2
                ),
                overnight_stays_per_year_per_bed=Round(
                    F('overnight_stays') / F('facility__beds'),
                    2
                ),
                overnight_stays_per_opening_day=Round(
                    F('overnight_stays') / F('facility__opening_days_per_year'),
                    2
                ),
                average_length_of_stay=Round(
                    Coalesce(
                        F('overnight_stays') / F('guests'),
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
                        F('income_from_accomodation') / F('rooms_sold'),
                        0,
                        output_field=FloatField()
                    ),
                    2
                ),
                revenue_per_available_room=Round(
                    Coalesce(
                        F('income_from_accomodation') / (F('facility__rooms') * F('facility__opening_days_per_year')),
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
                    F('cleaning_costs') / F('overnight_stays'),
                    2
                ),
                total_cost_per_overnight_stay=Round(
                    F('total_costs') / F('overnight_stays'),
                    2
                ),
                meals_per_night=Round(
                    F('catering_costs') / F('overnight_stays'),
                    2
                ),
                room_occupancy_rate=Round(
                    (F('rooms_sold') / (F('facility__rooms') * F('facility__opening_days_per_year'))) * 100,
                    2
                ),
                cleaning_cost_per_room=Round(
                    F('cleaning_costs') / F('facility__rooms'),
                    2
                ),
                catering_cost_ratio=Round(
                    (F('catering_costs') / F('total_revenue')) * 100,
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
                        F('maintenance_costs') / (F('rooms_sold') * F('facility__opening_days_per_year')),
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
                'maintenance_cost_per_occupancy_day'
            )
        )

    def median(self, values: list[float]) -> float:
        return median(values)
    
    def average(self, values: list[float]) -> float:
        return sum(values) / len(values)
    
    def min(self, values: list[float]) -> float:
        return min(values)
    
    def max(self, values: list[float]) -> float:
        return max(values)

    def get_labels(self) -> dict[str, list[dict[str, str]]]:
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

        return {
            'occupancy_utilization': occupancy_utilization_labels,
            'revenue_kpis': revenue_kpis_labels,
            'cost_efficiency_kpis': cost_efficiency_kpis_labels,
            'category_specific_kpis': category_specific_kpis_labels
        }

    @abstractmethod
    def build(self) -> Any:
        raise NotImplementedError()


class InternalBenchmark(AbstractBenchmark):
    def __init__(self, federation: Facility, year: int):
        self._federation = federation
        self._year = year
    
    def build(self) -> dict[str, dict[str, list[str] | list[dict[str, str | list[float]]]]]:
        occupancy_utilization_data = {}
        revenue_kpis_data = {}
        cost_efficiency_kpis_data = {}
        category_specific_kpis_data = {}

        labels = self.get_labels()
        queryset = list(
            self.get_annual_stats(
                Q(
                    facility__federation=self._federation,
                    facility__is_federation=False,
                    year=self._year,
                )
            )
        )

        for item in queryset:
            if item['facility_id'] not in occupancy_utilization_data:
                occupancy_utilization_data[item['facility_id']] = {
                    'name': item['facility__name'],
                    'data': []
                }
            if item['facility_id'] not in revenue_kpis_data:
                revenue_kpis_data[item['facility_id']] = {
                    'name': item['facility__name'],
                    'data': []
                }
            if item['facility_id'] not in cost_efficiency_kpis_data:
                cost_efficiency_kpis_data[item['facility_id']] = {
                    'name': item['facility__name'],
                    'data': []
                }
            if item['facility_id'] not in category_specific_kpis_data:
                category_specific_kpis_data[item['facility_id']] = {
                    'name': item['facility__name'],
                    'data': []
                }

            occupancy_utilization_data[item['facility_id']]['data'] = [
                item['occupancy_rate'],
                item['overnight_stays_per_year_per_bed'],
                item['overnight_stays_per_opening_day'],
                item['average_length_of_stay']
            ]
            revenue_kpis_data[item['facility_id']]['data'] = [
                item['revenue_per_overnight_stay'],
                item['revenue_per_bed_per_opening_day'],
                item['average_daily_rate'],
                item['revenue_per_available_room']
            ]
            cost_efficiency_kpis_data[item['facility_id']]['data'] = [
                item['personnel_cost_ratio'],
                item['personnel_cost_per_overnight_stay'],
                item['energy_cost_per_overnight_stay'],
                item['cleaning_cost_per_overnight_stay'],
                item['total_cost_per_overnight_stay'],
                item['meals_per_night']
            ]
            category_specific_kpis_data[item['facility_id']]['data'] = [
                item['room_occupancy_rate'],
                item['cleaning_cost_per_room'],
                item['catering_cost_ratio'],
                item['revenue_per_occupancy_day'],
                item['energy_cost_per_occupancy_day'],
                item['maintenance_cost_per_occupancy_day']
            ]

        return {
            'occupancy_utilization': {
                'labels': labels.get('occupancy_utilization'),
                'data': occupancy_utilization_data.values()
            },
            'revenue_kpis': {
                'labels': labels.get('revenue_kpis'),
                'data': revenue_kpis_data.values()
            },
            'cost_efficiency_kpis': {
                'labels': labels.get('cost_efficiency_kpis'),
                'data': cost_efficiency_kpis_data.values()
            },
            'category_specific_kpis': {
                'labels': labels.get('category_specific_kpis'),
                'data': category_specific_kpis_data.values()
            }
        }


class CategoryWideBenchmark(AbstractBenchmark):
    KPI_GROUPS = {
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
            'meals_per_night'
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

    AGGREGATIONS = ['median', 'average', 'min', 'max']

    def __init__(self, facility: Facility, year: int):
        self._facility = facility
        self._year = year

    @cached_property
    def my_annual_stats(self):
        return self.get_annual_stats(
            Q(
                facility_id=self._facility.id
            )
        ).first()

    @cached_property
    def my_data(self) -> dict[str, list]:
        return {
            group: [self.my_annual_stats[key] for key in keys]
            for group, keys in self.KPI_GROUPS.items()
        }

    def get_data(self, data: list, func: Any) -> dict[str, list[float]]:
        return {
            group: [func([item[key] for item in data]) for key in keys]
            for group, keys in self.KPI_GROUPS.items()
        }

    def build(self) -> dict[str, dict[str, dict[str, list]]]:
        queryset = list(
            self.get_annual_stats(
                Q(
                    ~Q(facility_id=self._facility.id),
                    facility__category_id=self._facility.category_id,
                    year=self._year,
                )
            )
        )
        labels = self.get_labels()

        return {
            agg: {
                group: {
                    'labels': labels[group],
                    'my_data': self.my_data[group],
                    'category_data': category_data[group],
                }
                for group in self.KPI_GROUPS
            }
            for agg in self.AGGREGATIONS
            for category_data in [self.get_data(queryset, getattr(self, agg))]
        }
