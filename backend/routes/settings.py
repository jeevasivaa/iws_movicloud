from datetime import datetime

from flask import Blueprint, jsonify, request

from utils.db import get_db
from utils.decorators import admin_required

settings_bp = Blueprint("settings", __name__)
db = get_db()
settings_collection = db["settings"]


def _serialize_setting(setting):
    setting["_id"] = str(setting["_id"])
    return setting


@settings_bp.route("", methods=["GET"])
@admin_required
def get_settings():
    rows = [_serialize_setting(row) for row in settings_collection.find().sort("key", 1)]
    return jsonify(rows), 200


@settings_bp.route("", methods=["PUT"])
@admin_required
def upsert_settings():
    payload = request.get_json() or {}
    now = datetime.utcnow()

    if isinstance(payload, list):
        updated = []
        for item in payload:
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
