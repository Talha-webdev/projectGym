import logging
import httpx
from app.config import settings

logger = logging.getLogger(settings.APP_NAME)

RESEND_API_URL = "https://api.resend.com/emails"


async def send_email(recipient: str, subject: str, html_content: str) -> bool:
    if not settings.RESEND_API_KEY:
        logger.warning("RESEND_API_KEY not set; skipping email send")
        return False
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                RESEND_API_URL,
                headers={
                    "Authorization": f"Bearer {settings.RESEND_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "from": f"{settings.APP_NAME} <noreply@projectgym.com>",
                    "to": [recipient],
                    "subject": subject,
                    "html": html_content,
                },
                timeout=30,
            )
            if response.is_success:
                logger.info("Email sent to %s: %s", recipient, subject)
                return True
            else:
                logger.error("Failed to send email to %s: %s %s", recipient, response.status_code, response.text)
                return False
        except Exception as e:
            logger.exception("Exception sending email to %s: %s", recipient, e)
            return False


def build_verification_email(full_name: str, verification_url: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#0A0A0A;font-family:Inter,Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0A0A0A;padding:40px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
<tr><td style="text-align:center;padding:0 0 24px;">
<span style="font-family:'Playfair Display',Georgia,serif;font-size:28px;font-weight:700;color:#D4A853;">Project GYM</span>
</td></tr>
<tr><td style="background-color:#1A1A1A;border:1px solid #2A2A2A;border-radius:16px;padding:40px;">
<h1 style="font-family:Inter,Helvetica,Arial,sans-serif;font-size:24px;font-weight:700;color:#FFFFFF;margin:0 0 8px;">Welcome to Project GYM</h1>
<p style="font-family:Inter,Helvetica,Arial,sans-serif;font-size:16px;color:#A0A0A0;margin:0 0 24px;line-height:1.5;">
Hi <strong style="color:#FFFFFF;">{full_name}</strong>,<br><br>
Thanks for creating an account! Please verify your email address to get started on your fitness journey.
</p>
<table cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
<tr><td align="center" style="background-color:#D4A853;border-radius:12px;padding:14px 36px;">
<a href="{verification_url}" style="font-family:Inter,Helvetica,Arial,sans-serif;font-size:16px;font-weight:600;color:#000000;text-decoration:none;display:inline-block;">Verify Email</a>
</td></tr>
</table>
<p style="font-family:Inter,Helvetica,Arial,sans-serif;font-size:14px;color:#6B6B6B;margin:0 0 24px;line-height:1.5;text-align:center;">
This link expires in <strong style="color:#D4A853;">24 hours</strong>.
</p>
<hr style="border:none;border-top:1px solid #2A2A2A;margin:24px 0;">
<p style="font-family:Inter,Helvetica,Arial,sans-serif;font-size:13px;color:#6B6B6B;margin:0;line-height:1.5;text-align:center;">
If you didn't create this account, you can safely ignore this email.
</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>"""


def build_password_reset_email(full_name: str, reset_url: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#0A0A0A;font-family:Inter,Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0A0A0A;padding:40px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
<tr><td style="text-align:center;padding:0 0 24px;">
<span style="font-family:'Playfair Display',Georgia,serif;font-size:28px;font-weight:700;color:#D4A853;">Project GYM</span>
</td></tr>
<tr><td style="background-color:#1A1A1A;border:1px solid #2A2A2A;border-radius:16px;padding:40px;">
<h1 style="font-family:Inter,Helvetica,Arial,sans-serif;font-size:24px;font-weight:700;color:#FFFFFF;margin:0 0 8px;">Reset Your Password</h1>
<p style="font-family:Inter,Helvetica,Arial,sans-serif;font-size:16px;color:#A0A0A0;margin:0 0 24px;line-height:1.5;">
Hi <strong style="color:#FFFFFF;">{full_name}</strong>,<br><br>
We received a request to reset your password. Click the button below to set a new one.
</p>
<table cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
<tr><td align="center" style="background-color:#D4A853;border-radius:12px;padding:14px 36px;">
<a href="{reset_url}" style="font-family:Inter,Helvetica,Arial,sans-serif;font-size:16px;font-weight:600;color:#000000;text-decoration:none;display:inline-block;">Reset Password</a>
</td></tr>
</table>
<p style="font-family:Inter,Helvetica,Arial,sans-serif;font-size:14px;color:#6B6B6B;margin:0 0 24px;line-height:1.5;text-align:center;">
This link expires in <strong style="color:#D4A853;">1 hour</strong>.
</p>
<hr style="border:none;border-top:1px solid #2A2A2A;margin:24px 0;">
<p style="font-family:Inter,Helvetica,Arial,sans-serif;font-size:13px;color:#6B6B6B;margin:0;line-height:1.5;text-align:center;">
If you didn't request this, you can safely ignore this email.
</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>"""


async def send_verification_email(email: str, full_name: str, token: str) -> bool:
    verification_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"
    html = build_verification_email(full_name, verification_url)
    return await send_email(email, "Verify your Project GYM account", html)


async def send_password_reset_email(email: str, full_name: str, token: str) -> bool:
    reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"
    html = build_password_reset_email(full_name, reset_url)
    return await send_email(email, "Reset your Project GYM password", html)
