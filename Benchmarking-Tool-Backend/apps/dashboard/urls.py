from rest_framework.routers import DefaultRouter

from .apis import DashboardApi

router = DefaultRouter()

router.register('dashboard', DashboardApi, basename='dashboard')

urlpatterns = router.urls
