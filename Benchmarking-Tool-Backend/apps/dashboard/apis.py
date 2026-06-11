from abc import ABC, abstractmethod
from collections import defaultdict
from typing import Iterable, TypeVar

from rest_framework.request import Request
from rest_framework.viewsets import ViewSet
from django.contrib.auth import get_user_model
from django.db.models import Count, Q, Prefetch
from django.contrib.auth.models import AbstractBaseUser

from ..authentication.constants import ROLE_ADMIN, ROLE_FEDERATION_MANAGER
from ..authentication.permissions import (
    IsAdmin,
    IsFacilityManager,
    IsFederationManager
)
from ..authentication.models import UserActivityLog
from ..facilities.models import Facility, FacilityActivityLog, FacilityDetail
from ..facilities.serializers import FacilitySerializer
from ..volulink.responses import SuccessWithResultsResponse

User = get_user_model()
UserT = TypeVar('UserT', bound=AbstractBaseUser)
TypeActivity = Iterable[dict[str, str]]
TypeDashboard = dict[str, dict[str, str | int] | TypeActivity]


class LoadDashboardData(ABC):
    @abstractmethod
    def load(self) -> TypeDashboard:
        raise NotImplementedError()


class CommonDashboard:
    def __init__(self, user: UserT):
        self.user = user
        self.query_limit = 7

    def user_activities(self) -> TypeActivity:
        return (
            UserActivityLog.objects
            .filter(user=self.user)
            .values('activity', 'created_at')
            .order_by('-id')
            [:self.query_limit]
        )

    def facility_activities(self) -> TypeActivity:
        return (
            FacilityActivityLog.objects
            .filter(user=self.user)
            .order_by('-id')
            .values('activity', 'created_at')
            [:self.query_limit]
        )


class AdminDashboard(CommonDashboard, LoadDashboardData):
    @staticmethod
    def facilities() -> dict[str, int]:
        queryset = (
            Facility.objects
            .aggregate(
                total_facilities_and_federations=Count('id'),
                total_facilities=Count('id', filter=Q(is_federation=False)),
                total_federations=Count('id', filter=Q(is_federation=True)),
            )
        )
        return queryset

    def user_join_requests(self) -> list[dict[str, str | int]]:
        queryset = Facility.objects.filter(
            user_id__isnull=False,
            is_user_approved=False
        ).order_by('-id')[:self.query_limit]
        serializer = FacilitySerializer(queryset, many=True)
        return serializer.data

    def user_approvals(self) -> TypeActivity:
        return self.facility_activities()

    def load(self) -> TypeDashboard:
        return {
            'user_activities': self.user_activities(),
            'facilities': self.facilities(),
            'user_join_requests': self.user_join_requests(),
            'user_approvals': self.user_approvals()
        }


class FederationManagerDashboard(CommonDashboard, LoadDashboardData):
    def federation_stats(self) -> list[dict[str, int | str | list[dict[str, int | str | dict[str, int]]]]]:
        federations = defaultdict(lambda: {
            'id': None,
            'name': None,
            'facilities': []
        })
        queryset = (
            Facility.get_facilities_by_own_federations(self.user)
            .select_related('federation')
            .prefetch_related(
                Prefetch(
                    'facility_details',
                    queryset=FacilityDetail.objects.filter(is_published=True)
                )
            )
        )

        for item in queryset:
            federations[item.federation_id]['id'] = item.federation_id
            federations[item.federation_id]['name'] = item.federation.name
            federations[item.federation_id]['opening_days_per_year'] = item.federation.opening_days_per_year
            federations[item.federation_id]['facilities'].append({
                'id': item.id,
                'name': item.name,
                'category': item.category.name,
                'beds': item.beds,
                'rooms': item.rooms,
                'opening_days_per_year': item.opening_days_per_year,
                'current_year': {
                    'year': (
                        item.facility_details.all()[0].year
                        if len(item.facility_details.all()) > 0 else 0
                    ),
                    'overnight_stays': (
                        item.facility_details.all()[0].overnight_stays
                        if len(item.facility_details.all()) > 0 else 0
                    ),
                    'total_revenue': (
                        item.facility_details.all()[0].total_revenue
                        if len(item.facility_details.all()) > 0 else 0
                    ),
                    'total_costs': (
                        item.facility_details.all()[0].total_costs
                        if len(item.facility_details.all()) > 0 else 0
                    )
                },
                'previous_year': {
                    'year': (
                        item.facility_details.all()[1].year
                        if len(item.facility_details.all()) > 1 else 0
                    ),
                    'overnight_stays': (
                        item.facility_details.all()[1].overnight_stays
                        if len(item.facility_details.all()) > 1 else 0
                    ),
                    'total_revenue': (
                        item.facility_details.all()[1].total_revenue
                        if len(item.facility_details.all()) > 1 else 0
                    ),
                    'total_costs': (
                        item.facility_details.all()[1].total_costs
                        if len(item.facility_details.all()) > 1 else 0
                    )
                }
            })
        return federations.values()

    def load(self) -> TypeDashboard:
        return {
            'federation_stats': self.federation_stats(),
            'user_activities': self.user_activities()
        }


class FacilityManagerDashboard(CommonDashboard, LoadDashboardData):
    def benchmark_attempts(self) -> TypeActivity:
        return self.facility_activities()

    def facility_stats(self):
        queryset = (
            Facility.objects
            .select_related('category')
            .prefetch_related(
                Prefetch(
                    'facility_details',
                    queryset=FacilityDetail.objects.filter(is_published=True)
                )
            )
            .filter(user=self.user, is_user_approved=True)
        )
        return [{
            'id': item.id,
            'name': item.name,
            'category': item.category.name,
            'beds': item.beds,
            'rooms': item.rooms,
            'opening_days_per_year': item.opening_days_per_year,
            'current_year': {
                'year': (
                    item.facility_details.all()[0].year
                    if len(item.facility_details.all()) > 0 else 0
                ),
                'overnight_stays': (
                    item.facility_details.all()[0].overnight_stays
                    if len(item.facility_details.all()) > 0 else 0
                ),
                'total_revenue': (
                    item.facility_details.all()[0].total_revenue
                    if len(item.facility_details.all()) > 0 else 0
                ),
                'total_costs': (
                    item.facility_details.all()[0].total_costs
                    if len(item.facility_details.all()) > 0 else 0
                )
            },
            'previous_year': {
                'year': (
                    item.facility_details.all()[1].year
                    if len(item.facility_details.all()) > 1 else 0
                ),
                'overnight_stays': (
                    item.facility_details.all()[1].overnight_stays
                    if len(item.facility_details.all()) > 1 else 0
                ),
                'total_revenue': (
                    item.facility_details.all()[1].total_revenue
                    if len(item.facility_details.all()) > 1 else 0
                ),
                'total_costs': (
                    item.facility_details.all()[1].total_costs
                    if len(item.facility_details.all()) > 1 else 0
                )
            }
        } for item in queryset]

    def load(self) -> TypeDashboard:
        return {
            'facility_stats': self.facility_stats(),
            'user_activities': self.user_activities(),
            'benchmark_attempts': self.benchmark_attempts()
        }


class DashboardApi(ViewSet):
    permission_classes = [IsAdmin | IsFacilityManager | IsFederationManager]

    @staticmethod
    def list(request: Request) -> SuccessWithResultsResponse:
        if request.user.role == ROLE_ADMIN:
            dashboard = AdminDashboard(request.user)
        elif request.user.role == ROLE_FEDERATION_MANAGER:
            dashboard = FederationManagerDashboard(request.user)
        else:
            dashboard = FacilityManagerDashboard(request.user)
        return SuccessWithResultsResponse(dashboard.load())
