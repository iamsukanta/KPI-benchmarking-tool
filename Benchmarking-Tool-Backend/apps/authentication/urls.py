from django.urls import path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .apis import (
    EmailVerificationApi,
    ResetPasswordApi,
    UserInvitationApi,
    UserRegistrationApi,
    ProfileApi,
    UserLoginApi,
    UserLogoutApi,
    TestEmailApi
)

router = DefaultRouter()

router.register('signup', UserRegistrationApi, basename='user-registration')
router.register('logout', UserLogoutApi, basename='logout')
router.register('email-verification', EmailVerificationApi, basename='email-verification')
router.register('reset-password', ResetPasswordApi, basename='reset-password')
router.register('me', ProfileApi, basename='me')
router.register('user-invitations', UserInvitationApi, basename='user-invitations')
router.register('test-email', TestEmailApi, basename='test-email')

urlpatterns = router.urls + [
    path('login/', UserLoginApi.as_view(), name='login'),
    path('token-refresh/', TokenRefreshView.as_view(), name='token-refresh')
]
