from django.contrib import admin

from .models import Facility, FacilityDetail


@admin.register(Facility)
class FacilityModelAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'name',
        'category',
        'beds',
        'rooms',
        'federation',
        'user',
        'is_user_approved'
    )


@admin.register(FacilityDetail)
class FacilityDetailModelAdmin(admin.ModelAdmin):
    list_display = (
        'id',
    )
