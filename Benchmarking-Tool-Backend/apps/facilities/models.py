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
    income_from_donations = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        blank=True,
        null=True,
        verbose_name='Revenue Share Donations, Grants / Subsidies'
    )
    income_from_conferences = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        blank=True,
        null=True,
        verbose_name='Revenue Share Conferences'
    )
    income_from_catering = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        blank=True,
        null=True,
        verbose_name='Revenue Share Catering'
    )
    income_from_accomodation = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        blank=True,
        null=True,
        verbose_name='Revenue Share Accommodation'
    )
    personnel_costs = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    catering_costs = models.DecimalField(max_digits=12, decimal_places=2, default=0, verbose_name='Cost of Goods / Catering Costs')
    energy_costs = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    cleaning_costs = models.DecimalField(max_digits=12, decimal_places=2, default=0, blank=True)
    maintenance_costs = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        verbose_name='Maintenance and Other Operating Costs'
    )
    total_costs = models.DecimalField(max_digits=12, decimal_places=2, editable=False)
    is_published = models.BooleanField(default=False, db_index=True)
    last_published_at = models.DateTimeField(blank=True, null=True)

    def save(self, *args, **kwargs):
        self.total_costs = (
            self.personnel_costs +
            self.catering_costs +
            self.energy_costs +
            self.cleaning_costs +
            self.maintenance_costs
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
