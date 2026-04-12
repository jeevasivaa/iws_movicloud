from __future__ import annotations

import os
from functools import lru_cache
from pathlib import Path
from typing import List

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    app_name: str = Field(default="VSA Foods Staff Management API", alias="APP_NAME")
    api_prefix: str = Field(default="/api", alias="API_PREFIX")
    env: str = Field(default="development", alias="ENV")
    host: str = Field(default="0.0.0.0", alias="HOST")
    port: int = Field(default=8000, alias="PORT")
    debug: bool = Field(default=True, alias="DEBUG")

    mongodb_uri: str = Field(default="", alias="MONGODB_URI")
    mongodb_db: str = Field(default="vsa_foods", alias="MONGODB_DB")

    jwt_secret_key: str = Field(default="change-me", alias="JWT_SECRET_KEY")
    jwt_algorithm: str = Field(default="HS256", alias="JWT_ALGORITHM")
    jwt_expire_minutes: int = Field(default=120, alias="JWT_EXPIRE_MINUTES")

    cors_origins: List[str] = Field(
        default_factory=lambda: ["http://localhost:5173", "http://localhost:5174"],
        alias="CORS_ORIGINS",
    )

    seed_sample_data: bool = Field(default=True, alias="SEED_SAMPLE_DATA")

    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
        populate_by_name=True,
    )

    @field_validator("mongodb_uri", mode="before")
    @classmethod
    def parse_mongodb_uri(cls, value: str | None) -> str:
        if value:
            return value

        legacy_uri = os.getenv("MONGO_URI")
        if legacy_uri:
            return legacy_uri

        return "mongodb://localhost:27017"

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: str | List[str]) -> List[str]:
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
