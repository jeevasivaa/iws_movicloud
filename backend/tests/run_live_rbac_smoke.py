import argparse
import contextlib
import io
import os
import sys
import uuid
from dataclasses import dataclass
from pathlib import Path


THIS_FILE = Path(__file__).resolve()
TESTS_DIR = THIS_FILE.parent
BACKEND_DIR = TESTS_DIR.parent
WORKSPACE_DIR = BACKEND_DIR.parent

for path in (str(TESTS_DIR), str(BACKEND_DIR), str(WORKSPACE_DIR)):
    if path not in sys.path:
        sys.path.insert(0, path)


DEFAULT_ROLE_USERS = {
    "admin": ("admin@vsafoods.com", "password123"),
    "manager": ("vikram@vsafoods.com", "password123"),
    "staff": ("anita@vsafoods.com", "password123"),
    "finance": ("ravi.finance@vsafoods.com", "password123"),
    "client": ("nita@organichub.in", "password123"),
}

ALL_ROLES = tuple(DEFAULT_ROLE_USERS.keys())


@dataclass
class RoleSummary:
    ok: int = 0
    forbidden: int = 0
    fail: int = 0


def parse_args():
    parser = argparse.ArgumentParser(
        description="Run live role-by-role RBAC and API fallback smoke checks against MongoDB."
    )
    parser.add_argument(
        "--mongo-uri",
        help="Mongo URI. If omitted, uses MONGO_URI from environment.",
    )
    parser.add_argument(
        "--mongo-db-name",
        help=(
            "Base database name prefix. The runner always uses an isolated "
            "<base>_smoke_<suffix> database."
        ),
    )
    parser.add_argument(
        "--jwt-secret-key",
        help="JWT secret key. If omitted, uses JWT_SECRET_KEY from environment.",
    )
    parser.add_argument(
        "--roles",
        default=",".join(ALL_ROLES),
        help="Comma-separated roles to test. Default: admin,manager,staff,finance,client",
    )
    parser.add_argument(
        "--keep-db",
        action="store_true",
        help="Keep the smoke database after run (default is drop database).",
    )
    parser.add_argument(
        "--verbose-seed",
        action="store_true",
        help="Show full seed output for each role reset.",
    )
    return parser.parse_args()


def configure_environment(args):
    if args.mongo_uri:
        os.environ["MONGO_URI"] = args.mongo_uri
    if args.jwt_secret_key:
        os.environ["JWT_SECRET_KEY"] = args.jwt_secret_key

    mongo_uri = os.getenv("MONGO_URI")
    if not mongo_uri:
        raise RuntimeError("MONGO_URI is required. Set it in env or pass --mongo-uri.")

    base_db_name = args.mongo_db_name or os.getenv("MONGO_DB_NAME", "iws")
    db_name = f"{base_db_name}_smoke_{uuid.uuid4().hex[:8]}"
    os.environ["MONGO_DB_NAME"] = db_name

    os.environ.setdefault("JWT_SECRET_KEY", "dev-secret-change-me")
    return db_name


def parse_roles(raw_roles):
    roles = [role.strip().lower() for role in raw_roles.split(",") if role.strip()]
    invalid = [role for role in roles if role not in ALL_ROLES]
    if invalid:
        raise RuntimeError(f"Unsupported roles: {', '.join(invalid)}")
    if not roles:
        raise RuntimeError("No roles selected.")
    return tuple(roles)


def seed_database_for_role(seed_database, verbose):
    if verbose:
        seed_database()
        return

    with contextlib.redirect_stdout(io.StringIO()):
        seed_database()


def build_path_ids(db, object_id_cls):
    def fetch_id(collection, query=None):
        row = db[collection].find_one(query or {})
        return str(row["_id"]) if row else str(object_id_cls())

    staff_user = db["users"].find_one({"role": "staff"}) or {}

    return {
        "product_id": fetch_id("products"),
        "supplier_id": fetch_id("suppliers"),
        "client_id": fetch_id("clients"),
        "inventory_id": fetch_id("inventory"),
        "order_id": fetch_id("orders"),
        "invoice_id": fetch_id("invoices"),
        "payroll_id": fetch_id("payroll"),
        "batch_id": fetch_id("production_batches"),
        "notification_id": fetch_id("notifications"),
        "setting_id": fetch_id("settings"),
        "staff_request_id": fetch_id("staff_requests"),
        "staff_user_id": str(staff_user.get("_id", object_id_cls())),
    }


def login_for_role(http_client, role):
    email, password = DEFAULT_ROLE_USERS[role]
    response = http_client.post("/api/auth/login", json={"email": email, "password": password})
    if response.status_code != 200:
        body = response.get_data(as_text=True)
        raise RuntimeError(f"Login failed for {role}: status={response.status_code}, body={body}")

    payload = response.get_json() or {}
    token = payload.get("access_token")
    if not token:
        raise RuntimeError(f"Login response for {role} did not include access_token")

    return token


def run():
    args = parse_args()
    db_name = configure_environment(args)
    selected_roles = parse_roles(args.roles)

    from bson import ObjectId  # type: ignore[import-untyped]

    from app import create_app
    from rbac_cases import RBAC_MATRIX_BUSINESS_DATA, RBAC_MATRIX_OPS_ALERTS, RBAC_MATRIX_PEOPLE_FINANCE
    from seed_db import seed_database
    from utils.db import client as mongo_client
    from utils.db import get_db

    endpoint_matrix = list(RBAC_MATRIX_BUSINESS_DATA) + list(RBAC_MATRIX_PEOPLE_FINANCE) + list(RBAC_MATRIX_OPS_ALERTS)
    role_stats = {role: RoleSummary() for role in selected_roles}
    failures = []

    app = create_app()
    http_client = app.test_client()
    db = get_db()

    try:
        for role in selected_roles:
            seed_database_for_role(seed_database, args.verbose_seed)
            path_ids = build_path_ids(db, ObjectId)
            token = login_for_role(http_client, role)
            headers = {"Authorization": "Bearer " + token}

            for case in endpoint_matrix:
                request_kwargs = {
                    "method": case.method,
                    "path": case.path.format(**path_ids),
                    "headers": headers,
                }
                if case.payload_factory is not None:
                    request_kwargs["json"] = case.payload_factory(path_ids)

                response = http_client.open(**request_kwargs)
                status_code = response.status_code

                if role in case.allowed_roles:
                    if status_code in case.ok_statuses:
                        role_stats[role].ok += 1
                    else:
                        role_stats[role].fail += 1
                        body = response.get_data(as_text=True)[:240]
                        failures.append(
                            f"ALLOW_FAIL role={role} endpoint={case.name} expected={case.ok_statuses} got={status_code} body={body}"
                        )
                else:
                    if status_code == 403:
                        role_stats[role].forbidden += 1
                    else:
                        role_stats[role].fail += 1
                        body = response.get_data(as_text=True)[:240]
                        failures.append(
                            f"DENY_FAIL role={role} endpoint={case.name} expected=403 got={status_code} body={body}"
                        )

        fallback_failures = []
        for path in ("/api", "/api/does-not-exist"):
            response = http_client.get(path)
            payload = response.get_json(silent=True)
            if response.status_code != 404 or not isinstance(payload, dict) or payload.get("msg") != "API endpoint not found":
                fallback_failures.append(
                    f"FALLBACK_FAIL path={path} status={response.status_code} body={response.get_data(as_text=True)[:240]}"
                )

        print("Live RBAC/API smoke results")
        print(f"database={db_name}")
        print(f"cases={len(endpoint_matrix)}")
        print(f"roles={','.join(selected_roles)}")
        print(f"total_checks={len(endpoint_matrix) * len(selected_roles)}")

        for role in selected_roles:
            stats = role_stats[role]
            print(f"- {role}: ok={stats.ok} forbidden={stats.forbidden} fail={stats.fail}")

        if fallback_failures:
            print(f"fallback_failures={len(fallback_failures)}")
            for failure in fallback_failures:
                print(failure)

        if failures:
            print(f"rbac_failures={len(failures)}")
            for failure in failures[:100]:
                print(failure)

        if failures or fallback_failures:
            raise SystemExit(1)

        print("status=PASS")
    finally:
        if args.keep_db:
            print(f"database_kept={db_name}")
        else:
            try:
                mongo_client.drop_database(db_name)
                print(f"database_dropped={db_name}")
            except Exception as exc:  # noqa: BLE001
                print(f"database_drop_warning={exc}")


if __name__ == "__main__":
    run()
