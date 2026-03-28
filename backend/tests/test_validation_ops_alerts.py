import unittest

from rbac_test_support import open_as_role
from validation_test_support import get_client_and_auth_header


class OpsAlertsValidationTest(unittest.TestCase):
    def setUp(self):
        app, client, fake_db, admin_json_headers = get_client_and_auth_header("admin")
        self.app = app
        self.client = client
        self.fake_db = fake_db
        self.admin_json_headers = admin_json_headers
        self.ids = fake_db.id_strings

    def test_production_post_requires_required_fields(self):
        payload = {
            "batch_id": "BATCH-VAL-001",
            "product_id": self.ids["product_id"],
            "quantity": 100,
            "stage": "Planned",
            "start_date": "",
            "end_date": "2026-01-15",
        }
        response = open_as_role(self.client, self.app, "admin", "POST", "/api/production", json_payload=payload)
        self.assertEqual(response.status_code, 400)
        self.assertIn("Missing required fields", response.get_json()["msg"])

    def test_production_post_rejects_invalid_stage(self):
        payload = {
            "batch_id": "BATCH-VAL-002",
            "product_id": self.ids["product_id"],
            "quantity": 100,
            "stage": "Paused",
            "start_date": "2026-01-10",
            "end_date": "2026-01-15",
        }
        response = open_as_role(self.client, self.app, "admin", "POST", "/api/production", json_payload=payload)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"msg": "Invalid stage. Use Planned, In Progress, or Completed"})

    def test_orders_post_requires_required_fields(self):
        payload = {
            "order_id": "ORD-VAL-001",
            "client_id": self.ids["client_id"],
            "date": "2026-01-10",
            "total_items": "",
            "total_amount": 1200,
            "status": "Pending",
        }
        response = open_as_role(self.client, self.app, "admin", "POST", "/api/orders", json_payload=payload)
        self.assertEqual(response.status_code, 400)
        self.assertIn("Missing required fields", response.get_json()["msg"])

    def test_orders_post_rejects_invalid_status(self):
        payload = {
            "order_id": "ORD-VAL-002",
            "client_id": self.ids["client_id"],
            "date": "2026-01-10",
            "total_items": 2,
            "total_amount": 1200,
            "status": "Cancelled",
        }
        response = open_as_role(self.client, self.app, "admin", "POST", "/api/orders", json_payload=payload)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"msg": "Invalid status. Use Pending, Processing, Shipped, or Delivered"})

    def test_orders_post_normalizes_status_casing(self):
        payload = {
            "order_id": "ORD-VAL-STATUS-001",
            "client_id": self.ids["client_id"],
            "date": "2026-01-10",
            "total_items": 2,
            "total_amount": 1200,
            "status": "shipped",
        }
        response = open_as_role(self.client, self.app, "admin", "POST", "/api/orders", json_payload=payload)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.get_json().get("status"), "Shipped")

    def test_inventory_post_requires_required_fields(self):
        payload = {
            "item_name": "Pack Caps",
            "type": "Packaging",
            "warehouse_location": "WH-A",
            "current_stock": 100,
            "max_capacity": 1000,
            "expiry_date": "2028-01-01",
            "status": "",
        }
        response = open_as_role(self.client, self.app, "admin", "POST", "/api/inventory", json_payload=payload)
        self.assertEqual(response.status_code, 400)
        self.assertIn("Missing required fields", response.get_json()["msg"])

    def test_inventory_post_rejects_invalid_status(self):
        payload = {
            "item_name": "Pack Caps",
            "type": "Packaging",
            "warehouse_location": "WH-A",
            "current_stock": 100,
            "max_capacity": 1000,
            "expiry_date": "2028-01-01",
            "status": "Out of Stock",
        }
        response = open_as_role(self.client, self.app, "admin", "POST", "/api/inventory", json_payload=payload)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"msg": "Invalid status. Use Adequate, Low, or Critical"})

    def test_inventory_post_normalizes_status_casing(self):
        payload = {
            "item_name": "Pack Caps",
            "type": "Packaging",
            "warehouse_location": "WH-A",
            "current_stock": 100,
            "max_capacity": 1000,
            "expiry_date": "2028-01-01",
            "status": "critical",
        }
        response = open_as_role(self.client, self.app, "admin", "POST", "/api/inventory", json_payload=payload)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.get_json().get("status"), "Critical")

    def test_notifications_post_requires_required_fields(self):
        payload = {
            "title": "",
            "message": "Stock below threshold",
            "type": "warning",
        }
        response = open_as_role(self.client, self.app, "admin", "POST", "/api/notifications", json_payload=payload)
        self.assertEqual(response.status_code, 400)
        self.assertIn("Missing required fields", response.get_json()["msg"])

    def test_notifications_post_rejects_invalid_type(self):
        payload = {
            "title": "New Alert",
            "message": "Stock below threshold",
            "type": "critical",
        }
        response = open_as_role(self.client, self.app, "admin", "POST", "/api/notifications", json_payload=payload)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"msg": "Invalid type. Use alert, info, success, or warning"})

    def test_notifications_post_normalizes_type_casing(self):
        payload = {
            "title": "New Alert",
            "message": "Stock below threshold",
            "type": "WARNING",
        }
        response = open_as_role(self.client, self.app, "admin", "POST", "/api/notifications", json_payload=payload)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.get_json().get("type"), "warning")

    def test_notifications_put_requires_updatable_fields(self):
        notification_id = self.ids["notification_id"]
        response = open_as_role(
            self.client,
            self.app,
            "admin",
            "PUT",
            f"/api/notifications/{notification_id}",
            json_payload={},
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"msg": "No updatable fields provided"})

    def test_orders_post_invalid_json_payload(self):
        response = self.client.post(
            "/api/orders",
            data="not-json",
            headers=self.admin_json_headers,
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"msg": "Invalid JSON payload"})

    def test_orders_post_rejects_invalid_date(self):
        payload = {
            "order_id": "ORD-VAL-003",
            "client_id": self.ids["client_id"],
            "date": "bad-date",
            "total_items": 2,
            "total_amount": 1200,
            "status": "Pending",
        }
        response = open_as_role(self.client, self.app, "admin", "POST", "/api/orders", json_payload=payload)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"msg": "Invalid date. Use YYYY-MM-DD"})

    def test_orders_put_rejects_invalid_date(self):
        order_id = self.ids["order_id"]
        response = open_as_role(
            self.client,
            self.app,
            "admin",
            "PUT",
            f"/api/orders/{order_id}",
            json_payload={"date": "bad-date"},
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"msg": "Invalid date. Use YYYY-MM-DD"})

    def test_inventory_post_invalid_json_payload(self):
        response = self.client.post(
            "/api/inventory",
            data="not-json",
            headers=self.admin_json_headers,
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"msg": "Invalid JSON payload"})

    def test_inventory_post_rejects_invalid_expiry_date(self):
        payload = {
            "item_name": "Pack Caps",
            "type": "Packaging",
            "warehouse_location": "WH-A",
            "current_stock": 100,
            "max_capacity": 1000,
            "expiry_date": "2028-99-01",
            "status": "Low",
        }
        response = open_as_role(self.client, self.app, "admin", "POST", "/api/inventory", json_payload=payload)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"msg": "Invalid expiry_date. Use YYYY-MM-DD"})

    def test_inventory_put_rejects_invalid_expiry_date(self):
        inventory_id = self.ids["inventory_id"]
        response = open_as_role(
            self.client,
            self.app,
            "admin",
            "PUT",
            f"/api/inventory/{inventory_id}",
            json_payload={"expiry_date": "invalid"},
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"msg": "Invalid expiry_date. Use YYYY-MM-DD"})

    def test_production_post_invalid_json_payload(self):
        response = self.client.post(
            "/api/production",
            data="not-json",
            headers=self.admin_json_headers,
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"msg": "Invalid JSON payload"})

    def test_production_post_rejects_invalid_start_date(self):
        payload = {
            "batch_id": "BATCH-VAL-003",
            "product_id": self.ids["product_id"],
            "quantity": 100,
            "stage": "Planned",
            "start_date": "bad-date",
            "end_date": "2026-01-15",
        }
        response = open_as_role(self.client, self.app, "admin", "POST", "/api/production", json_payload=payload)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"msg": "Invalid start_date. Use YYYY-MM-DD"})

    def test_production_put_rejects_invalid_end_date(self):
        batch_id = self.ids["batch_id"]
        response = open_as_role(
            self.client,
            self.app,
            "admin",
            "PUT",
            f"/api/production/{batch_id}",
            json_payload={"end_date": "bad-date"},
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"msg": "Invalid end_date. Use YYYY-MM-DD"})

    def test_notifications_post_invalid_json_payload(self):
        response = self.client.post(
            "/api/notifications",
            data="not-json",
            headers=self.admin_json_headers,
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"msg": "Invalid JSON payload"})

    def test_orders_put_invalid_object_id(self):
        response = open_as_role(
            self.client,
            self.app,
            "admin",
            "PUT",
            "/api/orders/not-an-id",
            json_payload={"status": "Processing"},
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"msg": "Invalid order id"})

    def test_inventory_delete_invalid_object_id(self):
        response = open_as_role(
            self.client,
            self.app,
            "admin",
            "DELETE",
            "/api/inventory/not-an-id",
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"msg": "Invalid inventory id"})

    def test_notifications_delete_invalid_object_id(self):
        response = open_as_role(
            self.client,
            self.app,
            "admin",
            "DELETE",
            "/api/notifications/not-an-id",
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"msg": "Invalid notification id"})

    def test_orders_post_rejects_non_numeric_total_items(self):
        payload = {
            "order_id": "ORD-VAL-004",
            "client_id": self.ids["client_id"],
            "date": "2026-01-10",
            "total_items": "many",
            "total_amount": 1200,
            "status": "Pending",
        }
        response = open_as_role(self.client, self.app, "admin", "POST", "/api/orders", json_payload=payload)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"msg": "total_items must be a valid number"})

    def test_orders_post_rejects_non_numeric_total_amount(self):
        payload = {
            "order_id": "ORD-VAL-005",
            "client_id": self.ids["client_id"],
            "date": "2026-01-10",
            "total_items": 2,
            "total_amount": "a-lot",
            "status": "Pending",
        }
        response = open_as_role(self.client, self.app, "admin", "POST", "/api/orders", json_payload=payload)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"msg": "total_amount must be a valid number"})

    def test_orders_post_rejects_negative_totals(self):
        payload = {
            "order_id": "ORD-VAL-006",
            "client_id": self.ids["client_id"],
            "date": "2026-01-10",
            "total_items": -1,
            "total_amount": -1,
            "status": "Pending",
        }
        response = open_as_role(self.client, self.app, "admin", "POST", "/api/orders", json_payload=payload)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"msg": "total_items must be greater than or equal to 0"})

    def test_orders_post_rejects_order_id_max_length(self):
        payload = {
            "order_id": "O" * 41,
            "client_id": self.ids["client_id"],
            "date": "2026-01-10",
            "total_items": 2,
            "total_amount": 1200,
            "status": "Pending",
        }
        response = open_as_role(self.client, self.app, "admin", "POST", "/api/orders", json_payload=payload)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"msg": "order_id must be at most 40 characters"})

    def test_inventory_post_rejects_non_numeric_current_stock(self):
        payload = {
            "item_name": "Pack Caps",
            "type": "Packaging",
            "warehouse_location": "WH-A",
            "current_stock": "many",
            "max_capacity": 1000,
            "expiry_date": "2028-01-01",
            "status": "Low",
        }
        response = open_as_role(self.client, self.app, "admin", "POST", "/api/inventory", json_payload=payload)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"msg": "current_stock must be a valid number"})

    def test_inventory_post_rejects_non_numeric_max_capacity(self):
        payload = {
            "item_name": "Pack Caps",
            "type": "Packaging",
            "warehouse_location": "WH-A",
            "current_stock": 100,
            "max_capacity": "huge",
            "expiry_date": "2028-01-01",
            "status": "Low",
        }
        response = open_as_role(self.client, self.app, "admin", "POST", "/api/inventory", json_payload=payload)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"msg": "max_capacity must be a valid number"})

    def test_inventory_post_rejects_negative_values(self):
        payload = {
            "item_name": "Pack Caps",
            "type": "Packaging",
            "warehouse_location": "WH-A",
            "current_stock": -1,
            "max_capacity": 1000,
            "expiry_date": "2028-01-01",
            "status": "Low",
        }
        response = open_as_role(self.client, self.app, "admin", "POST", "/api/inventory", json_payload=payload)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"msg": "current_stock must be greater than or equal to 0"})

    def test_inventory_post_rejects_item_name_max_length(self):
        payload = {
            "item_name": "N" * 121,
            "type": "Packaging",
            "warehouse_location": "WH-A",
            "current_stock": 100,
            "max_capacity": 1000,
            "expiry_date": "2028-01-01",
            "status": "Low",
        }
        response = open_as_role(self.client, self.app, "admin", "POST", "/api/inventory", json_payload=payload)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"msg": "item_name must be at most 120 characters"})

    def test_production_post_rejects_non_numeric_quantity(self):
        payload = {
            "batch_id": "BATCH-VAL-004",
            "product_id": self.ids["product_id"],
            "quantity": "tons",
            "stage": "Planned",
            "start_date": "2026-01-10",
            "end_date": "2026-01-15",
        }
        response = open_as_role(self.client, self.app, "admin", "POST", "/api/production", json_payload=payload)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"msg": "quantity must be a valid number"})

    def test_production_post_rejects_negative_quantity(self):
        payload = {
            "batch_id": "BATCH-VAL-005",
            "product_id": self.ids["product_id"],
            "quantity": -1,
            "stage": "Planned",
            "start_date": "2026-01-10",
            "end_date": "2026-01-15",
        }
        response = open_as_role(self.client, self.app, "admin", "POST", "/api/production", json_payload=payload)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"msg": "quantity must be greater than or equal to 0"})

    def test_production_post_rejects_batch_id_max_length(self):
        payload = {
            "batch_id": "B" * 41,
            "product_id": self.ids["product_id"],
            "quantity": 100,
            "stage": "Planned",
            "start_date": "2026-01-10",
            "end_date": "2026-01-15",
        }
        response = open_as_role(self.client, self.app, "admin", "POST", "/api/production", json_payload=payload)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"msg": "batch_id must be at most 40 characters"})

    def test_production_post_normalizes_stage_casing(self):
        payload = {
            "batch_id": "BATCH-VAL-006",
            "product_id": self.ids["product_id"],
            "quantity": 100,
            "stage": "in progress",
            "start_date": "2026-01-10",
            "end_date": "2026-01-15",
        }
        response = open_as_role(self.client, self.app, "admin", "POST", "/api/production", json_payload=payload)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.get_json().get("stage"), "In Progress")

    def test_notifications_post_rejects_title_max_length(self):
        payload = {
            "title": "T" * 161,
            "message": "Stock below threshold",
            "type": "warning",
        }
        response = open_as_role(self.client, self.app, "admin", "POST", "/api/notifications", json_payload=payload)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"msg": "title must be at most 160 characters"})

    def test_notifications_post_rejects_message_max_length(self):
        payload = {
            "title": "Stock Alert",
            "message": "M" * 1001,
            "type": "warning",
        }
        response = open_as_role(self.client, self.app, "admin", "POST", "/api/notifications", json_payload=payload)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"msg": "message must be at most 1000 characters"})
