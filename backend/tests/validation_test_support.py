from rbac_test_support import get_test_client, headers_for_role


def get_client_and_auth_header(role="admin"):
    app, client, fake_db = get_test_client(reset_db=True)
    auth_header = headers_for_role(app, role).get("Authorization")
    return app, client, fake_db, {"Authorization": auth_header, "Content-Type": "application/json"}
