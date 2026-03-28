from datetime import datetime, timezone

from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token  # type: ignore[import-untyped]
from werkzeug.security import check_password_hash, generate_password_hash

from utils.db import get_db

auth_bp = Blueprint("auth", __name__)
db = get_db()
users_collection = db["users"]
ALLOWED_ROLES = {"admin", "manager", "staff", "finance", "client"}


def _normalize_email(value):
    return str(value or "").strip().lower()


def _normalize_role(value):
    return str(value or "client").strip().lower()

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        data = {}

    name = str(data.get("name") or "").strip()
    email = _normalize_email(data.get("email"))
    password = str(data.get("password") or "")
    role = _normalize_role(data.get("role"))
    company_id = data.get("company_id")

    if not email or not password or not name:
        return jsonify({"msg": "Missing required fields"}), 400

    if role not in ALLOWED_ROLES:
        return jsonify({"msg": "Invalid role"}), 400

    if users_collection.find_one({"email": email}):
        return jsonify({"msg": "Email already exists"}), 400

    password_hash = generate_password_hash(password)

    user_data = {
        "name": name,
        "email": email,
        "password_hash": password_hash,
        "role": role,
        "company_id": company_id,
        "created_at": datetime.now(timezone.utc),
    }

    result = users_collection.insert_one(user_data)

    return jsonify({
        "msg": "User registered successfully",
        "user_id": str(result.inserted_id),
    }), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        data = {}

    email = _normalize_email(data.get("email"))
    password = str(data.get("password") or "")

    if not email or not password:
        return jsonify({"msg": "Missing email or password"}), 400

    user = users_collection.find_one({"email": email})

    if not user:
        return jsonify({"msg": "Invalid email or password"}), 401

    password_hash = user.get("password_hash")
    if not isinstance(password_hash, str) or not password_hash:
        return jsonify({"msg": "Invalid email or password"}), 401

    try:
        is_valid_password = check_password_hash(password_hash, password)
    except ValueError:
        is_valid_password = False

    if not is_valid_password:
        return jsonify({"msg": "Invalid email or password"}), 401

    access_token = create_access_token(
        identity=user["email"],
        additional_claims={"role": user["role"], "user_id": str(user["_id"])}
    )

    return jsonify({
        "access_token": access_token,
        "user": {
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "role": user["role"],
            "company_id": user.get("company_id"),
        },
    }), 200
