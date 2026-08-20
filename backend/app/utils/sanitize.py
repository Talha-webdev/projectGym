import re
import html


def strip_html(text: str) -> str:
    return html.escape(text, quote=True)


def sanitize_input(text: str | None, max_length: int = 5000) -> str:
    if text is None:
        return ""
    text = text.strip()
    if len(text) > max_length:
        text = text[:max_length]
    text = re.sub(r"[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]", "", text)
    return text


def sanitize_html_content(text: str | None, max_length: int = 50000) -> str:
    if text is None:
        return ""
    text = text.strip()
    if len(text) > max_length:
        text = text[:max_length]
    text = re.sub(r"[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]", "", text)
    allowed_tags = re.compile(
        r"<(/?)(b|i|u|em|strong|a|p|br|ul|ol|li|h[1-6]|pre|code|blockquote|"
        r"img|figure|figcaption|span|div|hr|sub|sup|table|thead|tbody|tr|th|td)"
        r"[^>]*>"
    )
    text = re.sub(r"<script[^>]*>.*?</script>", "", text, flags=re.DOTALL | re.IGNORECASE)
    text = re.sub(r"<[^>]*on\w+\s*=[^>]*>", "", text, flags=re.IGNORECASE)
    text = re.sub(r"javascript\s*:", "", text, flags=re.IGNORECASE)
    parts = []
    pos = 0
    for match in re.finditer(r"<[^>]*>", text):
        parts.append(html.escape(text[pos : match.start()]))
        tag = match.group()
        if allowed_tags.match(tag):
            parts.append(tag)
        else:
            parts.append(html.escape(tag))
        pos = match.end()
    parts.append(html.escape(text[pos:]))
    return "".join(parts)
