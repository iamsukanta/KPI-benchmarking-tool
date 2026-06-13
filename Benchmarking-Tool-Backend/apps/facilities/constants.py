# V2 / Netzwerk-2 field groups and category visibility rules.
# Category gating is by NAME (never hard-coded IDs) so IDs may change safely.

# Categories that receive the V2 extension fields/KPIs: Cat.1 Hotels + Cat.2 Tagungshaus.
V2_ELIGIBLE_CATEGORY_NAMES = [
    'Hotels / Tagungshotels',
    'Tagungshaus / Familienferienstatte',
]

# 3 new cost input fields (FR-02).
V2_COST_FIELDS = [
    'repair_maintenance_costs',
    'depreciation_costs',
    'rent_lease_costs',
]

# 4 group/event input fields (FR-07).
V2_GROUP_FIELDS = [
    'total_groups',
    'own_groups',
    'own_participants',
    'returning_groups',
]

# 10 per-area personnel input fields, 5 areas x {hours, wage} (FR-08).
V2_PERSONNEL_FIELDS = [
    'pers_admin_hours', 'pers_admin_wage',
    'pers_kitchen_hours', 'pers_kitchen_wage',
    'pers_cleaning_hours', 'pers_cleaning_wage',
    'pers_tech_hours', 'pers_tech_wage',
    'pers_edu_hours', 'pers_edu_wage',
]

# All V2 fields hidden from ineligible categories on the data-entry serializer.
V2_ALL_INPUT_FIELDS = V2_COST_FIELDS + V2_GROUP_FIELDS + V2_PERSONNEL_FIELDS


def is_v2_eligible(category) -> bool:
    """True when the facility's category receives the V2 extension fields/KPIs."""
    return bool(category) and category.name in V2_ELIGIBLE_CATEGORY_NAMES
