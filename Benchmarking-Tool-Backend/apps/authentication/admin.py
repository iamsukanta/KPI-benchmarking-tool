from django.contrib import admin

from .models import User, Otp, EmailVerificationToken, UserActivityLog, UserInvitation


@admin.register(User)
class UserModelAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'first_name',
        'last_name',
        'email',
        'role',
        'is_active',
        'is_email_verified'
    )


@admin.register(Otp)
class OtpModelAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'user_email',
        'code',
        'request_type',
        'expires_at'
    )

    @staticmethod
    def user_email(obj: Otp) -> str:
        return obj.user.email
    

@admin.register(EmailVerificationToken)
class EmailVerificationTokenModelAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'user_email',
        'token',
        'expires_at'
    )

    @staticmethod
    def user_email(obj: EmailVerificationToken) -> str:
        return obj.user.email


@admin.register(UserActivityLog)
class UserActivityLogAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'activity', 'created_at')

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(UserInvitation)
class UserInvitationModelAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'email',
        'role_name',
        'token',
        'expires_at',
        'created_at',
        'updated_at'
    )

    @staticmethod
    def role_name(obj: UserInvitation) -> str:
        return obj.get_role_display()
    
    def has_add_permission(self, request) -> bool:
        return False
    
    def has_change_permission(self, request, obj = ...) -> bool:
        return False
