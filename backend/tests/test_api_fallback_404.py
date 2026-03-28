import unittest

from rbac_test_support import get_test_context


class ApiFallbackBehaviorTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        app, _db = get_test_context()
        cls.client = app.test_client()

    def test_unknown_api_path_returns_json_404(self):
        response = self.client.get("/api/does-not-exist")
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.get_json(), {"msg": "API endpoint not found"})

    def test_api_root_returns_json_404(self):
        response = self.client.get("/api")
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.get_json(), {"msg": "API endpoint not found"})
