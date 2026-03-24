from datetime import datetime

from flask import Blueprint, jsonify, request
from pymongo.errors import DuplicateKeyError  # type: ignore[import-untyped]

from utils.db import get_db
from utils.decorators import admin_required, role_required
from utils.helpers import parse_object_id

staff_bp = Blueprint("staff", __name__)
db = get_db()
users_collection = db["users"]


def _serialize_staff_member(user):
    user["_id"] = str(user["_id"])
    user.pop("password_hash", None)
    return user


@staff_bp.route("", methods=["GET"])
@role_required("admin", "manager", "staff", "finance")
def get_staff():
    query = {"role": {"$ne": "client"}}
    staff = [_serialize_staff_member(user) for user in users_collection.find(query).sort("name", 1)]
    return jsonify(staff), 200


@staff_bp.route("", methods=["POST"])
@admin_required
def create_staff_member():
    data = request.get_json() or {}
    required_fields = ["name", "email", "role", "department", "status"]
    missing_fields = [field for field in required_fields if data.get(field) in [None, ""]]
    if missing_fields:
        return jsonify({"msg": f"Missing required fields: {', '.join(missing_fields)}"}), 400

    payload = {
        "name": str(data.get("name")).strip(),
        "email": str(data.get("email")).strip().lower(),
        "role": str(data.get("role")).strip().lower(),
        "department": str(data.get("department")).strip(),
        "status": str(data.get("status")).strip(),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    if users_collection.find_one({"email": payload["email"]}):
        return jsonify({"msg": "Email already exists"}), 409

    try:
        result = users_collection.insert_one(payload)
    except DuplicateKeyError:
        return jsonify({"msg": "Email already exists"}), 409
    created = users_collection.find_one({"_id": result.inserted_id})
    return jsonify(_serialize_staff_member(created)), 201


@staff_bp.route("/<id>", methods=["PUT"])
@admin_required
def update_staff_member(id):
    object_id = parse_object_id(id)
    if not object_id:
        return jsonify({"msg": "Invalid staff id"}), 400

    data = request.get_json() or {}
    update_fields = {}

    if "name" in data:
        update_fields["name"] = str(data.get("name")).strip()
    if "email" in data:
        update_fields["email"] = str(data.get("email")).strip().lower()
    if "role" in data:
        update_fields["role"] = str(data.get("role")).strip().lower()
    if "department" in data:
        update_fields["department"] = str(data.get("department")).strip()
    if "status" in data:
        update_fields["status"] = str(data.get("status")).strip()

    if not update_fields:
        return jsonify({"msg": "No updatable fields provided"}), 400

    if "email" in update_fields:
        existing = users_collection.find_one({"email": update_fields["email"], "_id": {"$ne": object_id}})
        if existing:
            return jsonify({"msg": "Email already exists"}), 409

    update_fields["updated_at"] = datetime.utcnow()

    try:
        result = users_collection.update_one({"_id": object_id}, {"$set": update_fields})
    except DuplicateKeyError:
        return jsonify({"msg": "Email already exists"}), 409
    if result.matched_count == 0:
        return jsonify({"msg": "Staff member not found"}), 404

    updated = users_collection.find_one({"_id": object_id})
    return jsonify(_serialize_staff_member(updated)), 200


@staff_bp.route("/<id>", methods=["DELETE"])
@admin_required
def delete_staff_member(id):
    object_id = parse_object_id(id)
    if not object_id:
        return jsonify({"msg": "Invalid staff id"}), 400

    result = users_collection.delete_one({"_id": object_id})
    if result.deleted_count == 0:
        return jsonify({"msg": "Staff member not found"}), 404

    return jsonify({"msg": "Staff member deleted"}), 200
