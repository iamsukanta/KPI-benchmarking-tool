from rest_framework.routers import DefaultRouter

from .apis import (
    CategoryApi,
    UnapprovedUserFacilityApi,
    UnApprovedFedarationApi,
    FederationApi,
    FacilityApi,
    InternalBenchmarkApi,
    CategoryWideBenchmarkApi,
    MasterDataApi
)

router = DefaultRouter()

router.register('categories', CategoryApi, basename='categories')
router.register('unapproved-facilities', UnapprovedUserFacilityApi, basename='unapproved-facilities')
router.register('unapproved-federations', UnApprovedFedarationApi, basename='unapproved-fedarations')
router.register('federations', FederationApi, basename='federations')
router.register('facilities', FacilityApi, basename='facilities')
router.register('internal-benchmark', InternalBenchmarkApi, basename='internal-benchmark')
router.register('category-wide-benchmark', CategoryWideBenchmarkApi, basename='category-wide-benchmark')
router.register('facility-master-data', MasterDataApi, basename='facility-master-data')

urlpatterns = router.urls
