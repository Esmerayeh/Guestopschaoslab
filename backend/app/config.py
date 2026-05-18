from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "sqlite:///./guestops.db"
    frontend_origin: str = "http://localhost:3000"
    production_frontend_origin: str = ""
    openai_api_key: str = ""
    gemini_api_key: str = ""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    @property
    def cors_origins(self) -> list[str]:
        origins = [self.frontend_origin]
        if self.production_frontend_origin:
            origins.append(self.production_frontend_origin)
        return origins


@lru_cache
def get_settings() -> Settings:
    return Settings()

