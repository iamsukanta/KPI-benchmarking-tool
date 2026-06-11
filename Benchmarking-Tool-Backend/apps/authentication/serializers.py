from typing import Any, TypeVar

from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken

from ..facilities.models import Facility
from .constants import REQUEST_TYPE_PASSWORD_RESET, ROLE_ADMIN, ROLE_FACILITY_MANAGER, ROLE_FEDERATION_MANAGER
from .models import ROLE_CHOICES, Otp, UserInvitation, UserT

User = get_user_model()


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    is_federation_manager = serializers.BooleanField(write_only=True, required=False)
    facility = serializers.IntegerField()

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'password', 'is_federation_manager', 'facility']

    @staticmethod
    def validate_facility(value: int) -> Facility:
        facility = Facility.objects.filter(pk=value, user__isnull=True).first()
        if not facility:
            raise serializers.ValidationError('Invalid facility.')
        return facility

    def create(self, validated_data: dict[str, str | bool]) -> UserT:
        password = validated_data.pop('password')
        facility = validated_data.pop('facility')
        is_federation_manager = validated_data.pop('is_federation_manager', False)

        if is_federation_manager:
            validated_data['role'] = ROLE_FEDERATION_MANAGER
        else:
            validated_data['role'] = ROLE_FACILITY_MANAGER

        user = User(**validated_data)
        user.set_password(password)
        user.save()

        facility.user = user
        facility.save()

        return user
    

class UserLoginSerializer(TokenObtainPairSerializer):
    def validate(self, attrs: dict[str, str]) -> dict[str, str]:
        data = super().validate(attrs)
        data['id'] = self.user.id
        data['name'] = self.user.first_name
        data['email'] = self.user.email
        data['role'] = self.user.role
        return data


class UserLogoutSerializer(serializers.Serializer):
    token = serializers.CharField()

    def validate(self, attrs: dict[str, Any]) -> dict[str, Any]:
        token = attrs['token']
        token = RefreshToken(token)
        token.blacklist()
        return attrs


class ResetPasswordSerializer(serializers.Serializer):
    otp = serializers.CharField(max_length=6)
    password = serializers.CharField()

    @staticmethod
    def validate_otp(value: str) -> Otp:
        otp = Otp.objects.filter(code=value, request_type=REQUEST_TYPE_PASSWORD_RESET).first()
        if not otp or not otp.is_valid():
            raise serializers.ValidationError('The provided OTP is invalid or has expired.')
        return otp

    def create(self, validated_data: dict[str, str]) -> UserT:
        otp = validated_data.pop('otp')
        user = otp.user
        user.set_password(validated_data.pop('password'))
        user.save()
        otp.mark_as_used()
        return user


class ProfileSerializer(serializers.ModelSerializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)

    def validate_old_password(self, value: str) -> str:
        if not self.instance.check_password(value):
            raise serializers.ValidationError('The provided password is incorrect.')
        return value

    def validate(self, attrs: dict[str, str]) -> dict[str, str]:
        if 'old_password' in attrs and 'new_password' not in attrs:
            raise serializers.ValidationError({
                'new_password': 'Please provide a new password.'
            })
        elif 'new_password' in attrs and 'old_password' not in attrs:
            raise serializers.ValidationError({
                'old_password': 'Please provide your current password.'
            })
        elif (
            'old_password' in attrs and
            'new_password' in attrs and
            attrs['new_password'] == attrs['old_password']
        ):
            raise serializers.ValidationError({
                'new_password': 'The new password cannot be the same as your current password.'
            })
        return attrs

    def update(self, instance: UserT, validated_data: dict[str, str]) -> UserT:
        if 'new_password' in validated_data:
            instance.set_password(validated_data['new_password'])
            instance.password_changed_at = timezone.now()
        return super().update(instance, validated_data)

    class Meta:
        model = User
        fields = (
            'id',
            'first_name',
            'last_name',
            'email',
            'role',
            'change_password_at_first_login',
            'password_changed_at',
            'old_password',
            'new_password'
        )


class UserInvitationSerializer(serializers.ModelSerializer):
    is_expired = serializers.SerializerMethodField()
    role = serializers.ChoiceField(
        choices=ROLE_CHOICES,
        default=ROLE_ADMIN
    )

    @staticmethod
    def validate_email(email: str):
        existing_user = User.objects.filter(email=email).exists()
        existing_invitation = UserInvitation.objects.filter(email=email).exists()
        if existing_user:
            raise serializers.ValidationError('Diese E-Mail-Adresse ist bereits registriert.')
        if existing_invitation:
            raise serializers.ValidationError('Eine Benutzereinladung mit dieser E-Mail-Adresse existiert bereits.')
        return email


    @staticmethod
    def get_is_expired(obj) -> bool:
        return obj.is_expired()
    
    class Meta:
        model = UserInvitation
        fields = ('id', 'email', 'role', 'expires_at', 'is_expired')


class UserInvitationAcceptSerializer(serializers.ModelSerializer):
    token = serializers.CharField()

    @staticmethod
    def validate_token(value: str):
        token = UserInvitation.objects.filter(token=value).first()
        if not token or token.is_expired():
            raise serializers.ValidationError('Die Einladung ist ungültig.')
        return token

    def create(str, validated_data: dict[str, str]) -> UserT:
        invitation = validated_data.pop('token')
        password = validated_data.pop('password')
        user = User(
            **validated_data,
            email=invitation.email,
            role=invitation.role,
            is_email_verified=True,
            email_verified_at=timezone.now()
        )
        user.set_password(password)
        user.save()
        invitation.mark_as_used()
        return user

    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'password', 'token')
