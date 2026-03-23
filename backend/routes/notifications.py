from datetime import datetime

from flask import Blueprint, jsonify, request

from utils.db import get_db
from utils.decorators import admin_required
from utils.helpers import parse_object_id

notifications_bp = Blueprint("notifications", __name__)
db = get_db()
notifications_collection = db["notifications"]


def _serialize_notification(notification):
    notification["_id"] = str(notification["_id"])
    return notification


def _validate_type(value):
    return value in {"alert", "info", "success", "warning"}


@notifications_bp.route("", methods=["GET"])
@admin_required
def get_notifications():
    rows = [_serialize_notification(row) for row in notifications_collection.find().sort("timestamp", -1)]
    return jsonify(rows), 200


@notifications_bp.route("", methods=["POST"])
@admin_required
def create_notification():
    data = request.get_json() or {}
    required_fields = ["title", "message", "type"]
    missing_fields = [field for field in required_fields if data.get(field) in [None, ""]]
    if missing_fields:
        return jsonify({"msg": f"Missing required fields: {', '.join(missing_fields)}"}), 400

    notification_type = str(data.get("type")).strip().lower()
    if not _validate_type(notification_type):
        return jsonify({"msg": "Invalid type. Use alert, info, success, or warning"}), 400

    payload = {
        "title": str(data.get("title")).strip(),
        "message": str(data.get("message")).strip(),
        "type": notification_type,
        "timestamp": datetime.utcnow(),
        "is_read": bool(data.get("is_read", False)),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    result = notifications_collection.insert_one(payload)
    created = notifications_collection.find_one({"_id": result.inserted_id})
    return jsonify(_serialize_notification(created)), 201


@notifications_bp.route("/mark-all-read", methods=["PUT"])
@admin_required
def mark_all_read():
    result = notifications_collection.update_many(
        {"is_read": False},
        {"$set": {"is_read": True, "updated_at": datetime.utcnow()}},
    )
    return jsonify({"msg": "All notifications marked as read", "updated_count": result.modified_count}), 200


@notifications_bp.route("/<id>", methods=["PUT"])
@admin_required
def update_notification(id):
    object_id = parse_object_id(id)
    if not object_id:
        return jsonify({"msg": "Invalid notification id"}), 400

    data = request.get_json() or {}
    update_fields = {}

    if "title" in data:
        update_fields["title"] = str(data.get("title")).strip()
    if "message" in data:
        update_fields["message"] = str(data.get("message")).strip()
    if "type" in data:
        notification_type = str(data.get("type")).strip().lower()
        if not _validate_type(notification_type):
            return jsonify({"msg": "Invalid type. Use alert, info, success, or warning"}), 400
        update_fields["type"] = notification_type
    if "is_read" in data:
        update_fields["is_read"] = bool(data.get("is_read"))

    if not update_fields:
        return jsonify({"msg": "No updatable fields provided"}), 400

    update_fields["updated_at"] = datetime.utcnow()

    result = notifications_collection.update_one({"_id": object_id}, {"$set": update_fields})
    if result.matched_count == 0:
        return jsonify({"msg": "Notification not found"}), 404

    updated = notifications_collection.find_one({"_id": object_id})
    return jsonify(_serialize_notification(updated)), 200


@notifications_bp.route("/<id>", methods=["DELETE"])
@admin_required
def delete_notification(id):
    object_id = parse_object_id(id)
    if not object_id:
        return jsonify({"msg": "Invalid notification id"}), 400

    result = notifications_collection.delete_one({"_id": object_id})
    if result.deleted_count == 0:
        return jsonify({"msg": "Notification not found"}), 404

    return jsonify({"msg": "Notification deleted"}), 200
