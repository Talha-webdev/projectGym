import pytest
from app.config import settings
from app.services.email_service import (
    build_verification_email,
    build_password_reset_email,
    build_contact_email,
)


class TestEmailHtmlEscaping:
    def test_verification_email_escapes_script_tag_in_name(self):
        name = '<script>alert("xss")</script>'
        html = build_verification_email(name, "https://example.com/verify?token=abc")
        assert "<script>" not in html
        assert "&lt;script&gt;" in html
        assert "Verify Email" in html

    def test_verification_email_escapes_html_in_name(self):
        name = '<img src=x onerror=alert(1)>'
        html = build_verification_email(name, "https://example.com/verify?token=abc")
        assert "<img" not in html
        assert "&lt;img" in html

    def test_verification_email_escapes_quotes_in_name(self):
        name = '"><script>alert(1)</script>'
        html = build_verification_email(name, "https://example.com/verify?token=abc")
        assert "<script>" not in html
        assert "&quot;" in html

    def test_verification_email_escapes_ampersand_in_name(self):
        name = "Tom & Jerry"
        html = build_verification_email(name, "https://example.com/verify?token=abc")
        assert "Tom &amp; Jerry" in html
        assert "Tom & Jerry" not in html

    def test_verification_email_preserves_safe_name(self):
        name = "John Smith"
        html = build_verification_email(name, "https://example.com/verify?token=abc")
        assert "John Smith" in html

    def test_verification_email_preserves_url(self):
        url = "https://example.com/verify?token=abc123"
        html = build_verification_email("User", url)
        assert url in html

    def test_password_reset_email_escapes_script_tag_in_name(self):
        name = '<script>alert("xss")</script>'
        html = build_password_reset_email(name, "https://example.com/reset?token=abc")
        assert "<script>" not in html
        assert "&lt;script&gt;" in html
        assert "Reset Password" in html

    def test_password_reset_email_escapes_html_in_name(self):
        name = '<svg onload=alert(1)>'
        html = build_password_reset_email(name, "https://example.com/reset?token=abc")
        assert "<svg" not in html
        assert "&lt;svg" in html

    def test_password_reset_email_escapes_quotes_in_name(self):
        name = "O'Brien"
        html = build_password_reset_email(name, "https://example.com/reset?token=abc")
        assert "O&#x27;Brien" in html or "O&#x27;Brien" in html

    def test_password_reset_email_preserves_safe_name(self):
        name = "Jane Doe"
        html = build_password_reset_email(name, "https://example.com/reset?token=abc")
        assert "Jane Doe" in html

    def test_password_reset_email_preserves_url(self):
        url = "https://example.com/reset?token=xyz789"
        html = build_password_reset_email("User", url)
        assert url in html

    def test_contact_email_escapes_script_tag_in_name(self):
        name = '<script>alert("xss")</script>'
        html = build_contact_email(name, "a@b.com", "Hi", "Hello")
        assert "<script>" not in html
        assert "&lt;script&gt;" in html

    def test_contact_email_escapes_script_tag_in_subject(self):
        subject = '<script>alert("xss")</script>'
        html = build_contact_email("Name", "a@b.com", subject, "Hello")
        assert "<script>" not in html
        assert "&lt;script&gt;" in html

    def test_contact_email_escapes_script_tag_in_message(self):
        message = '<script>alert("xss")</script>'
        html = build_contact_email("Name", "a@b.com", "Hi", message)
        assert "<script>" not in html
        assert "&lt;script&gt;" in html

    def test_contact_email_escapes_script_tag_in_email(self):
        email = '<script>alert("xss")</script>'
        html = build_contact_email("Name", email, "Hi", "Hello")
        assert "<script>" not in html
        assert "&lt;script&gt;" in html

    def test_contact_email_escapes_img_in_message(self):
        message = '<img src=x onerror=alert(1)>'
        html = build_contact_email("Name", "a@b.com", "Hi", message)
        assert "<img" not in html
        assert "&lt;img" in html

    def test_contact_email_escapes_quotes_across_fields(self):
        name = '"><img src=x onerror=alert(1)>'
        subject = '"><script>alert(1)</script>'
        message = '"><body onload=alert(1)>'
        html = build_contact_email(name, "a@b.com", subject, message)
        # All user-supplied angle brackets are escaped
        assert "&lt;script&gt;" in html
        assert "&lt;img" in html
        assert "&lt;body" in html
        assert "&gt;" in html

    def test_contact_email_preserves_safe_values(self):
        html = build_contact_email("John", "john@example.com", "Question", "Hello there")
        assert "John" in html
        assert "john@example.com" in html
        assert "Question" in html
        assert "Hello there" in html

    def test_contact_email_preserves_html_structure(self):
        html = build_contact_email("A", "a@b.com", "S", "M")
        assert "<!DOCTYPE html>" in html
        assert settings.APP_NAME in html
        assert "New Contact Message" in html
        assert "From" in html
        assert "Email" in html
        assert "Subject" in html
