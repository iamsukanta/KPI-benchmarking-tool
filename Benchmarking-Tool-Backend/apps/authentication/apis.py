from threading import Thread
from typing import TYPE_CHECKING

from django.conf import settings
from django.contrib.auth import get_user_model
from django.http import HttpResponse
from django.shortcuts import get_object_or_404, render
from django.utils import timezone
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet
from rest_framework.decorators import action
from rest_framework.request import Request
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.status import HTTP_201_CREATED


from ..volulink.responses import (
    ErrorWithMessageResponse,
    SuccessResponse,
    SuccessWithMessageResponse,
    SuccessWithResultsResponse
)
from ..volulink.utils import send_html_email
from ..facilities.models import Facility
from .constants import REQUEST_TYPE_PASSWORD_RESET
from .permissions import IsAdmin, IsFacilityManager, IsFederationManager
from .models import Otp, UserInvitation, EmailVerificationToken, UserActivityLog
from .serializers import (
    ResetPasswordSerializer,
    UserInvitationAcceptSerializer,
    UserInvitationSerializer,
    UserRegistrationSerializer,
    ProfileSerializer,
    UserLogoutSerializer
)

User = get_user_model()

if TYPE_CHECKING:
    from .models import User as UserModel


class AllowAnyViewSet(ViewSet):
    permission_classes = [AllowAny]


class UserRegistrationApi(AllowAnyViewSet):
    def create(self, request: Request) -> SuccessWithMessageResponse:
        serializer = UserRegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save(is_active=True)
        # self.send_verification_email(user)

        thread = Thread(
            target=self.send_signup_email,
            args=(user, serializer.validated_data['password'], serializer.validated_data['facility'].name)
        )
        thread.daemon = True
        thread.start()

        return SuccessWithMessageResponse('Ihr Konto wurde erfolgreich erstellt. Bitte überprüfen Sie Ihre E-Mails, um Ihr Konto zu bestätigen.')

    @staticmethod
    def send_verification_email(user: 'UserModel') -> None:
        EmailVerificationToken.create_for_user(user)
        user.last_verification_email_sent_at = timezone.now()
        user.save()

    def send_signup_email(self, user: 'UserModel', raw_password: str, facility_name: str) -> None:
        self.send_email_to_the_user(user, raw_password, facility_name)
        self.send_email_to_the_admins(user, facility_name)

    @staticmethod
    def send_email_to_the_user(user: 'UserModel', raw_password: str, facility_name: str) -> None:
        context = {
            'user_name': user.get_full_name(),
            'user_email': user.email,
            'user_password': raw_password,
            'user_role': user.get_role_display(),
            'facility_name': facility_name,
            'get_started_link': settings.APP_LINK + '/login',
            'logo_link': settings.APP_LINK + '/hh-logo-color.png'
        }

        send_html_email(
            subject='Willkommen beim Benchmarking-Tool',
            template_name='emails/new_signup.html',
            context=context,
            recipient_list=[user.email]
        )
    
    @staticmethod
    def send_email_to_the_admins(user: 'UserModel', facility_name: str) -> None:
        admin_emails = User.objects.filter(role=IsAdmin).values_list('email', flat=True)
        context = {
            'user_name': user.get_full_name(),
            'user_role': user.get_role_display(),
            'facility_name': facility_name,
            'user_request_link': settings.APP_LINK + '/joining-requests',
            'logo_link': settings.APP_LINK + '/hh-logo-color.png'
        }

        send_html_email(
            subject='Beitrittsanfrage für einen neuen Benutzer | Benchmarking-Tool',
            template_name='emails/new_signup_notification_admin.html',
            context=context,
            recipient_list=[admin_emails]
        )


class TestEmailApi(AllowAnyViewSet):
    @staticmethod
    def list(request: Request) -> HttpResponse:
        context = {
            'user_name': 'Hasib Omi',
            'user_role': 'Facility Manager',
            'facility_name': 'Hotel Sarina',
            'user_request_link': settings.APP_LINK + '/joining-requests',
            'logo_link': settings.APP_LINK + '/hh-logo-color.png'
        }
        return render(request, 'emails/new_signup_notification_admin.html', context)

    @staticmethod
    def create(request: Request) -> SuccessResponse:
        user = User.objects.get(id=1)
        context = {
            'user_name': user.get_full_name(),
            'user_email': user.email,
            'user_password': '123456789',
            'user_role': user.get_role_display(),
            'facility_name': 'Test Facility',
            'get_started_link': settings.APP_LINK + '/login'
        }

        send_html_email(
            subject='Willkommen beim Benchmarking-Tool',
            template_name='emails/new_signup.html',
            context=context,
            recipient_list=['hrahmanomi@gmail.com']
        )
        return SuccessResponse()


class UserLoginApi(TokenObtainPairView):
    def post(self, request: Request, *args, **kwargs) -> Response:
        serializer = self.get_serializer(data=request.data)

        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            raise InvalidToken(e.args[0]) from e

        user = get_object_or_404(User, pk=serializer.validated_data['id'])
        UserActivityLog.log_login(user)

        return Response(serializer.validated_data)


class UserLogoutApi(AllowAnyViewSet):
    permission_classes = [IsAdmin | IsFacilityManager | IsFederationManager]

    @staticmethod
    def create(request: Request) -> SuccessResponse:
        serializer = UserLogoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        UserActivityLog.log_logout(request.user)
        return SuccessResponse()


class EmailVerificationApi(AllowAnyViewSet):
    @staticmethod
    @action(methods=['post'], detail=False)
    def resend(request) -> SuccessWithMessageResponse:
        user = get_object_or_404(User, email=request.data['email'])
        EmailVerificationToken.update_for_user(user)
        user.last_verification_email_sent_at = timezone.now()
        user.save()
        return SuccessWithMessageResponse('Eine neue Bestätigungs-E-Mail wurde an Ihre E-Mail-Adresse gesendet.')
    
    @staticmethod
    @action(methods=['get'], detail=False)
    def verify(request) -> SuccessWithMessageResponse | ErrorWithMessageResponse:
        if 'token' not in request.query_params:
            return ErrorWithMessageResponse('Ein Verifizierungstoken ist erforderlich.')

        token = get_object_or_404(EmailVerificationToken, token=request.query_params['token'])

        if not token.is_valid():
            return ErrorWithMessageResponse('Das Verifizierungstoken ist ungültig oder abgelaufen.')

        token.mark_as_used()

        user = token.user
        user.is_email_verified = True
        user.email_verified_at = timezone.now()
        user.save()
        return SuccessWithMessageResponse('Ihre E-Mail-Adresse wurde erfolgreich verifiziert.')


class ResetPasswordApi(AllowAnyViewSet):
    @staticmethod
    def create(request: Request) -> SuccessWithMessageResponse:
        user = get_object_or_404(User, email=request.data['email'])
        Otp.create_for_user_password_reset(user)
        UserActivityLog.log_password_reset_attempt(user)
        return SuccessWithMessageResponse('Ein Einmalpasswort (OTP) zum Zurücksetzen Ihres Passworts wurde an Ihre E-Mail-Adresse gesendet.')
    
    @staticmethod
    @action(methods=['post'], detail=False)
    def verify(request: Request) -> SuccessWithMessageResponse | ErrorWithMessageResponse:
        otp = get_object_or_404(Otp, code=request.data['otp'], request_type=REQUEST_TYPE_PASSWORD_RESET)
        if not otp.is_valid():
            return ErrorWithMessageResponse('Der angegebene OTP-Code ist ungültig oder abgelaufen.')
        return SuccessWithMessageResponse('Das angegebene OTP ist gültig.')
    
    @staticmethod
    @action(methods=['post'], detail=False)
    def reset(request: Request) -> SuccessWithMessageResponse:
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        UserActivityLog.log_password_reset(user)
        return SuccessWithMessageResponse('Ihr Passwort wurde erfolgreich zurückgesetzt.')


class ProfileApi(ViewSet):
    permission_classes = [
        IsAdmin |
        IsFacilityManager |
        IsFederationManager
    ]

    @staticmethod
    def list(request: Request) -> SuccessWithResultsResponse:
        serializer = ProfileSerializer(request.user)
        return SuccessWithResultsResponse(serializer.data)

    @staticmethod
    def create(request: Request) -> SuccessWithMessageResponse:
        was_first_login = request.user.change_password_at_first_login

        serializer = ProfileSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        UserActivityLog.log_profile_update(request.user)

        if 'new_password' in serializer.validated_data:
            UserActivityLog.log_password_change(request.user)

            # First successful password change after onboarding: clear the
            # forced-change flag and approve the user's linked facilities.
            if was_first_login:
                request.user.change_password_at_first_login = False
                request.user.save(update_fields=['change_password_at_first_login'])
                Facility.objects.filter(user=request.user).update(is_user_approved=True)

        return SuccessWithMessageResponse('Ihr Profil wurde erfolgreich aktualisiert.')


class UserInvitationApi(ViewSet):
    def get_permissions(self):
        if self.action in ['verify', 'accept']:
            return [AllowAny()]
        return [IsAdmin()]

    @staticmethod
    def list(request: Request) -> SuccessWithResultsResponse:
        queryset = UserInvitation.objects.all()
        serializer = UserInvitationSerializer(queryset, many=True)
        return SuccessWithResultsResponse(serializer.data)
    
    def create(self, request: Request) -> SuccessWithMessageResponse:
        serializer = UserInvitationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        invitation = serializer.save()

        thread = Thread(
            target=self.send_invitation_email,
            args=(invitation,)
        )
        thread.daemon = True
        thread.start()

        return SuccessWithMessageResponse(
            'Dem Nutzer wurde eine Einladung an seine E-Mail-Adresse gesendet.',
            status=HTTP_201_CREATED
        )
    
    @staticmethod
    def send_invitation_email(invitation: UserInvitation) -> None:
        context = {
            'invitation_link': settings.APP_LINK + '/invitations/' + invitation.token + '/',
            'logo_link': settings.APP_LINK + '/hh-logo-color.png'
        }
        send_html_email(
            subject='Einladung zur Anwendung des Benchmarking-Tool',
            template_name='emails/user_invitation.html',
            context=context,
            recipient_list=[invitation.email]
        )

    def update(self, request: Request, pk: int) -> SuccessWithMessageResponse:
        obj = get_object_or_404(
            UserInvitation,
            pk=pk
        )
        obj.save()

        thread = Thread(
            target=self.send_invitation_email,
            args=(obj,)
        )
        thread.daemon = True
        thread.start()

        return SuccessWithMessageResponse(
            'Dem Benutzer wurde eine neue Einladung an seine E-Mail-Adresse gesendet.'
        )
    
    @staticmethod
    def destroy(request: Request, pk: int) -> SuccessWithMessageResponse:
        obj = get_object_or_404(
            UserInvitation,
            pk=pk
        )
        obj.delete()
        return SuccessWithMessageResponse(
            'Die Einladung wurde gelöscht.'
        )
    
    @staticmethod
    @action(detail=True, methods=['post'])
    def verify(request: Request, pk: str) -> ErrorWithMessageResponse | SuccessWithResultsResponse:
        obj = get_object_or_404(
            UserInvitation,
            token=pk
        )

        if obj.is_expired():
            return ErrorWithMessageResponse(
                'Die Einladung ist ungültig.'
            )
        
        return SuccessWithResultsResponse(obj.email)

    @action(detail=False, methods=['post'])
    def accept(self, request: Request):
        serializer = UserInvitationAcceptSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        thread = Thread(target=self.send_invitation_accepted_email, args=(user,))
        thread.daemon = True
        thread.start()

        return SuccessWithMessageResponse(
            'Mit dieser Einladung wurde erfolgreich ein Konto erstellt.',
            status=HTTP_201_CREATED
        )

    @staticmethod
    def send_invitation_accepted_email(user: 'UserModel'):
        context = {
            'user_name': user.get_full_name(),
            'email': user.email,
            'logo_link': settings.APP_LINK + '/hh-logo-color.png'
        }
        admin_emails = User.objects.filter(role=IsAdmin).values_list('email', flat=True)
        send_html_email(
            subject='Einladung Angenommen | Benchmarking-Tool',
            template_name='emails/user_invitation_accepted.html',
            context=context,
            recipient_list=admin_emails
        )
