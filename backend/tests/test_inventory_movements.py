import copy
import os
import sys
import unittest
from contextlib import suppress
from datetime import UTC, datetime, timedelta
from pathlib import Path

from bson import ObjectId  # pyright: ignore[reportMissingImports]
from flask import Flask
from flask_jwt_extended import JWTManager, create_access_token  # type: ignore[import-untyped]


os.environ["MONGO_URI"] = "mongodb://localhost:27017/iws_test"
os.environ["MONGO_DB_NAME"] = "iws_test"

BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from routes import inventory as inventory_module  # noqa: E402
from utils import db as db_module  # noqa: E402


class _InsertResult:
    def __init__(self, inserted_id):
        self.inserted_id = inserted_id


class _UpdateResult:
    def __init__(self, matched_count):
        self.matched_count = matched_count


class _FakeCursor:
    def __init__(self, rows):
        self._rows = list(rows)

    def sort(self, field, direction):
        reverse = direction == -1
        self._rows.sort(key=lambda row: (row.get(field) is None, row.get(field)), reverse=reverse)
        return self

    def limit(self, count):
        self._rows = self._rows[:count]
        return self

    def __iter__(self):
        return iter(self._rows)


class _FakeCollection:
    def __init__(self):
        self._rows = {}

    def _matches(self, row, query):
        for field, expected in (query or {}).items():
            actual = row.get(field)

            if isinstance(expected, dict):
                for operator, operand in expected.items():
                    try:
                        if operator == "$gt" and not (actual > operand):
                            return False
                        if operator == "$gte" and not (actual >= operand):
                            return False
                        if operator == "$lt" and not (actual < operand):
                            return False
                        if operator == "$lte" and not (actual <= operand):
                            return False
                    except TypeError:
                        return False
            elif actual != expected:
                return False

        return True

    def insert_one(self, payload):
        row = copy.deepcopy(payload)
        row.setdefault("_id", ObjectId())
        self._rows[row["_id"]] = row
        return _InsertResult(row["_id"])

    def find_one(self, query):
        for row in self._rows.values():
            if self._matches(row, query):
                return copy.deepcopy(row)
        return None

    def find(self, query=None):
        rows = [copy.deepcopy(row) for row in self._rows.values() if self._matches(row, query)]
        return _FakeCursor(rows)

    def update_one(self, query, update):
        for row_id, row in self._rows.items():
            if not self._matches(row, query):
                continue

            set_values = update.get("$set", {})
            merged = copy.deepcopy(row)
            merged.update(copy.deepcopy(set_values))
            self._rows[row_id] = merged
            return _UpdateResult(1)

        return _UpdateResult(0)

    def count_documents(self, query):
        return sum(1 for row in self._rows.values() if self._matches(row, query))


class InventoryMovementRoutesTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.app = Flask("inventory-movement-tests")
        cls.app.config["JWT_SECRET_KEY"] = "inventory-movement-tests-secret-key-0001"
        cls.app.config["JWT_TOKEN_LOCATION"] = ["headers"]
        JWTManager(cls.app)

        cls.app.register_blueprint(inventory_module.inventory_bp, url_prefix="/api/inventory")
        cls.client = cls.app.test_client()

        with cls.app.app_context():
            cls.admin_token = create_access_token(
                identity="admin@example.com",
                additional_claims={"role": "admin", "user_id": "test-admin"},
            )

    @classmethod
    def tearDownClass(cls):
        with suppress(Exception):
            db_module.client.close()

    def setUp(self):
        inventory_module.inventory_collection = _FakeCollection()
        inventory_module.movements_collection = _FakeCollection()
        inventory_module.settings_collection = _FakeCollection()

    def _auth_headers(self):
        return {"Authorization": f"Bearer {self.admin_token}"}

    def _create_inventory_item(self, name="Sunflower Oil", stock=120, capacity=300):
        payload = {
            "item_name": name,
            "type": "Raw Material",
            "warehouse_location": "WH-A",
            "current_stock": stock,
            "max_capacity": capacity,
            "status": "Adequate",
            "expiry_date": "2027-01-01",
        }

        response = self.client.post("/api/inventory", json=payload, headers=self._auth_headers())
        self.assertEqual(response.status_code, 201, response.get_json())
        return response.get_json()

    def test_create_inventory_logs_entry_movement(self):
        created = self._create_inventory_item(name="Groundnut Oil", stock=75, capacity=200)
        self.assertIsNotNone(created.get("_id"))

        movements_response = self.client.get("/api/inventory/movements?limit=10", headers=self._auth_headers())
        self.assertEqual(movements_response.status_code, 200)

        movements = movements_response.get_json()
        self.assertEqual(len(movements), 1)
        self.assertEqual(movements[0]["reason"], "entry_created")
        self.assertEqual(movements[0]["change"], 75)
        self.assertEqual(movements[0]["resulting_stock"], 75)
        self.assertEqual(movements[0]["item_name"], "Groundnut Oil")

    def test_update_inventory_stock_logs_stock_updated_movement(self):
        created = self._create_inventory_item(name="Sesame Oil", stock=100, capacity=260)

        response = self.client.put(
            f"/api/inventory/{created['_id']}",
            json={"current_stock": 142},
            headers=self._auth_headers(),
        )
        self.assertEqual(response.status_code, 200, response.get_json())

        movements_response = self.client.get("/api/inventory/movements?limit=10", headers=self._auth_headers())
        self.assertEqual(movements_response.status_code, 200)

        movements = movements_response.get_json()
        self.assertEqual(len(movements), 2)
        self.assertEqual(movements[0]["reason"], "stock_updated")
        self.assertEqual(movements[0]["change"], 42)
        self.assertEqual(movements[0]["resulting_stock"], 142)

    def test_patch_inventory_stock_logs_quick_adjustment_movement(self):
        created = self._create_inventory_item(name="Mustard Oil", stock=50, capacity=200)

        patch_response = self.client.patch(
            f"/api/inventory/{created['_id']}/stock",
            json={"delta": -7},
            headers=self._auth_headers(),
        )
        self.assertEqual(patch_response.status_code, 200, patch_response.get_json())
        self.assertEqual(patch_response.get_json()["current_stock"], 43)

        movements_response = self.client.get("/api/inventory/movements?limit=10", headers=self._auth_headers())
        self.assertEqual(movements_response.status_code, 200)

        movements = movements_response.get_json()
        self.assertEqual(len(movements), 2)
        self.assertEqual(movements[0]["reason"], "quick_adjustment")
        self.assertEqual(movements[0]["change"], -7)
        self.assertEqual(movements[0]["resulting_stock"], 43)

    def test_movements_limit_returns_latest_entries(self):
        first = self._create_inventory_item(name="Item A", stock=20, capacity=50)

        self.client.patch(
            f"/api/inventory/{first['_id']}/stock",
            json={"delta": 5},
            headers=self._auth_headers(),
        )

        second = self._create_inventory_item(name="Item B", stock=40, capacity=100)
        self.client.put(
            f"/api/inventory/{second['_id']}",
            json={"current_stock": 55},
            headers=self._auth_headers(),
        )

        now = datetime.now(UTC)
        for index, row in enumerate(inventory_module.movements_collection._rows.values()):
            row["timestamp"] = now - timedelta(minutes=index)

        response = self.client.get("/api/inventory/movements?limit=2", headers=self._auth_headers())
        self.assertEqual(response.status_code, 200)

        rows = response.get_json()
        self.assertEqual(len(rows), 2)
        self.assertGreaterEqual(rows[0]["timestamp"], rows[1]["timestamp"])


if __name__ == "__main__":
    unittest.main()
