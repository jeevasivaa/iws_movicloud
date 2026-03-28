import unittest

from rbac_test_support import open_as_role
from validation_test_support import get_client_and_auth_header


class PeopleFinanceValidationTest(unittest.TestCase):
    def setUp(self):
        app, client, fake_db, admin_json_headers = get_client_and_auth_header("admin")
        self.app = app
        self.client = client
        self.fake_db = fake_db
        self.admin_json_headers = admin_json_headers
        self.ids = fake_db.id_strings

    def test_staff_post_requires_required_fields(self):
        payload = {
            "name": "",
            "email": "staff.new@example.com",
            "role": "staff",
            "department": "Production",
            "status": "Active",
        }
        response = open_as_role(self.client, self.app, "admin", "POST", "/api/staff", json_payload=payload)
        self.assertEqual(response.status_code, 400)
        self.assertIn("Missing required fields", response.get_json()["msg"])

    def test_staff_post_rejects_duplicate_email(self):
        payload = {
            "name": "Duplicate Admin",
            "email": "admin@vsafoods.com",
            "role": "staff",
            "department": "Production",
            "status": "Active",
        }
        response = open_as_role(self.client, self.app, "admin", "POST", "/api/staff", json_payload=payload)
        self.assertEqual(response.status_code, 409)
        self.assertEqual(response.get_json(), {"msg": "Email already exists"})

    def test_staff_requests_reject_requires_valid_request_id(self):
        response = open_as_role(
            self.client,
            self.app,
            "admin",
            "PATCH",
            "/api/staff/requests/not-an-object-id/reject",
            json_payload={"reason": "Invalid"},
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"msg": "Invalid request id"})

    def test_billing_post_requires_required_fields(self):
        payload = {
            "invoice_number": "INV-VAL-001",
            "client_id": "",
            "date": "2026-01-10",
            "amount": 1000,
            "status": "Pending",
            "items": [],
        }
        response = open_as_role(self.client, self.app, "admin", "POST", "/api/billing", json_payload=payload)
        self.assertEqual(response.status_code, 400)
        self.assertIn("Missing required fields", response.get_json()["msg"])

    def test_billing_post_rejects_invalid_status(self):
        payload = {
            "invoice_number": "INV-VAL-002",
            "client_id": self.ids["client_id"],
            "date": "2026-01-10",
            "amount": 1000,
            "status": "Cancelled",
            "items": [],
        }
        response = open_as_role(self.client, self.app, "admin", "POST", "/api/billing", json_payload=payload)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"msg": "Invalid status. Use Paid, Pending, or Overdue"})

    def test_billing_post_normalizes_status_casing(self):
        payload = {
            "invoice_number": "INV-VAL-STATUS-001",
            "client_id": self.ids["client_id"],
            "date": "2026-01-10",
            "amount": 1000,
            "status": "paid",
            "items": [],
        }
        response = open_as_role(self.client, self.app, "admin", "POST", "/api/billing", json_payload=payload)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.get_json().get("status"), "Paid")

    def test_payroll_post_requires_required_fields(self):
        payload = {
            "staff_id": self.ids["staff_user_id"],
            "base_salary": 10000,
            "deductions": "",
            "net_pay": 9000,
            "month": "2026-01",
            "status": "Pending",
        }
        response = open_as_role(self.client, self.app, "admin", "POST", "/api/payroll", json_payload=payload)
        self.assertEqual(response.status_code, 400)
        self.assertIn("Missing required fields", response.get_json()["msg"])

    def test_payroll_post_rejects_invalid_status(self):
        payload = {
            "staff_id": self.ids["staff_user_id"],
            "base_salary": 10000,
            "deductions": 1000,
            "net_pay": 9000,
            "month": "2026-01",
            "status": "Cancelled",
        }
        response = open_as_role(self.client, self.app, "admin", "POST", "/api/payroll", json_payload=payload)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"msg": "Invalid status. Use Paid or Pending"})

    def test_payroll_post_normalizes_status_casing(self):
        payload = {
            "staff_id": self.ids["staff_user_id"],
            "base_salary": 10000,
            "deductions": 1000,
            "net_pay": 9000,
            "month": "2026-01",
            "status": "pending",
        }
        response = open_as_role(self.client, self.app, "admin", "POST", "/api/payroll", json_payload=payload)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.get_json().get("status"), "Pending")

    def test_billing_put_requires_updatable_fields(self):
        invoice_id = self.ids["invoice_id"]
        response = open_as_role(
            self.client,
            self.app,
            "admin",
            "PUT",
            f"/api/billing/{invoice_id}",
            json_payload={},
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"msg": "No updatable fields provided"})

    def test_billing_post_invalid_json_payload(self):
        response = self.client.post(
            "/api/billing",
            data="not-json",
            headers=self.admin_json_headers,
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"msg": "Invalid JSON payload"})

    def test_billing_post_rejects_invalid_date(self):
        payload = {
            "invoice_number": "INV-VAL-003",
            "client_id": self.ids["client_id"],
            "date": "not-a-date",
            "amount": 1000,
            "status": "Pending",
            "items": [],
        }
        response = open_as_role(self.client, self.app, "admin", "POST", "/api/billing", json_payload=payload)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"msg": "Invalid date. Use YYYY-MM-DD"})

    def test_billing_put_rejects_invalid_date(self):
        invoice_id = self.ids["invoice_id"]
        response = open_as_role(
            self.client,
            self.app,
            "admin",
            "PUT",
            f"/api/billing/{invoice_id}",
            json_payload={"date": "bad-date"},
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"msg": "Invalid date. Use YYYY-MM-DD"})

    def test_payroll_post_invalid_json_payload(self):
        response = self.client.post(
            "/api/payroll",
            data="not-json",
            headers=self.admin_json_headers,
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"msg": "Invalid JSON payload"})

    def test_payroll_post_rejects_invalid_month(self):
        payload = {
            "staff_id": self.ids["staff_user_id"],
            "base_salary": 10000,
            "deductions": 1000,
            "net_pay": 9000,
            "month": "2026-13",
            "status": "Pending",
        }
        response = open_as_role(self.client, self.app, "admin", "POST", "/api/payroll", json_payload=payload)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"msg": "Invalid month. Use YYYY-MM"})

    def test_payroll_put_rejects_invalid_month(self):
        payroll_id = self.ids["payroll_id"]
        response = open_as_role(
            self.client,
            self.app,
            "admin",
            "PUT",
            f"/api/payroll/{payroll_id}",
            json_payload={"month": "not-month"},
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"msg": "Invalid month. Use YYYY-MM"})

    def test_staff_post_invalid_json_payload(self):
        response = self.client.post(
            "/api/staff",
            data="not-json",
            headers=self.admin_json_headers,
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"msg": "Invalid JSON payload"})

    def test_staff_put_invalid_object_id(self):
        response = open_as_role(
            self.client,
            self.app,
            "admin",
            "PUT",
            "/api/staff/not-an-id",
            json_payload={"name": "Updated"},
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"msg": "Invalid staff id"})

    def test_billing_delete_invalid_object_id(self):
        response = open_as_role(
            self.client,
            self.app,
            "admin",
            "DELETE",
            "/api/billing/not-an-id",
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"msg": "Invalid invoice id"})

    def test_payroll_delete_invalid_object_id(self):
        response = open_as_role(
            self.client,
            self.app,
            "admin",
            "DELETE",
            "/api/payroll/not-an-id",
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"msg": "Invalid payroll id"})

    def test_billing_post_rejects_non_numeric_amount(self):
        payload = {
            "invoice_number": "INV-VAL-004",
            "client_id": self.ids["client_id"],
            "date": "2026-01-10",
            "amount": "abc",
            "status": "Pending",
            "items": [],
        }
        response = open_as_role(self.client, self.app, "admin", "POST", "/api/billing", json_payload=payload)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"msg": "amount must be a valid number"})

    def test_billing_post_rejects_negative_amount(self):
        payload = {
            "invoice_number": "INV-VAL-005",
            "client_id": self.ids["client_id"],
            "date": "2026-01-10",
            "amount": -1,
            "status": "Pending",
            "items": [],
        }
        response = open_as_role(self.client, self.app, "admin", "POST", "/api/billing", json_payload=payload)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"msg": "amount must be greater than or equal to 0"})

    def test_billing_post_rejects_non_array_items(self):
        payload = {
            "invoice_number": "INV-VAL-006",
            "client_id": self.ids["client_id"],
            "date": "2026-01-10",
            "amount": 1000,
            "status": "Pending",
            "items": {"line": 1},
        }
        response = open_as_role(self.client, self.app, "admin", "POST", "/api/billing", json_payload=payload)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"msg": "items must be an array"})

    def test_billing_post_rejects_invoice_number_max_length(self):
        payload = {
            "invoice_number": "I" * 41,
            "client_id": self.ids["client_id"],
            "date": "2026-01-10",
            "amount": 1000,
            "status": "Pending",
            "items": [],
        }
        response = open_as_role(self.client, self.app, "admin", "POST", "/api/billing", json_payload=payload)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"msg": "invoice_number must be at most 40 characters"})

    def test_payroll_post_rejects_non_numeric_base_salary(self):
        payload = {
            "staff_id": self.ids["staff_user_id"],
            "base_salary": "bad",
            "deductions": 1000,
            "net_pay": 9000,
            "month": "2026-01",
            "status": "Pending",
        }
        response = open_as_role(self.client, self.app, "admin", "POST", "/api/payroll", json_payload=payload)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"msg": "base_salary must be a valid number"})

    def test_payroll_post_rejects_negative_base_salary(self):
        payload = {
            "staff_id": self.ids["staff_user_id"],
            "base_salary": -1,
            "deductions": 1000,
            "net_pay": 9000,
            "month": "2026-01",
            "status": "Pending",
        }
        response = open_as_role(self.client, self.app, "admin", "POST", "/api/payroll", json_payload=payload)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"msg": "base_salary must be greater than or equal to 0"})

    def test_payroll_post_rejects_negative_deductions(self):
        payload = {
            "staff_id": self.ids["staff_user_id"],
            "base_salary": 10000,
            "deductions": -1,
            "net_pay": 9000,
            "month": "2026-01",
            "status": "Pending",
        }
        response = open_as_role(self.client, self.app, "admin", "POST", "/api/payroll", json_payload=payload)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"msg": "deductions must be greater than or equal to 0"})

    def test_payroll_post_rejects_negative_net_pay(self):
        payload = {
            "staff_id": self.ids["staff_user_id"],
            "base_salary": 10000,
            "deductions": 1000,
            "net_pay": -1,
            "month": "2026-01",
            "status": "Pending",
        }
        response = open_as_role(self.client, self.app, "admin", "POST", "/api/payroll", json_payload=payload)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"msg": "net_pay must be greater than or equal to 0"})

    def test_staff_post_rejects_invalid_role(self):
        payload = {
            "name": "New Staff",
            "email": "new.staff@example.com",
            "role": "owner",
            "department": "Production",
            "status": "Active",
        }
        response = open_as_role(self.client, self.app, "admin", "POST", "/api/staff", json_payload=payload)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"msg": "Invalid role. Use admin, manager, staff, finance, or client"})

    def test_staff_post_normalizes_status_casing(self):
        payload = {
            "name": "New Staff",
            "email": "new.staff.case@example.com",
            "role": "staff",
            "department": "Production",
            "status": "on leave",
        }
        response = open_as_role(self.client, self.app, "admin", "POST", "/api/staff", json_payload=payload)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.get_json().get("status"), "On Leave")

    def test_staff_post_rejects_name_max_length(self):
        payload = {
            "name": "N" * 121,
            "email": "long.name@example.com",
            "role": "staff",
            "department": "Production",
            "status": "Active",
        }
        response = open_as_role(self.client, self.app, "admin", "POST", "/api/staff", json_payload=payload)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"msg": "name must be at most 120 characters"})

    def test_payroll_post_rejects_non_numeric_deductions(self):
        payload = {
            "staff_id": self.ids["staff_user_id"],
            "base_salary": 10000,
            "deductions": "bad",
            "net_pay": 9000,
            "month": "2026-01",
            "status": "Pending",
        }
        response = open_as_role(self.client, self.app, "admin", "POST", "/api/payroll", json_payload=payload)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"msg": "deductions must be a valid number"})

    def test_payroll_post_rejects_non_numeric_net_pay(self):
        payload = {
            "staff_id": self.ids["staff_user_id"],
            "base_salary": 10000,
            "deductions": 1000,
            "net_pay": "bad",
            "month": "2026-01",
            "status": "Pending",
        }
        response = open_as_role(self.client, self.app, "admin", "POST", "/api/payroll", json_payload=payload)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"msg": "net_pay must be a valid number"})
