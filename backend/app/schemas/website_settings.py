from pydantic import BaseModel


class WebsiteSettingsResponse(BaseModel):
    settings: dict[str, str]
