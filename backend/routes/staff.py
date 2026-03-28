from datetime import datetime, timezone

from flask import Blueprint, jsonify, request
from pymongo.errors import DuplicateKeyError  # type: ignore[import-untyped]

from utils.db import get_db
from utils.decorators import admin_required, role_required
from utils.helpers import parse_object_id

staff_bp = Blueprint("staff", __name__)
db = get_db()
users_collection = db["users"]
staff_requests_collection = db["staff_requests"]

STAFF_REQUIRED_FIELDS = ["name", "email", "role", "department", "status"]
STAFF_REQUEST_STATUSES = {"pending", "approved", "rejected"}
ALLOWED_STAFF_ROLES = {"admin", "manager", "staff", "finance", "client"}
ALLOWED_STAFF_STATUSES = {"Active", "Inactive", "On Leave"}
MAX_STAFF_NAME_LENGTH = 120
MAX_STAFF_EMAIL_LENGTH = 254
MAX_STAFF_DEPARTMENT_LENGTH = 120


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

    name = str(data.get("name") or "").strip()
    if len(name) > MAX_STAFF_NAME_LENGTH:
        return None, "name must be at most 120 characters"

    email = str(data.get("email") or "").strip().lower()
    if len(email) > MAX_STAFF_EMAIL_LENGTH:
        return None, "email must be at most 254 characters"

    role = str(data.get("role") or "").strip().lower()
    if role not in ALLOWED_STAFF_ROLES:
        return None, "Invalid role. Use admin, manager, staff, finance, or client"

    department = str(data.get("department") or "").strip()
    if len(department) > MAX_STAFF_DEPARTMENT_LENGTH:
        return None, "department must be at most 120 characters"

    status_raw = str(data.get("status") or "").strip()
    status_map = {choice.lower(): choice for choice in ALLOWED_STAFF_STATUSES}
    status = status_map.get(status_raw.lower())
    if not status:
        return None, "Invalid status. Use Active, Inactive, or On Leave"

    payload = {
        "name": name,
        "email": email,
        "role": role,
        "department": department,
        "status": status,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }
    return payload, None


@staff_bp.route("", methods=["GET"])
@role_required("admin", "manager", "staff")
def get_staff():
    query = {"role": {"$ne": "client"}}
    staff = [_serialize_staff_member(user) for user in users_collection.find(query).sort("name", 1)]
    return jsonify(staff), 200


@staff_bp.route("", methods=["POST"])
@role_required("admin", "manager")
def create_staff_member():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"msg": "Invalid JSON payload"}), 400
    payload, validation_error = _build_staff_payload(data)
    if validation_error or payload is None:
        return jsonify({"msg": validation_error}), 400

    claims = get_jwt()
    user_role = claims.get("role")

    if user_role == "manager" and payload["role"] == "admin":
        return jsonify({"msg": "Managers cannot request admin accounts"}), 403

    if users_collection.find_one({"email": payload["email"]}):
        return jsonify({"msg": "Email already exists"}), 409

    if user_role == "admin":
        try:
            result = users_collection.insert_one(payload)
        except DuplicateKeyError:
            return jsonify({"msg": "Email already exists"}), 409
        created = users_collection.find_one({"_id": result.inserted_id})
        return jsonify(_serialize_staff_member(created)), 201

    pending_request = staff_requests_collection.find_one(
        {
            "email": payload["email"],
            "approval_status": "pending",
        }
    )
    if pending_request:
        return jsonify({"msg": "A pending approval request already exists for this email"}), 409

    now = datetime.now(timezone.utc)
    request_payload = {
        **payload,
        "approval_status": "pending",
        "requested_by": {
            "user_id": claims.get("user_id"),
            "email": claims.get("sub"),
            "role": user_role,
        },
        "requested_at": now,
        "created_at": now,
        "updated_at": now,
    }

    result = staff_requests_collection.insert_one(request_payload)
    created_request = staff_requests_collection.find_one({"_id": result.inserted_id})
    return (
        jsonify(
            {
                "msg": "Request submitted to admin for approval",
                "request": _serialize_staff_request(created_request),
            }
        ),
        202,
    )


@staff_bp.route("/requests", methods=["GET"])
@role_required("admin", "manager")
def get_staff_requests():
    claims = get_jwt()
    user_role = claims.get("role")

    status = str(request.args.get("status") or "").strip().lower()
    query = {}
    if status:
        if status not in STAFF_REQUEST_STATUSES:
            return jsonify({"msg": "Invalid status. Use pending, approved, or rejected"}), 400
        query["approval_status"] = status

    if user_role == "manager":
        requester_id = claims.get("user_id")
        requester_email = claims.get("sub")
        if requester_id:
            query["requested_by.user_id"] = str(requester_id)
        elif requester_email:
            query["requested_by.email"] = str(requester_email).strip().lower()
        else:
            return jsonify([]), 200

    rows = [_serialize_staff_request(row) for row in staff_requests_collection.find(query).sort("requested_at", -1)]
    return jsonify(rows), 200


@staff_bp.route("/requests/<id>/approve", methods=["PATCH"])
@admin_required
def approve_staff_request(id):
    object_id = parse_object_id(id)
    if not object_id:
        return jsonify({"msg": "Invalid request id"}), 400

    staff_request = staff_requests_collection.find_one({"_id": object_id})
    if not staff_request:
        return jsonify({"msg": "Staff request not found"}), 404

    if staff_request.get("approval_status") != "pending":
        return jsonify({"msg": "Only pending requests can be approved"}), 409

    now = datetime.now(timezone.utc)
    payload = {
        "name": str(staff_request.get("name") or "").strip(),
        "email": str(staff_request.get("email") or "").strip().lower(),
        "role": str(staff_request.get("role") or "").strip().lower(),
        "department": str(staff_request.get("department") or "").strip(),
        "status": str(staff_request.get("status") or "").strip(),
        "created_at": now,
        "updated_at": now,
    }

    missing_fields = [field for field in STAFF_REQUIRED_FIELDS if payload.get(field) in [None, ""]]
    if missing_fields:
        return jsonify({"msg": f"Request cannot be approved. Missing fields: {', '.join(missing_fields)}"}), 400

    if users_collection.find_one({"email": payload["email"]}):
        return jsonify({"msg": "Email already exists"}), 409

    try:
        result = users_collection.insert_one(payload)
    except DuplicateKeyError:
        return jsonify({"msg": "Email already exists"}), 409

    claims = get_jwt()
    staff_requests_collection.update_one(
        {"_id": object_id},
        {
            "$set": {
                "approval_status": "approved",
                "approved_at": now,
                "approved_by": {
                    "user_id": claims.get("user_id"),
                    "email": claims.get("sub"),
                },
                "approved_staff_id": created_result.inserted_id,
                "updated_at": now,
            }
        },
    )

    created_staff = users_collection.find_one({"_id": created_result.inserted_id})
    updated_request = staff_requests_collection.find_one({"_id": object_id})
    return (
        jsonify(
            {
                "msg": "Staff request approved and employee added",
                "staff": _serialize_staff_member(created_staff),
                "request": _serialize_staff_request(updated_request),
            }
        ),
        200,
    )


@staff_bp.route("/requests/<id>/reject", methods=["PATCH"])
@admin_required
def reject_staff_request(id):
    object_id = parse_object_id(id)
    if not object_id:
        return jsonify({"msg": "Invalid request id"}), 400

    staff_request = staff_requests_collection.find_one({"_id": object_id})
    if not staff_request:
        return jsonify({"msg": "Staff request not found"}), 404

    if staff_request.get("approval_status") != "pending":
        return jsonify({"msg": "Only pending requests can be rejected"}), 409

    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        data = {}
    reason = str(data.get("reason") or "").strip()

    claims = get_jwt()
    update_fields = {
        "approval_status": "rejected",
        "rejected_at": datetime.now(timezone.utc),
        "rejected_by": {
            "user_id": claims.get("user_id"),
            "email": claims.get("sub"),
        },
        "updated_at": datetime.now(timezone.utc),
    }
    if reason:
        update_fields["rejection_reason"] = reason

    staff_requests_collection.update_one(
        {"_id": object_id},
        {
            "$set": update_fields,
        },
    )

    updated_request = staff_requests_collection.find_one({"_id": object_id})
    return jsonify({"msg": "Staff request rejected", "request": _serialize_staff_request(updated_request)}), 200


@staff_bp.route("/<id>", methods=["PUT"])
@admin_required
def update_staff_member(id):
    object_id = parse_object_id(id)
    if not object_id:
        return jsonify({"msg": "Invalid staff id"}), 400

    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"msg": "Invalid JSON payload"}), 400
    update_fields = {}

    if "name" in data:
        name = str(data.get("name") or "").strip()
        if not name:
            return jsonify({"msg": "name cannot be empty"}), 400
        if len(name) > MAX_STAFF_NAME_LENGTH:
            return jsonify({"msg": "name must be at most 120 characters"}), 400
        update_fields["name"] = name
    if "email" in data:
        email = str(data.get("email") or "").strip().lower()
        if not email:
            return jsonify({"msg": "email cannot be empty"}), 400
        if len(email) > MAX_STAFF_EMAIL_LENGTH:
            return jsonify({"msg": "email must be at most 254 characters"}), 400
        update_fields["email"] = email
    if "role" in data:
        role = str(data.get("role") or "").strip().lower()
        if role not in ALLOWED_STAFF_ROLES:
            return jsonify({"msg": "Invalid role. Use admin, manager, staff, finance, or client"}), 400
        update_fields["role"] = role
    if "department" in data:
        department = str(data.get("department") or "").strip()
        if not department:
            return jsonify({"msg": "department cannot be empty"}), 400
        if len(department) > MAX_STAFF_DEPARTMENT_LENGTH:
            return jsonify({"msg": "department must be at most 120 characters"}), 400
        update_fields["department"] = department
    if "status" in data:
        status_raw = str(data.get("status") or "").strip()
        status_map = {choice.lower(): choice for choice in ALLOWED_STAFF_STATUSES}
        status = status_map.get(status_raw.lower())
        if not status:
            return jsonify({"msg": "Invalid status. Use Active, Inactive, or On Leave"}), 400
        update_fields["status"] = status

    if not update_fields:
        return jsonify({"msg": "No updatable fields provided"}), 400

    if "email" in update_fields:
        existing = users_collection.find_one({"email": update_fields["email"], "_id": {"$ne": object_id}})
        if existing:
            return jsonify({"msg": "Email already exists"}), 409

    update_fields["updated_at"] = datetime.now(timezone.utc)

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
