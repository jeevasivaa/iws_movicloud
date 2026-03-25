import os
from typing import Any, cast

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


def _force_tcp_dns_for_srv_uri(uri: str) -> None:
    if os.name != "nt" or not uri.startswith("mongodb+srv://"):
        return

    try:
        import dns.resolver  # type: ignore[import-untyped]
    except ImportError:
        return

    current_resolve = dns.resolver.Resolver.resolve
    if getattr(current_resolve, "_iws_forces_tcp", False):
        return

    def _resolve_with_tcp(self, *args, **kwargs):
        if len(args) < 4 and "tcp" not in kwargs:
            kwargs["tcp"] = True
        return current_resolve(self, *args, **kwargs)

    setattr(_resolve_with_tcp, "_iws_forces_tcp", True)
    dns.resolver.Resolver.resolve = _resolve_with_tcp


_force_tcp_dns_for_srv_uri(MONGO_URI)
client = MongoClient(MONGO_URI, tz_aware=True)


def _resolve_database() -> Database[Any] | None:
    try:
        return client.get_default_database()
    except ConfigurationError:
        return None


resolved_db = _resolve_database()

if resolved_db is None:
    resolved_db = client[MONGO_DB_NAME]


db: Database[Any] = cast(Database[Any], resolved_db)


def get_db() -> Database[Any]:
    return db


def _is_single_ascending_index(index: Any, field: str) -> bool:
    key = index.get("key")
    if key is None:
        return False

    return dict(key) == {field: ASCENDING}


def _create_unique_non_empty_string_index(collection: str, field: str, name: str) -> None:
    collection_ref = db[collection]
    partial_filter_expression = {
        "$and": [
            {field: {"$type": "string"}},
            {field: {"$gt": ""}},
        ]
    }

    existing_indexes = list(collection_ref.list_indexes())

    for index in existing_indexes:
        if index.get("name") != name:
            continue

        is_expected_index = (
            index.get("unique") is True
            and index.get("partialFilterExpression") == partial_filter_expression
            and _is_single_ascending_index(index, field)
        )
        if is_expected_index:
            return

        collection_ref.drop_index(name)
        break

    for index in existing_indexes:
        index_name = index.get("name")
        if (
            isinstance(index_name, str)
            and index_name != name
            and index.get("unique") is True
            and not index.get("partialFilterExpression")
            and _is_single_ascending_index(index, field)
        ):
            collection_ref.drop_index(index_name)

    collection_ref.create_index(
        [(field, ASCENDING)],
        unique=True,
        name=name,
        partialFilterExpression=partial_filter_expression,
    )


def ensure_indexes() -> None:
    _create_unique_non_empty_string_index("users", "email", "email_unique_non_empty")
    _create_unique_non_empty_string_index("products", "sku", "sku_unique_non_empty")
    db["suppliers"].create_index([("name", ASCENDING)])
    _create_unique_non_empty_string_index("invoices", "invoice_number", "invoice_number_unique_non_empty")
    _create_unique_non_empty_string_index("orders", "order_id", "order_id_unique_non_empty")
    _create_unique_non_empty_string_index("production_batches", "batch_id", "batch_id_unique_non_empty")
    _create_unique_non_empty_string_index("settings", "key", "settings_key_unique_non_empty")
