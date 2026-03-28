import copy
import importlib
import os
import sys
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Callable

from bson import ObjectId  # type: ignore[import-untyped]
from flask_jwt_extended import create_access_token  # type: ignore[import-untyped]
from werkzeug.security import generate_password_hash


BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

os.environ.setdefault("MONGO_URI", "mongodb://localhost:27017/iws_test")
os.environ.setdefault("MONGO_DB_NAME", "iws_test")
os.environ.setdefault("JWT_SECRET_KEY", "test-secret-key-for-rbac-tests-2026")

ALL_ROLES = ("admin", "manager", "staff", "finance", "client")


class FakeInsertResult:
    def __init__(self, inserted_id):
        self.inserted_id = inserted_id


class FakeUpdateResult:
    def __init__(self, matched_count=0, modified_count=0, upserted_id=None):
        self.matched_count = matched_count
        self.modified_count = modified_count
        self.upserted_id = upserted_id


class FakeDeleteResult:
    def __init__(self, deleted_count=0):
        self.deleted_count = deleted_count


class FakeCursor:
    def __init__(self, rows):
        self._rows = rows

    def sort(self, key, direction):
        reverse = direction == -1

        def _key_fn(row):
            value = _lookup(row, key)
            return (value is None, value)

        self._rows.sort(key=_key_fn, reverse=reverse)
        return self

    def __iter__(self):
        return iter(self._rows)


def _lookup(document, key):
    current = document
    for token in str(key).split("."):
        if not isinstance(current, dict) or token not in current:
            return None
        current = current[token]
    return current


def _assign(document, key, value):
    target = document
    tokens = str(key).split(".")
    for token in tokens[:-1]:
        if token not in target or not isinstance(target[token], dict):
            target[token] = {}
        target = target[token]
    target[tokens[-1]] = value


def _matches(document, query):
    for key, expected in (query or {}).items():
        actual = _lookup(document, key)

        if isinstance(expected, dict):
            for operator, value in expected.items():
                if operator == "$ne":
                    if actual == value:
                        return False
                elif operator == "$in":
                    if actual not in value:
                        return False
                else:
                    if actual != expected:
                        return False
        else:
            if actual != expected:
                return False

    return True


def _evaluate_expression(document, expression):
    if isinstance(expression, str) and expression.startswith("$"):
        return _lookup(document, expression[1:])
    return expression


def _evaluate_group_id(document, group_expression):
    if isinstance(group_expression, dict) and "$substr" in group_expression:
        field_expr, start, length = group_expression["$substr"]
        value = _evaluate_expression(document, field_expr)
        text_value = str(value or "")
        return text_value[start:start + length]

    return _evaluate_expression(document, group_expression)


class FakeCollection:
    def __init__(self, rows=None):
        self._rows = copy.deepcopy(rows or [])

    def reset(self, rows):
        self._rows = copy.deepcopy(rows or [])

    def create_index(self, *_args, **_kwargs):
        return "idx"

    def find(self, query=None):
        matched = [copy.deepcopy(row) for row in self._rows if _matches(row, query)]
        return FakeCursor(matched)

    def find_one(self, query=None):
        for row in self._rows:
            if _matches(row, query):
                return copy.deepcopy(row)
        return None

    def count_documents(self, query=None):
        return sum(1 for row in self._rows if _matches(row, query))

    def insert_one(self, payload):
        row = copy.deepcopy(payload)
        if "_id" not in row:
            row["_id"] = ObjectId()
        self._rows.append(row)
        return FakeInsertResult(row["_id"])

    def update_one(self, query, update, upsert=False):
        for index, row in enumerate(self._rows):
            if _matches(row, query):
                updated = copy.deepcopy(row)
                for key, value in (update.get("$set") or {}).items():
                    _assign(updated, key, value)

                self._rows[index] = updated
                modified = 1 if updated != row else 0
                return FakeUpdateResult(matched_count=1, modified_count=modified)

        if not upsert:
            return FakeUpdateResult(matched_count=0, modified_count=0)

        upsert_row = {"_id": ObjectId()}
        for key, value in query.items():
            if isinstance(value, dict):
                continue
            _assign(upsert_row, key, value)

        for key, value in (update.get("$setOnInsert") or {}).items():
            _assign(upsert_row, key, value)
        for key, value in (update.get("$set") or {}).items():
            _assign(upsert_row, key, value)

        self._rows.append(upsert_row)
        return FakeUpdateResult(matched_count=0, modified_count=1, upserted_id=upsert_row["_id"])

    def update_many(self, query, update):
        modified_count = 0
        for index, row in enumerate(self._rows):
            if not _matches(row, query):
                continue

            updated = copy.deepcopy(row)
            for key, value in (update.get("$set") or {}).items():
                _assign(updated, key, value)

            if updated != row:
                modified_count += 1
            self._rows[index] = updated

        return FakeUpdateResult(matched_count=modified_count, modified_count=modified_count)

    def delete_one(self, query):
        for index, row in enumerate(self._rows):
            if _matches(row, query):
                del self._rows[index]
                return FakeDeleteResult(deleted_count=1)
        return FakeDeleteResult(deleted_count=0)

    def aggregate(self, pipeline):
        rows = [copy.deepcopy(row) for row in self._rows]

        for stage in pipeline:
            if "$match" in stage:
                rows = [row for row in rows if _matches(row, stage["$match"])]

            elif "$group" in stage:
                group_spec = stage["$group"]
                grouped = {}

                for row in rows:
                    group_id = _evaluate_group_id(row, group_spec.get("_id"))
                    bucket = grouped.setdefault(group_id, {"_id": group_id})

                    for field_name, expression in group_spec.items():
                        if field_name == "_id":
                            continue

                        if isinstance(expression, dict) and "$sum" in expression:
                            value = _evaluate_expression(row, expression["$sum"])
                            bucket[field_name] = bucket.get(field_name, 0) + (value or 0)

                rows = list(grouped.values())

            elif "$sort" in stage:
                sort_key, direction = next(iter(stage["$sort"].items()))
                reverse = direction == -1
                rows.sort(key=lambda row: (_lookup(row, sort_key) is None, _lookup(row, sort_key)), reverse=reverse)

        return iter(rows)


class FakeDatabase:
    def __init__(self):
        self._initial_rows, self.ids = self._build_seed_data()
        self._collections = {
            name: FakeCollection(rows)
            for name, rows in self._initial_rows.items()
        }

    def _build_seed_data(self):
        now = datetime.now(timezone.utc)

        ids = {
            "admin_user_id": ObjectId(),
            "manager_user_id": ObjectId(),
            "staff_user_id": ObjectId(),
            "finance_user_id": ObjectId(),
            "client_user_id": ObjectId(),
            "product_id": ObjectId(),
            "supplier_id": ObjectId(),
            "client_id": ObjectId(),
            "inventory_id": ObjectId(),
            "order_id": ObjectId(),
            "invoice_id": ObjectId(),
            "payroll_id": ObjectId(),
            "batch_id": ObjectId(),
            "notification_id": ObjectId(),
            "setting_id": ObjectId(),
            "staff_request_id": ObjectId(),
        }

        rows = {
            "users": [
                {
                    "_id": ids["admin_user_id"],
                    "name": "Raj Kumar",
                    "email": "admin@vsafoods.com",
                    "password_hash": generate_password_hash("password123"),
                    "role": "admin",
                    "department": "Administration",
                    "status": "Active",
                    "created_at": now,
                    "updated_at": now,
                },
                {
                    "_id": ids["manager_user_id"],
                    "name": "Vikram Singh",
                    "email": "vikram@vsafoods.com",
                    "password_hash": generate_password_hash("password123"),
                    "role": "manager",
                    "department": "Production",
                    "status": "Active",
                    "created_at": now,
                    "updated_at": now,
                },
                {
                    "_id": ids["staff_user_id"],
                    "name": "Anita Desai",
                    "email": "anita@vsafoods.com",
                    "password_hash": generate_password_hash("password123"),
                    "role": "staff",
                    "department": "Quality",
                    "status": "Active",
                    "created_at": now,
                    "updated_at": now,
                },
                {
                    "_id": ids["finance_user_id"],
                    "name": "Ravi Menon",
                    "email": "ravi.finance@vsafoods.com",
                    "password_hash": generate_password_hash("password123"),
                    "role": "finance",
                    "department": "Finance",
                    "status": "Active",
                    "created_at": now,
                    "updated_at": now,
                },
                {
                    "_id": ids["client_user_id"],
                    "name": "Nita Shah",
                    "email": "nita@organichub.in",
                    "password_hash": generate_password_hash("password123"),
                    "role": "client",
                    "department": "External",
                    "status": "Active",
                    "created_at": now,
                    "updated_at": now,
                },
            ],
            "products": [
                {
                    "_id": ids["product_id"],
                    "name": "Cold Pressed Coconut Oil",
                    "sku": "VSA-CO-001",
                    "category": "Cold Pressed Oils",
                    "price": 450.0,
                    "stock": 320,
                    "status": "Active",
                    "created_at": now,
                    "updated_at": now,
                }
            ],
            "suppliers": [
                {
                    "_id": ids["supplier_id"],
                    "name": "AgroFresh Farms",
                    "location": "Tamil Nadu",
                    "category_supplied": "Coconut",
                    "rating": 4.8,
                    "total_orders": 156,
                    "status": "Active",
                    "created_at": now,
                    "updated_at": now,
                }
            ],
            "clients": [
                {
                    "_id": ids["client_id"],
                    "company_name": "FreshMart Stores",
                    "contact_person": "Ramesh Gupta",
                    "email": "ramesh@freshmart.in",
                    "total_orders": 24,
                    "last_order_date": "2024-03-01",
                    "rating": 4.8,
                    "created_at": now,
                    "updated_at": now,
                }
            ],
            "inventory": [
                {
                    "_id": ids["inventory_id"],
                    "item_name": "Glass Bottles 500ml",
                    "type": "Packaging",
                    "warehouse_location": "WH-C",
                    "current_stock": 150,
                    "max_capacity": 2000,
                    "expiry_date": "2029-12-31",
                    "status": "Critical",
                    "created_at": now,
                    "updated_at": now,
                }
            ],
            "orders": [
                {
                    "_id": ids["order_id"],
                    "order_id": "ORD-2024-001",
                    "client_id": ids["client_id"],
                    "date": "2024-03-01",
                    "total_items": 5,
                    "total_amount": 45200.0,
                    "status": "Processing",
                    "created_at": now,
                    "updated_at": now,
                }
            ],
            "invoices": [
                {
                    "_id": ids["invoice_id"],
                    "invoice_number": "INV-2024-001",
                    "client_id": ids["client_id"],
                    "date": "2024-03-01",
                    "amount": 45200.0,
                    "status": "Paid",
                    "items": [],
                    "created_at": now,
                    "updated_at": now,
                }
            ],
            "payroll": [
                {
                    "_id": ids["payroll_id"],
                    "staff_id": ids["staff_user_id"],
                    "base_salary": 28000.0,
                    "deductions": 2800.0,
                    "net_pay": 25200.0,
                    "month": now.strftime("%Y-%m"),
                    "status": "Pending",
                    "created_at": now,
                    "updated_at": now,
                }
            ],
            "production_batches": [
                {
                    "_id": ids["batch_id"],
                    "batch_id": "BATCH-001",
                    "product_id": ids["product_id"],
                    "quantity": 500,
                    "stage": "In Progress",
                    "start_date": "2024-03-01",
                    "end_date": "2024-03-04",
                    "created_at": now,
                    "updated_at": now,
                }
            ],
            "notifications": [
                {
                    "_id": ids["notification_id"],
                    "title": "Low stock alert",
                    "message": "Stock below threshold",
                    "type": "alert",
                    "timestamp": now,
                    "is_read": False,
                    "created_at": now,
                    "updated_at": now,
                }
            ],
            "settings": [
                {
                    "_id": ids["setting_id"],
                    "key": "low_stock_alerts",
                    "value": True,
                    "created_at": now,
                    "updated_at": now,
                }
            ],
            "staff_requests": [
                {
                    "_id": ids["staff_request_id"],
                    "name": "Pending Staff",
                    "email": "pending.staff@example.com",
                    "role": "staff",
                    "department": "Production",
                    "status": "Active",
                    "approval_status": "pending",
                    "requested_by": {
                        "user_id": str(ids["manager_user_id"]),
                        "email": "vikram@vsafoods.com",
                        "role": "manager",
                    },
                    "requested_at": now,
                    "created_at": now,
                    "updated_at": now,
                }
            ],
        }

        return rows, ids

    @property
    def id_strings(self):
        return {key: str(value) for key, value in self.ids.items()}

    def reset(self):
        for name, initial_rows in self._initial_rows.items():
            self._collections[name].reset(initial_rows)

    def __getitem__(self, collection_name):
        if collection_name not in self._collections:
            self._collections[collection_name] = FakeCollection([])
        return self._collections[collection_name]


ROUTE_MODULES = [
    "routes.auth",
    "routes.billing",
    "routes.dashboard",
    "routes.inventory",
    "routes.marketing",
    "routes.notifications",
    "routes.orders",
    "routes.payroll",
    "routes.products",
    "routes.production",
    "routes.reports",
    "routes.settings",
    "routes.staff",
    "routes.suppliers",
]


def create_app_with_fake_db():
    fake_db = FakeDatabase()
    db_module = importlib.import_module("utils.db")

    client = getattr(db_module, "client", None)
    if client is not None:
        client.close()

    setattr(db_module, "get_db", lambda: fake_db)
    setattr(db_module, "ensure_indexes", lambda: None)

    for module_name in ROUTE_MODULES + ["app"]:
        sys.modules.pop(module_name, None)

    app_module = importlib.import_module("app")
    flask_app = app_module.app
    flask_app.config["TESTING"] = True
    return flask_app, fake_db


_APP = None
_FAKE_DB = None


def get_test_context():
    global _APP, _FAKE_DB
    if _APP is None or _FAKE_DB is None:
        _APP, _FAKE_DB = create_app_with_fake_db()
    return _APP, _FAKE_DB


def get_test_client(reset_db=True):
    app, fake_db = get_test_context()
    if reset_db:
        fake_db.reset()
    return app, app.test_client(), fake_db


@dataclass(frozen=True)
class EndpointCase:
    name: str
    method: str
    path: str
    allowed_roles: tuple[str, ...]
    ok_statuses: tuple[int, ...] = (200,)
    payload_factory: Callable[[dict[str, str]], dict[str, Any]] | None = None


def _headers_for_role(app, role):
    with app.app_context():
        token = create_access_token(
            identity=f"{role}@example.com",
            additional_claims={
                "role": role,
                "user_id": str(ObjectId()),
            },
        )
    return {"Authorization": f"Bearer {token}"}


def headers_for_role(app, role):
    return _headers_for_role(app, role)


def open_as_role(client, app, role, method, path, json_payload=None):
    request_kwargs = {
        "method": method,
        "path": path,
        "headers": _headers_for_role(app, role),
    }
    if json_payload is not None:
        request_kwargs["json"] = json_payload
    return client.open(**request_kwargs)


def assert_rbac_matrix(testcase, matrix):
    app, fake_db = get_test_context()
    client = app.test_client()

    for case in matrix:
        for role in ALL_ROLES:
            with testcase.subTest(endpoint=case.name, role=role):
                fake_db.reset()

                ids = fake_db.id_strings
                path = case.path.format(**ids)
                headers = _headers_for_role(app, role)

                kwargs = {
                    "method": case.method,
                    "path": path,
                    "headers": headers,
                }
                if case.payload_factory is not None:
                    kwargs["json"] = case.payload_factory(ids)

                response = client.open(**kwargs)

                if role in case.allowed_roles:
                    testcase.assertIn(
                        response.status_code,
                        case.ok_statuses,
                        msg=f"{case.name} should allow {role}, got {response.status_code}",
                    )
                else:
                    testcase.assertEqual(
                        response.status_code,
                        403,
                        msg=f"{case.name} should deny {role}, got {response.status_code}",
                    )
