import unittest

from rbac_test_support import get_test_client


class AuthValidationTest(unittest.TestCase):
    def setUp(self):
        _app, client, _db = get_test_client(reset_db=True)
        self.client = client

    def test_register_requires_name_email_and_password(self):
        response = self.client.post("/api/auth/register", json={"name": "", "email": "", "password": ""})
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"msg": "Missing required fields"})

    def test_register_rejects_invalid_role(self):
        response = self.client.post(
            "/api/auth/register",
            json={
                "name": "Test User",
                "email": "test.user@example.com",
                "password": "password123",
                "role": "owner",
            },
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"msg": "Invalid role"})

    def test_register_rejects_duplicate_email(self):
        response = self.client.post(
            "/api/auth/register",
            json={
                "name": "Admin Clone",
                "email": "admin@vsafoods.com",
                "password": "password123",
                "role": "admin",
            },
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"msg": "Email already exists"})

    def test_login_requires_email_and_password(self):
        response = self.client.post("/api/auth/login", json={"email": "", "password": ""})
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"msg": "Missing email or password"})

    def test_login_rejects_invalid_credentials(self):
        response = self.client.post(
            "/api/auth/login",
            json={"email": "admin@vsafoods.com", "password": "wrong-password"},
        )
        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.get_json(), {"msg": "Invalid email or password"})

    def test_login_invalid_json_payload_returns_400(self):
        response = self.client.post(
            "/api/auth/login",
            data="not-json",
            headers={"Content-Type": "application/json"},
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"msg": "Missing email or password"})
