import ssl
import smtplib
from django.core.mail.backends.smtp import EmailBackend


class UnverifiedSSLEmailBackend(EmailBackend):
    def open(self):
        if self.connection:
            return False
        try:
            ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE

            self.connection = smtplib.SMTP_SSL(
                self.host,
                self.port,
                timeout=self.timeout or 10,
                context=ssl_context,
            )

            if self.username and self.password:
                self.connection.login(self.username, self.password)

            return True

        except Exception as e:
            if not self.fail_silently:
                raise
