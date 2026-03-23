import os
from typing import Any

from dotenv import load_dotenv
from pymongo import ASCENDING  # type: ignore[import-untyped]
from pymongo import MongoClient  # type: ignore[import-untyped]
from pymongo.database import Database  # type: ignore[import-untyped]
from pymongo.errors import ConfigurationError  # type: ignore[import-untyped]


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(BASE_DIR)
load_dotenv(os.path.join(BACKEND_DIR, '.env'))

MONGO_URI = os.getenv("MONGO_URI")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "iws")

if not MONGO_URI:
    raise RuntimeError("MONGO_URI is required. Please set it in backend/.env")

client = MongoClient(MONGO_URI, tz_aware=True)


def _resolve_database() -> Database[Any] | None:
    try:
        return client.get_default_database()
    except ConfigurationError:
        return None


db = _resolve_database()

if db is None:
    db = client[MONGO_DB_NAME]


assert db is not None


def get_db() -> Database[Any]:
    return db


def ensure_indexes() -> None:
    db["users"].create_index([("email", ASCENDING)], unique=True)
    db["products"].create_index([("sku", ASCENDING)], unique=True)
    db["suppliers"].create_index([("name", ASCENDING)])
    db["invoices"].create_index([("invoice_number", ASCENDING)], unique=True)
    db["orders"].create_index([("order_id", ASCENDING)], unique=True)
    db["production_batches"].create_index([("batch_id", ASCENDING)], unique=True)
    db["settings"].create_index([("key", ASCENDING)], unique=True)
