import os

from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token  # type: ignore[import-untyped]
from pymongo.errors import PyMongoError, ServerSelectionTimeoutError  # type: ignore[import-untyped]
from werkzeug.security import generate_password_hash, check_password_hash

from utils.db import get_db, is_database_available
from datetime import datetime

auth_bp = Blueprint("auth", __name__)
db = get_db()
users_collection = db["users"]
ENABLE_DEMO_AUTH_FALLBACK = os.getenv("ENABLE_DEMO_AUTH_FALLBACK", "true").strip().lower() == "true"

DEMO_USERS = {
    "admin@vsafoods.com": {
        "id": "demo-admin-001",
        "name": "Raj Kumar",
        "email": "admin@vsafoods.com",
        "role": "admin",
        "company_id": None,
        "password": "password123",
    },
    "vikram@vsafoods.com": {
        "id": "demo-manager-001",
        "name": "Vikram Singh",
        "email": "vikram@vsafoods.com",
        "role": "manager",
        "company_id": None,
        "password": "password123",
    },
    "anita@vsafoods.com": {
        "id": "demo-staff-001",
        "name": "Anita Desai",
        "email": "anita@vsafoods.com",
        "role": "staff",
        "company_id": None,
        "password": "password123",
    },
    "ravi.finance@vsafoods.com": {
        "id": "demo-finance-001",
        "name": "Ravi Menon",
        "email": "ravi.finance@vsafoods.com",
        "role": "finance",
        "company_id": None,
        "password": "password123",
    },
    "nita@organichub.in": {
        "id": "demo-client-001",
        "name": "Nita Shah",
        "email": "nita@organichub.in",
        "role": "client",
        "company_id": None,
        "password": "password123",
    },
}


def _build_login_response(*, user_id, name, email, role, company_id=None):
    access_token = create_access_token(
        identity=email,
        additional_claims={"role": role, "user_id": user_id},
    )

    return jsonify(
        {
            "access_token": access_token,
            "user": {
                "id": user_id,
                "name": name,
                "email": email,
                "role": role,
                "company_id": company_id,
            },
        }
    ), 200


def _try_demo_login(email, password):
    if not ENABLE_DEMO_AUTH_FALLBACK:
        return None

    demo_user = DEMO_USERS.get(email.strip().lower())
    if not demo_user:
        return None

    if demo_user["password"] != password:
        return None

    return _build_login_response(
        user_id=str(demo_user["id"]),
        name=demo_user["name"],
        email=demo_user["email"],
        role=demo_user["role"],
        company_id=demo_user.get("company_id"),
    )

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    name = data.get("name")
    email = (data.get("email") or "").strip().lower()
    password = data.get("password")
    role = data.get("role", "client") # Default role
    company_id = data.get("company_id")

    if not email or not password or not name:
        return jsonify({"msg": "Missing required fields"}), 400

    if not is_database_available():
        return jsonify({"msg": "Database unavailable. Please try again later."}), 503

    try:
        if users_collection.find_one({"email": email}):
            return jsonify({"msg": "Email already exists"}), 400
    except ServerSelectionTimeoutError:
        return jsonify({"msg": "Database unavailable. Please try again later."}), 503
    except PyMongoError:
        return jsonify({"msg": "Database request failed. Please try again later."}), 503

    password_hash = generate_password_hash(password)
    
    user_data = {
        "name": name,
        "email": email,
        "password_hash": password_hash,
        "role": role,
        "company_id": company_id,
        "created_at": datetime.utcnow()
    }
    
    try:
        result = users_collection.insert_one(user_data)
    except ServerSelectionTimeoutError:
        return jsonify({"msg": "Database unavailable. Please try again later."}), 503
    except PyMongoError:
        return jsonify({"msg": "Database request failed. Please try again later."}), 503
    
    return jsonify({
        "msg": "User registered successfully",
        "user_id": str(result.inserted_id)
    }), 201

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password")

    if not email or not password:
        return jsonify({"msg": "Missing email or password"}), 400

    try:
        user = users_collection.find_one({"email": email})
    except ServerSelectionTimeoutError:
        demo_response = _try_demo_login(email, password)
        if demo_response is not None:
            return demo_response
        return jsonify({"msg": "Authentication service unavailable"}), 503
    except PyMongoError:
        demo_response = _try_demo_login(email, password)
        if demo_response is not None:
            return demo_response
        return jsonify({"msg": "Authentication service unavailable"}), 503

    if not user:
        demo_response = _try_demo_login(email, password)
        if demo_response is not None:
            return demo_response
        return jsonify({"msg": "Invalid email or password"}), 401

    if not check_password_hash(user["password_hash"], password):
        return jsonify({"msg": "Invalid email or password"}), 401

    return _build_login_response(
        user_id=str(user["_id"]),
        name=user["name"],
        email=user["email"],
        role=user["role"],
        company_id=user.get("company_id"),
    )
