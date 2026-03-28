from datetime import datetime, timezone

from flask import Blueprint, jsonify, request

from utils.db import get_db
from utils.decorators import role_required

settings_bp = Blueprint("settings", __name__)
db = get_db()
settings_collection = db["settings"]


def _serialize_setting(setting):
    setting["_id"] = str(setting["_id"])
    return setting


@settings_bp.route("", methods=["GET"])
@role_required("admin", "manager")
def get_settings():
    rows = [_serialize_setting(row) for row in settings_collection.find().sort("key", 1)]
    return jsonify(rows), 200


@settings_bp.route("", methods=["PUT"])
@role_required("admin", "manager")
def upsert_settings():
    payload = request.get_json(silent=True)
    if payload is None:
        return jsonify({"msg": "Invalid JSON payload"}), 400
    if not isinstance(payload, (dict, list)):
        return jsonify({"msg": "Invalid JSON payload"}), 400
    now = datetime.now(timezone.utc)

    if isinstance(payload, list):
        updated = []
        for item in payload:
            if not isinstance(item, dict):
                continue
            key = item.get("key")
            if not key:
                continue

            value = item.get("value")
            settings_collection.update_one(
                {"key": str(key).strip()},
                {
                    "$set": {
                        "value": value,
                        "updated_at": now,
                    },
                    "$setOnInsert": {
                        "created_at": now,
                    },
                },
                upsert=True,
            )
            row = settings_collection.find_one({"key": str(key).strip()})
            updated.append(_serialize_setting(row))

        return jsonify(updated), 200

    key = payload.get("key")
    value = payload.get("value")

    if not key:
        return jsonify({"msg": "key is required"}), 400

    settings_collection.update_one(
        {"key": str(key).strip()},
        {
            "$set": {
                "value": value,
                "updated_at": now,
            },
            "$setOnInsert": {
                "created_at": now,
            },
        },
        upsert=True,
    )
    updated = settings_collection.find_one({"key": str(key).strip()})
    return jsonify(_serialize_setting(updated)), 200
