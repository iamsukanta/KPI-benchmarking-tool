import secrets
import string
from typing import Any

from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings


def generate_temporary_password(length: int = 12) -> str:
    """Generate a random, human-typable temporary password.

    Guarantees at least one lowercase letter, one uppercase letter and one digit
    so it satisfies common password policies. Ambiguous characters are avoided.
    """
    alphabet = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    while True:
        password = ''.join(secrets.choice(alphabet) for _ in range(length))
        if (
            any(c.islower() for c in password)
            and any(c.isupper() for c in password)
            and any(c.isdigit() for c in password)
        ):
            return password


def send_html_email(
    subject: str,
    template_name: str,
    context: dict[str, Any],
    recipient_list: list[str],
    from_email: str | None = None
):
    """
    Renders a Django template and sends it as an HTML email with plain-text fallback.

    Args:
        subject       (str):  Email subject line
        template_name (str):  Path to template e.g. 'emails/welcome_email.html'
        context       (dict): Template context variables
        recipient_list(list): List of recipient email addresses
        from_email    (str):  Sender address (defaults to DEFAULT_FROM_EMAIL)
    """

    from_email = from_email or settings.DEFAULT_FROM_EMAIL
    html_content = render_to_string(template_name, context)
    text_content = strip_tags(html_content)

    email = EmailMultiAlternatives(
        subject=subject,
        body=text_content,
        from_email=from_email,
        to=recipient_list,
    )
    email.attach_alternative(html_content, "text/html")
    email.send()
