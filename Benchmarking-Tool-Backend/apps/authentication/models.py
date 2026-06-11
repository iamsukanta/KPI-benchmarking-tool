import secrets
import string

from datetime import timedelta
from typing import Self, TypeVar

from django.db import IntegrityError, models, transaction
from django.contrib.auth.models import PermissionsMixin
from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.contrib.auth.hashers import make_password
from django.utils import timezone

from ..volulink.models import Model
from .constants import (
    ROLE_ADMIN,
    ROLE_FACILITY_MANAGER,
    ROLE_FEDERATION_MANAGER,
    REQUEST_TYPE_LOGIN,
    REQUEST_TYPE_PASSWORD_RESET
)

UserT = TypeVar('UserT', bound=AbstractBaseUser)


class UserManager(BaseUserManager):
    def _create_user_object(self, email, password, **extra_fields):
        if not email:
            raise ValueError('The given email must be set.')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.password = make_password(password)
        return user

    def _create_user(self, email, password, **extra_fields):
        user = self._create_user_object(email, password, **extra_fields)
        user.save(using=self._db)
        return user

    def create_user(self, email, password, **extra_fields):
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', ROLE_ADMIN)
        extra_fields.setdefault('is_email_verified', True)
        extra_fields.setdefault('email_verified_at', timezone.now())
        extra_fields.setdefault('last_verification_email_sent_at', timezone.now())
        return self._create_user(email, password, **extra_fields)


ROLE_CHOICES = (
    (ROLE_ADMIN, 'Admin'),
    (ROLE_FEDERATION_MANAGER, 'Verbandsmanager'),
    (ROLE_FACILITY_MANAGER, 'Facility Manager')
)


class User(AbstractBaseUser, PermissionsMixin, Model):
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    change_password_at_first_login = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_email_verified = models.BooleanField(default=False)
    email_verified_at = models.DateTimeField(null=True, blank=True)
    last_verification_email_sent_at = models.DateTimeField(null=True, blank=True)
    password_changed_at = models.DateTimeField(null=True, blank=True)

    objects = UserManager()

    EMAIL_FIELD = 'email'
    USERNAME_FIELD = 'email'
    REQUIRED_FIELD = ['email']

    def get_full_name(self) -> str:
        full_name = "%s %s" % (self.first_name, self.last_name)
        return full_name.strip()

    def __str__(self):
        return f'{self.first_name} {self.last_name}'

    class Meta:
        db_table = 'users'


class Otp(Model):
    REQUEST_TYPE_CHOICES = (
        (REQUEST_TYPE_LOGIN, 'Login'),
        (REQUEST_TYPE_PASSWORD_RESET, 'Password Reset')
    )
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    code = models.CharField(max_length=6, unique=True)
    request_type = models.CharField(max_length=20, choices=REQUEST_TYPE_CHOICES)
    expires_at = models.DateTimeField()

    @classmethod
    def generate_code(cls, length: int = 6) -> str:
        alphabet = string.ascii_letters + string.digits
        return ''.join(secrets.choice(alphabet) for _ in range(length))

    @classmethod
    def _create_for_user(cls, user: User, request_type: str, expiry_minutes: int = 2) -> Self:
        while True:
            try:
                with transaction.atomic():
                    existing = (
                        cls.objects
                        .select_for_update()
                        .filter(
                            user=user
                        )
                        .first()
                    )

                    if not existing:
                        return cls.objects.create(
                            code=cls.generate_code(),
                            user=user,
                            request_type=request_type,
                            expires_at=timezone.now() + timedelta(minutes=expiry_minutes)
                        )
                    
                    existing.code = cls.generate_code()
                    existing.request_type = request_type
                    existing.expires_at = timezone.now() + timedelta(minutes=expiry_minutes)
                    existing.save()
                    return existing
            except IntegrityError:
                continue

    @classmethod
    def _update_for_user(cls, user: User, request_type: str, expiry_minutes: int = 2) -> int | None:
        while True:
            try:
                with transaction.atomic():
                    return (
                        cls.objects
                        .select_for_update()
                        .filter(
                            user=user
                        )
                        .update(
                            code=cls.generate_code(),
                            request_type=request_type,
                            expires_at=timezone.now() + timedelta(minutes=expiry_minutes)
                        )
                    )
            except IntegrityError:
                continue

    @classmethod
    def create_for_user_login(cls, user: User) -> Self:
        return cls._create_for_user(user, REQUEST_TYPE_LOGIN)
    
    @classmethod
    def create_for_user_password_reset(cls, user: User) -> Self:
        return cls._create_for_user(user, REQUEST_TYPE_PASSWORD_RESET)
    
    @classmethod
    def update_for_user_login(cls, user: User) -> int | None:
        return cls._update_for_user(user, REQUEST_TYPE_LOGIN)

    @classmethod
    def update_for_user_password_reset(cls, user: User) -> int | None:
        return cls._update_for_user(user, REQUEST_TYPE_PASSWORD_RESET)

    def is_valid(self) -> bool:
        return timezone.now() < self.expires_at
    
    def mark_as_used(self) -> None:
        self.delete()

    def __str__(self):
        return self.code

    class Meta:
        db_table = 'otps'
        indexes = [
            models.Index(fields=['code']),
            models.Index(fields=['user'])
        ]


class EmailVerificationToken(Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='email_verification_token')
    token = models.CharField(max_length=64, unique=True, db_index=True)
    expires_at = models.DateTimeField()

    @classmethod
    def generate_token(cls) -> str:
        return secrets.token_urlsafe(32)
    
    @classmethod
    def create_for_user(cls, user: User, expiry_hours: int = 24) -> Self:
        token = cls.generate_token()
        expires_at = timezone.now() + timedelta(hours=expiry_hours)

        return cls.objects.create(
            user=user,
            token=token,
            expires_at=expires_at
        )

    @classmethod
    def update_for_user(cls, user: User, expiry_hours: int = 24) -> int:
        token = cls.generate_token()
        expires_at = timezone.now() + timedelta(hours=expiry_hours)
        return cls.objects.filter(
            user=user
        ).update(
            token=token,
            expires_at=expires_at
        )

    def is_valid(self) -> bool:
        return timezone.now() < self.expires_at

    def mark_as_used(self):
        self.delete()

    class Meta:
        db_table = 'email_verification_tokens'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['token']),
            models.Index(fields=['user'])
        ]


class UserInvitation(Model):
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    token = models.CharField(max_length=64, unique=True, editable=False)
    expires_at = models.DateTimeField(editable=False)

    def is_expired(self) -> bool:
        return timezone.now() > self.expires_at

    def mark_as_used(self):
        self.delete()

    def save(self, *args, **kwargs):
        self.token = secrets.token_urlsafe(32)
        self.expires_at = timezone.now() + timedelta(days=1)
        return super().save(*args, **kwargs)

    class Meta:
        db_table = 'user_invitations'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['email', 'token'])
        ]


class UserActivityLog(Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='user_activity_logs'
    )
    activity = models.TextField()

    @classmethod
    def log_login(cls, user: User) -> None:
        cls.objects.create(user=user, activity='eingeloggt')

    @classmethod
    def log_logout(cls, user: User) -> None:
        cls.objects.create(user=user, activity='abgemeldet')

    @classmethod
    def log_password_change(cls, user: User) -> None:
        cls.objects.create(user=user, activity='passwort geändert')

    @classmethod
    def log_profile_update(cls, user: User) -> None:
        cls.objects.create(user=user, activity='aktualisiertes profil')

    @classmethod
    def log_password_reset_attempt(cls, user: User) -> None:
        cls.objects.create(user=user, activity='ich habe versucht, das passwort zurückzusetzen')

    @classmethod
    def log_password_reset(cls, user: User) -> None:
        cls.objects.create(user=user, activity='setzen sie das passwort zurück')

    class Meta:
        db_table = 'user_activity_logs'
