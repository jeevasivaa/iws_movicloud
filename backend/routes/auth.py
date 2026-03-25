from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token  # type: ignore[import-untyped]
from utils.db import get_db
from datetime import datetime

auth_bp = Blueprint("auth", __name__)
db = get_db()
users_collection = db["users"]

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role", "client") # Default role
    company_id = data.get("company_id")

    if not email or not password or not name:
        return jsonify({"msg": "Missing required fields"}), 400

    if users_collection.find_one({"email": email}):
        return jsonify({"msg": "Email already exists"}), 400

    password_hash = generate_password_hash(password)
    
    user_data = {
        "name": name,
        "email": email,
        "password_hash": password_hash,
        "role": role,
        "company_id": company_id,
        "created_at": datetime.utcnow()
    }
    
    result = users_collection.insert_one(user_data)
    
    return jsonify({
        "msg": "User registered successfully",
        "user_id": str(result.inserted_id)
    }), 201

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"msg": "Missing email or password"}), 400

    user = users_collection.find_one({"email": email})
    
    if not user or not check_password_hash(user["password_hash"], password):
        return jsonify({"msg": "Invalid email or password"}), 401

    # Create token with identity (email) and additional claims (role)
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
            "company_id": user.get("company_id")
        }
    }), 200
