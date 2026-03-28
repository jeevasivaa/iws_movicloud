from datetime import datetime, timezone

from flask import Blueprint, jsonify, request

from utils.db import get_db
from utils.decorators import role_required
from utils.helpers import normalize_choice, parse_object_id

MAX_NOTIFICATION_TITLE_LENGTH = 160
MAX_NOTIFICATION_MESSAGE_LENGTH = 1000

notifications_bp = Blueprint("notifications", __name__)
db = get_db()
notifications_collection = db["notifications"]


def _serialize_notification(notification):
    notification["_id"] = str(notification["_id"])
    return notification


def _normalize_type(value):
    return normalize_choice(value, ("alert", "info", "success", "warning"))


@notifications_bp.route("", methods=["GET"])
@role_required("admin", "manager", "staff", "finance")
def get_notifications():
    rows = [_serialize_notification(row) for row in notifications_collection.find().sort("timestamp", -1)]
    return jsonify(rows), 200


@notifications_bp.route("", methods=["POST"])
@role_required("admin", "manager", "staff", "finance")
def create_notification():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"msg": "Invalid JSON payload"}), 400
    required_fields = ["title", "message", "type"]
    missing_fields = [field for field in required_fields if data.get(field) in [None, ""]]
    if missing_fields:
        return jsonify({"msg": f"Missing required fields: {', '.join(missing_fields)}"}), 400

    notification_type = _normalize_type(data.get("type"))
    if not notification_type:
        return jsonify({"msg": "Invalid type. Use alert, info, success, or warning"}), 400

    title = str(data.get("title") or "").strip()
    if len(title) > MAX_NOTIFICATION_TITLE_LENGTH:
        return jsonify({"msg": "title must be at most 160 characters"}), 400

    message = str(data.get("message") or "").strip()
    if len(message) > MAX_NOTIFICATION_MESSAGE_LENGTH:
        return jsonify({"msg": "message must be at most 1000 characters"}), 400

    payload = {
        "title": title,
        "message": message,
        "type": notification_type,
        "timestamp": datetime.now(timezone.utc),
        "is_read": bool(data.get("is_read", False)),
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }

    result = notifications_collection.insert_one(payload)
    created = notifications_collection.find_one({"_id": result.inserted_id})
    return jsonify(_serialize_notification(created)), 201


@notifications_bp.route("/mark-all-read", methods=["PUT"])
@role_required("admin", "manager", "staff", "finance")
def mark_all_read():
    result = notifications_collection.update_many(
        {"is_read": False},
        {"$set": {"is_read": True, "updated_at": datetime.now(timezone.utc)}},
    )
    return jsonify({"msg": "All notifications marked as read", "updated_count": result.modified_count}), 200


@notifications_bp.route("/<id>", methods=["PUT"])
@role_required("admin", "manager", "staff", "finance")
def update_notification(id):
    object_id = parse_object_id(id)
    if not object_id:
        return jsonify({"msg": "Invalid notification id"}), 400

    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"msg": "Invalid JSON payload"}), 400
    update_fields = {}

    if "title" in data:
        title = str(data.get("title") or "").strip()
        if not title:
            return jsonify({"msg": "title cannot be empty"}), 400
        if len(title) > MAX_NOTIFICATION_TITLE_LENGTH:
            return jsonify({"msg": "title must be at most 160 characters"}), 400
        update_fields["title"] = title
    if "message" in data:
        message = str(data.get("message") or "").strip()
        if not message:
            return jsonify({"msg": "message cannot be empty"}), 400
        if len(message) > MAX_NOTIFICATION_MESSAGE_LENGTH:
            return jsonify({"msg": "message must be at most 1000 characters"}), 400
        update_fields["message"] = message
    if "type" in data:
        notification_type = _normalize_type(data.get("type"))
        if not notification_type:
            return jsonify({"msg": "Invalid type. Use alert, info, success, or warning"}), 400
        update_fields["type"] = notification_type
    if "is_read" in data:
        update_fields["is_read"] = bool(data.get("is_read"))

    if not update_fields:
        return jsonify({"msg": "No updatable fields provided"}), 400

    update_fields["updated_at"] = datetime.now(timezone.utc)

    result = notifications_collection.update_one({"_id": object_id}, {"$set": update_fields})
    if result.matched_count == 0:
        return jsonify({"msg": "Notification not found"}), 404

    updated = notifications_collection.find_one({"_id": object_id})
    return jsonify(_serialize_notification(updated)), 200


@notifications_bp.route("/<id>", methods=["DELETE"])
@role_required("admin", "manager", "staff", "finance")
def delete_notification(id):
    object_id = parse_object_id(id)
    if not object_id:
        return jsonify({"msg": "Invalid notification id"}), 400

    result = notifications_collection.delete_one({"_id": object_id})
    if result.deleted_count == 0:
        return jsonify({"msg": "Notification not found"}), 404

    return jsonify({"msg": "Notification deleted"}), 200
