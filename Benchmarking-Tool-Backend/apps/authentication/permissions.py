from rest_framework.permissions import BasePermission
from rest_framework.views import APIView
from rest_framework.request import Request

from .constants import ROLE_ADMIN, ROLE_FACILITY_MANAGER, ROLE_FEDERATION_MANAGER


class IsAdmin(BasePermission):
    def has_permission(self, request: Request, view: APIView) -> bool:
        return request.user.is_authenticated and request.user.role == ROLE_ADMIN
    

class IsFacilityManager(BasePermission):
    def has_permission(self, request: Request, view: APIView) -> bool:
        return request.user.is_authenticated and request.user.role == ROLE_FACILITY_MANAGER
    

class IsFederationManager(BasePermission):
    def has_permission(self, request: Request, view: APIView) -> bool:
        return request.user.is_authenticated and request.user.role == ROLE_FEDERATION_MANAGER
    

class MultiRolePermission(BasePermission):
    def __init__(self, *allowed_roles: str) -> None:
        self._allowed_roles = allowed_roles

    def has_permission(self, request: Request, view: APIView) -> bool:
        return request.user.is_authenticated and request.user.role in self._allowed_roles
