from typing import Self, TypeVar

from django.db import models
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AbstractBaseUser
from django.utils import timezone

from ..volulink.models import Model

User = get_user_model()
UserT = TypeVar('UserT', bound=AbstractBaseUser)


class Category(Model):
    name = models.CharField(max_length=100, unique=True)
    is_active = models.BooleanField(default=True, db_index=True)

    def mark_as_active(self) -> None:
        self.is_active = True
        self.save()

    def mark_as_inactive(self) -> None:
        self.is_active = False
        self.save()

    def __str__(self):
        return self.name
    
    class Meta:
        db_table = 'categories'
        verbose_name_plural = 'Categories'


class Facility(Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='facilities', blank=True, null=True)
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name='facilities', blank=True, null=True)
    is_federation = models.BooleanField(default=False, db_index=True)
    federation = models.ForeignKey('self', on_delete=models.SET_NULL, related_name='facilities', blank=True, null=True)
    name = models.CharField(max_length=255, unique=True)
    region = models.CharField(max_length=100, blank=True, null=True)
    federal_state = models.BooleanField(default=False)
    beds = models.PositiveIntegerField(blank=True, null=True)
    rooms = models.PositiveIntegerField(blank=True, null=True)
    opening_days_per_year = models.PositiveIntegerField(default=365)
    operational_building_area = models.PositiveIntegerField(blank=True, null=True)
    total_property_area = models.PositiveIntegerField(blank=True, null=True)
    is_user_approved = models.BooleanField(default=False, db_index=True)
    is_active = models.BooleanField(default=True, db_index=True)

    @classmethod
    def active_facilities(cls) -> models.QuerySet[Self]:
        return cls.objects.select_related('category').filter(is_active=True)

    @classmethod
    def get_federations(cls) -> models.QuerySet[Self, Self]:
        return (
            cls.objects
            .select_related('category')
            .filter(is_federation=True)
        )

    @classmethod
    def get_own_federations(cls, user: UserT | int) -> models.QuerySet[Self, Self]:
        user_id = user if isinstance(user, int) else user.id
        return cls.objects.select_related('category').filter(
            is_federation=True,
            user_id=user_id,
            is_user_approved=True
        )

    @classmethod
    def get_facilities_by_own_federations(cls, user: UserT | int) -> models.QuerySet[Self, Self]:
        user_id = user if isinstance(user, int) else user.id
        return cls.objects.select_related('category').filter(
            is_federation=False,
            federation__is_federation=True,
            federation__user_id=user_id,
            federation__is_user_approved=True
        )

    @classmethod
    def get_facilities_by_own_federation(cls, federation_id: int, user: UserT | int) -> models.QuerySet[Self, Self]:
        user_id = user if isinstance(user, int) else user.id
        return cls.objects.select_related('category').filter(
            federation_id=federation_id,
            is_federation=False,
            federation__is_federation=True,
            federation__user_id=user_id,
            federation__is_user_approved=True
        )

    @classmethod
    def get_facilities_by_federation(cls, federation_id: int) -> models.QuerySet[Self, Self]:
        return cls.objects.select_related('category').filter(
            federation_id=federation_id,
            is_federation=False,
            federation__is_federation=True
        )

    def __str__(self):
        return self.name
    
    class Meta:
        db_table = 'facilities'
        verbose_name_plural = 'Facilities'
        indexes = [
            models.Index(fields=['user', 'is_user_approved']),
            models.Index(fields=['category', 'user', 'is_user_approved']),
            models.Index(fields=['is_federation', 'federation', 'user', 'is_user_approved']),
            models.Index(fields=['federation', 'user', 'is_user_approved'])
        ]


class FacilityDetail(Model):
    facility = models.ForeignKey(
        Facility,
        on_delete=models.CASCADE,
        related_name='facility_details'
    )
    year = models.PositiveIntegerField()
    guests = models.PositiveIntegerField(default=0)
    rooms_sold = models.PositiveIntegerField(default=0, blank=True)
    overnight_stays = models.PositiveIntegerField()
    total_revenue = models.DecimalField(max_digits=12, decimal_places=2)
    donations_subsidies_income = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        blank=True,
        null=True,
        verbose_name='Revenue Share Donations, Grants / Subsidies'
    )
    other_income = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        blank=True,
        null=True,
        verbose_name='Other Income'
    )
    catering_income = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        blank=True,
        null=True,
        verbose_name='Revenue Share Catering'
    )
    accommodation_income = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        blank=True,
        null=True,
        verbose_name='Revenue Share Accommodation'
    )
    personnel_costs = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    material_goods_costs = models.DecimalField(max_digits=12, decimal_places=2, default=0, verbose_name='Material / Goods incl. Hygiene')
    energy_costs = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    outsourced_services_costs = models.DecimalField(max_digits=12, decimal_places=2, default=0, blank=True, verbose_name='Outsourced Services Costs')
    other_operating_costs = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        verbose_name='Other Operating Costs'
    )

    # V2 / Netzwerk-2 cost fields (cat.1 + cat.2 only) — nullable, NULL != 0
    repair_maintenance_costs = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True, verbose_name='Repair & Maintenance Costs')
    depreciation_costs = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True, verbose_name='Depreciation Costs')
    rent_lease_costs = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True, verbose_name='Rent / Lease Costs')

    # V2 / Netzwerk-2 group & event fields (cat.1 + cat.2 only) — nullable
    total_groups = models.PositiveIntegerField(blank=True, null=True, verbose_name='Total Groups / Seminars')
    own_groups = models.PositiveIntegerField(blank=True, null=True, verbose_name='Own Groups / Seminars')
    own_participants = models.PositiveIntegerField(blank=True, null=True, verbose_name='Own Participants')
    returning_groups = models.PositiveIntegerField(blank=True, null=True, verbose_name='Returning Groups')

    # V2 / Netzwerk-2 per-area personnel block (cat.1 + cat.2 only) — 5 areas x {hours, wage}, nullable
    pers_admin_hours = models.PositiveIntegerField(blank=True, null=True, verbose_name='Administration Annual Hours')
    pers_admin_wage = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True, verbose_name='Administration Wage Costs')
    pers_kitchen_hours = models.PositiveIntegerField(blank=True, null=True, verbose_name='Housekeeping-Kitchen Annual Hours')
    pers_kitchen_wage = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True, verbose_name='Housekeeping-Kitchen Wage Costs')
    pers_cleaning_hours = models.PositiveIntegerField(blank=True, null=True, verbose_name='Housekeeping-Cleaning Annual Hours')
    pers_cleaning_wage = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True, verbose_name='Housekeeping-Cleaning Wage Costs')
    pers_tech_hours = models.PositiveIntegerField(blank=True, null=True, verbose_name='Technical Annual Hours')
    pers_tech_wage = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True, verbose_name='Technical Wage Costs')
    pers_edu_hours = models.PositiveIntegerField(blank=True, null=True, verbose_name='Pedagogy Annual Hours')
    pers_edu_wage = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True, verbose_name='Pedagogy Wage Costs')

    total_costs = models.DecimalField(max_digits=12, decimal_places=2, editable=False)
    is_published = models.BooleanField(default=False, db_index=True)
    last_published_at = models.DateTimeField(blank=True, null=True)

    def save(self, *args, **kwargs):
        # NOTE: total_costs intentionally excludes the V2 cost fields
        # (repair_maintenance_costs, depreciation_costs, rent_lease_costs) so that
        # existing benchmark outputs remain identical post-migration (AC-09).
        self.total_costs = (
            self.personnel_costs +
            self.material_goods_costs +
            self.energy_costs +
            self.outsourced_services_costs +
            self.other_operating_costs
        )
        if self.is_published:
            self.last_published_at = timezone.now()
        return super().save(*args, **kwargs)

    class Meta:
        db_table = 'facilitie_details'
        indexes = [
            models.Index(fields=['is_published', 'facility']),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=['facility', 'year'],
                condition=models.Q(is_published=True),
                name='unique_published_per_year_per_facility'
            )
        ]
        ordering = ['-year']


class FacilityActivityLog(Model):
    facility = models.ForeignKey(
        Facility,
        on_delete=models.CASCADE,
        related_name='activity_logs'
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='facility_activity_logs'
    )
    activity = models.TextField()

    @classmethod
    def log_facility_user_request(cls, facility: Facility, user: UserT) -> None:
        cls.objects.create(
            facility=facility,
            user=user,
            activity=(
                f'{facility.user.first_name} {facility.user.last_name} möchte beitreten als '
                'Föderationsmanager'
                if facility.is_federation and facility.user.role == 'federation_manager'
                else 'Facility Manager'
                f' bei {facility.name} anfangen'
            )
        )

    @classmethod
    def log_facility_user_approve(cls, facility: Facility, user: UserT) -> None:
        cls.objects.create(
            facility=facility,
            user=user,
            activity=(
                f'{facility.user.first_name} {facility.user.last_name} wurde als '
                f'{"Federation Manager" if facility.is_federation and facility.user.role == "federation_manager" else "Facility Manager"}'
                f' von {facility.name} zugelassen'
            )
        )

    @classmethod
    def log_facility_user_reject(cls, facility: Facility, user: UserT) -> None:
        cls.objects.create(
            facility=facility,
            user=user,
            activity=(
                f'{facility.user.first_name} {facility.user.last_name} wurde als '
                'Federation Manager'
                if facility.is_federation and facility.user.role == 'federation_manager'
                else 'Facility Manager'
                f' von {facility.name} abgelehnt'
            )
        )

    @classmethod
    def log_benchmark_attempt(cls, facility: Facility, user: UserT, year: int) -> None:
        cls.objects.create(
            facility=facility,
            user=user,
            activity=(
                f'attempted to benchmark {facility.name} in {year}'
            )
        )

    class Meta:
        db_table = 'facility_activity_logs'
