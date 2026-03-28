import unittest

from rbac_test_support import open_as_role
from validation_test_support import get_client_and_auth_header


class BusinessDataValidationTest(unittest.TestCase):
    def setUp(self):
        app, client, fake_db, admin_json_headers = get_client_and_auth_header("admin")
        self.app = app
        self.client = client
        self.fake_db = fake_db
        self.admin_json_headers = admin_json_headers
        self.ids = fake_db.id_strings

    def test_products_post_requires_required_fields(self):
        payload = {
            "name": "Test Product",
            "sku": "",
            "category": "Cold Pressed Oils",
            "price": 100,
            "stock": 5,
            "status": "Active",
        }
        response = open_as_role(self.client, self.app, "admin", "POST", "/api/products", json_payload=payload)
        self.assertEqual(response.status_code, 400)
        self.assertIn("Missing required fields", response.get_json()["msg"])

    def test_products_post_rejects_invalid_status(self):
        payload = {
            "name": "Test Product",
            "sku": "SKU-VAL-001",
            "category": "Cold Pressed Oils",
            "price": 100,
            "stock": 5,
            "status": "Archived",
        }
        response = open_as_role(self.client, self.app, "admin", "POST", "/api/products", json_payload=payload)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"msg": "Invalid status. Use Active, Low Stock, or Out of Stock"})

    def test_products_post_normalizes_status_casing(self):
        payload = {
            "name": "Status Product",
            "sku": "SKU-STATUS-001",
            "category": "Cold Pressed Oils",
            "price": 100,
            "stock": 5,
            "status": "low stock",
        }
        response = open_as_role(self.client, self.app, "admin", "POST", "/api/products", json_payload=payload)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.get_json().get("status"), "Low Stock")

    def test_products_put_rejects_invalid_status(self):
        product_id = self.ids["product_id"]
        response = open_as_role(
            self.client,
            self.app,
            "admin",
            "PUT",
            f"/api/products/{product_id}",
            json_payload={"status": "Archived"},
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"msg": "Invalid status. Use Active, Low Stock, or Out of Stock"})

    def test_suppliers_post_rejects_invalid_status(self):
        payload = {
            "name": "Supplier",
            "location": "Kerala",
            "category_supplied": "Coconut",
            "rating": 4.4,
            "total_orders": 9,
            "status": "Blocked",
        }
        response = open_as_role(self.client, self.app, "admin", "POST", "/api/suppliers", json_payload=payload)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"msg": "Invalid status. Use Active, Inactive, or Under Review"})

    def test_suppliers_post_rejects_non_numeric_rating(self):
        payload = {
            "name": "Supplier",
            "location": "Kerala",
            "category_supplied": "Coconut",
            "rating": "great",
            "total_orders": 9,
            "status": "Active",
        }
        response = open_as_role(self.client, self.app, "admin", "POST", "/api/suppliers", json_payload=payload)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"msg": "rating must be a valid number"})

    def test_suppliers_post_rejects_non_numeric_total_orders(self):
        payload = {
            "name": "Supplier",
            "location": "Kerala",
            "category_supplied": "Coconut",
            "rating": 4.1,
            "total_orders": "many",
            "status": "Active",
        }
        response = open_as_role(self.client, self.app, "admin", "POST", "/api/suppliers", json_payload=payload)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"msg": "total_orders must be a valid number"})

    def test_suppliers_post_rejects_out_of_range_rating(self):
        payload = {
            "name": "Supplier",
            "location": "Kerala",
            "category_supplied": "Coconut",
            "rating": 5.5,
            "total_orders": 9,
            "status": "Active",
        }
        response = open_as_role(self.client, self.app, "admin", "POST", "/api/suppliers", json_payload=payload)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"msg": "rating must be between 0 and 5"})

    def test_suppliers_post_normalizes_status_casing(self):
        payload = {
            "name": "Supplier",
            "location": "Kerala",
            "category_supplied": "Coconut",
            "rating": 4.2,
            "total_orders": 9,
            "status": "under review",
        }
        response = open_as_role(self.client, self.app, "admin", "POST", "/api/suppliers", json_payload=payload)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.get_json().get("status"), "Under Review")

    def test_marketing_post_requires_fields(self):
        payload = {
            "company_name": "Acme",
            "contact_person": "",
            "email": "test@acme.com",
            "total_orders": 1,
            "last_order_date": "2026-01-01",
            "rating": 4.1,
        }
        response = open_as_role(self.client, self.app, "admin", "POST", "/api/marketing", json_payload=payload)
        self.assertEqual(response.status_code, 400)
        self.assertIn("Missing required fields", response.get_json()["msg"])

    def test_settings_put_requires_key_for_single_payload(self):
        response = open_as_role(
            self.client,
            self.app,
            "admin",
            "PUT",
            "/api/settings",
            json_payload={"value": False},
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"msg": "key is required"})

    def test_products_post_invalid_json_payload(self):
        response = self.client.post(
            "/api/products",
            data="not-json",
            headers=self.admin_json_headers,
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"msg": "Invalid JSON payload"})

    def test_products_put_invalid_object_id(self):
        response = open_as_role(
            self.client,
            self.app,
            "admin",
            "PUT",
            "/api/products/not-an-id",
            json_payload={"name": "Updated"},
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"msg": "Invalid product id"})

    def test_marketing_post_rejects_invalid_last_order_date(self):
        payload = {
            "company_name": "Acme",
            "contact_person": "Maya",
            "email": "test@acme.com",
            "total_orders": 1,
            "last_order_date": "2026-99-99",
            "rating": 4.1,
        }
        response = open_as_role(self.client, self.app, "admin", "POST", "/api/marketing", json_payload=payload)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"msg": "Invalid last_order_date. Use YYYY-MM-DD"})

    def test_settings_put_invalid_json_payload(self):
        response = self.client.put(
            "/api/settings",
            data="not-json",
            headers=self.admin_json_headers,
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"msg": "Invalid JSON payload"})

    def test_products_post_rejects_non_numeric_price(self):
        payload = {
            "name": "Test Product",
            "sku": "SKU-VAL-002",
            "category": "Cold Pressed Oils",
            "price": "high",
            "stock": 5,
            "status": "Active",
        }
        response = open_as_role(self.client, self.app, "admin", "POST", "/api/products", json_payload=payload)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"msg": "price must be a valid number"})

    def test_products_post_rejects_non_numeric_stock(self):
        payload = {
            "name": "Test Product",
            "sku": "SKU-VAL-003",
            "category": "Cold Pressed Oils",
            "price": 100,
            "stock": "plenty",
            "status": "Active",
        }
        response = open_as_role(self.client, self.app, "admin", "POST", "/api/products", json_payload=payload)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"msg": "stock must be a valid number"})

    def test_products_post_rejects_negative_values(self):
        payload = {
            "name": "Test Product",
            "sku": "SKU-NEG-001",
            "category": "Cold Pressed Oils",
            "price": -1,
            "stock": -1,
            "status": "Active",
        }
        response = open_as_role(self.client, self.app, "admin", "POST", "/api/products", json_payload=payload)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"msg": "price must be greater than or equal to 0"})

    def test_products_post_rejects_max_length_violations(self):
        payload = {
            "name": "N" * 121,
            "sku": "SKU-VAL-004",
            "category": "Cold Pressed Oils",
            "price": 100,
            "stock": 5,
            "status": "Active",
        }
        response = open_as_role(self.client, self.app, "admin", "POST", "/api/products", json_payload=payload)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"msg": "name must be at most 120 characters"})

    def test_suppliers_put_invalid_object_id(self):
        response = open_as_role(
            self.client,
            self.app,
            "admin",
            "PUT",
            "/api/suppliers/not-an-id",
            json_payload={"name": "Updated Supplier"},
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"msg": "Invalid supplier id"})

    def test_marketing_put_invalid_object_id(self):
        response = open_as_role(
            self.client,
            self.app,
            "admin",
            "PUT",
            "/api/marketing/not-an-id",
            json_payload={"company_name": "Updated"},
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"msg": "Invalid client id"})

    def test_marketing_put_rejects_invalid_last_order_date(self):
        client_id = self.ids["client_id"]
        response = open_as_role(
            self.client,
            self.app,
            "admin",
            "PUT",
            f"/api/marketing/{client_id}",
            json_payload={"last_order_date": "bad-date"},
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"msg": "Invalid last_order_date. Use YYYY-MM-DD"})

    def test_marketing_post_invalid_json_payload(self):
        response = self.client.post(
            "/api/marketing",
            data="not-json",
            headers=self.admin_json_headers,
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"msg": "Invalid JSON payload"})

    def test_marketing_post_rejects_negative_totals(self):
        payload = {
            "company_name": "Acme",
            "contact_person": "Maya",
            "email": "test@acme.com",
            "total_orders": -1,
            "last_order_date": "2026-01-01",
            "rating": 4.1,
        }
        response = open_as_role(self.client, self.app, "admin", "POST", "/api/marketing", json_payload=payload)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"msg": "total_orders must be greater than or equal to 0"})

    def test_marketing_post_rejects_out_of_range_rating(self):
        payload = {
            "company_name": "Acme",
            "contact_person": "Maya",
            "email": "test@acme.com",
            "total_orders": 1,
            "last_order_date": "2026-01-01",
            "rating": 7,
        }
        response = open_as_role(self.client, self.app, "admin", "POST", "/api/marketing", json_payload=payload)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"msg": "rating must be between 0 and 5"})

    def test_products_delete_invalid_object_id(self):
        response = open_as_role(
            self.client,
            self.app,
            "admin",
            "DELETE",
            "/api/products/not-an-id",
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"msg": "Invalid product id"})
