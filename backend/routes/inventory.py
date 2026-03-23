from datetime import datetime

from flask import Blueprint, jsonify, request

from utils.db import get_db
from utils.decorators import admin_required
from utils.helpers import normalize_iso_date, parse_object_id, to_int

inventory_bp = Blueprint("inventory", __name__)
db = get_db()
inventory_collection = db["inventory"]
settings_collection = db["settings"]


def _serialize_item(item):
    item["_id"] = str(item["_id"])
    return item


def _validate_status(status):
    return status in {"Adequate", "Low", "Critical"}


def _read_low_stock_threshold(default: int = 100) -> int:
    row = settings_collection.find_one({"key": "low_stock_threshold"})
    if not row:
        return default

    value = row.get("value")
    try:
        parsed = int(round(float(value)))
    except (TypeError, ValueError):
        return default

    return max(0, parsed)


@inventory_bp.route("", methods=["GET"])
@admin_required
def get_inventory_items():
    rows = [_serialize_item(row) for row in inventory_collection.find().sort("item_name", 1)]
    return jsonify(rows), 200


@inventory_bp.route("/kpis", methods=["GET"])
@admin_required
def get_inventory_kpis():
    threshold = _read_low_stock_threshold()
    critical_threshold = max(0, int(round(threshold * 0.2)))

    total_items = inventory_collection.count_documents({})
    low_stock_items = inventory_collection.count_documents(
        {"current_stock": {"$gt": critical_threshold, "$lte": threshold}}
    )
    critical_items = inventory_collection.count_documents({"current_stock": {"$lte": critical_threshold}})

    return jsonify(
        {
            "total_items": total_items,
            "low_stock_items": low_stock_items,
            "critical_items": critical_items,
            "low_stock_threshold": threshold,
        }
    ), 200


@inventory_bp.route("", methods=["POST"])
@admin_required
def create_inventory_item():
    data = request.get_json() or {}
    required_fields = [
        "item_name",
        "type",
        "warehouse_location",
        "current_stock",
        "max_capacity",
        "status",
    ]
    missing_fields = [field for field in required_fields if data.get(field) in [None, ""]]
    if missing_fields:
        return jsonify({"msg": f"Missing required fields: {', '.join(missing_fields)}"}), 400

    status = data.get("status")
    if not _validate_status(status):
        return jsonify({"msg": "Invalid status. Use Adequate, Low, or Critical"}), 400

    payload = {
        "item_name": str(data.get("item_name")).strip(),
        "type": str(data.get("type")).strip(),
        "warehouse_location": str(data.get("warehouse_location")).strip(),
        "current_stock": to_int(data.get("current_stock")),
        "max_capacity": to_int(data.get("max_capacity")),
        "expiry_date": normalize_iso_date(data.get("expiry_date")) if data.get("expiry_date") else None,
        "status": status,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    result = inventory_collection.insert_one(payload)
    created = inventory_collection.find_one({"_id": result.inserted_id})
    return jsonify(_serialize_item(created)), 201


@inventory_bp.route("/<id>", methods=["PUT"])
@admin_required
def update_inventory_item(id):
    object_id = parse_object_id(id)
    if not object_id:
        return jsonify({"msg": "Invalid inventory id"}), 400

    data = request.get_json() or {}
    update_fields = {}

    if "item_name" in data:
        update_fields["item_name"] = str(data.get("item_name")).strip()
    if "type" in data:
        update_fields["type"] = str(data.get("type")).strip()
    if "warehouse_location" in data:
        update_fields["warehouse_location"] = str(data.get("warehouse_location")).strip()
    if "current_stock" in data:
        update_fields["current_stock"] = to_int(data.get("current_stock"))
    if "max_capacity" in data:
        update_fields["max_capacity"] = to_int(data.get("max_capacity"))
    if "expiry_date" in data:
        update_fields["expiry_date"] = normalize_iso_date(data.get("expiry_date"))
    if "status" in data:
        status = data.get("status")
        if not _validate_status(status):
            return jsonify({"msg": "Invalid status. Use Adequate, Low, or Critical"}), 400
        update_fields["status"] = status

    if not update_fields:
        return jsonify({"msg": "No updatable fields provided"}), 400

    update_fields["updated_at"] = datetime.utcnow()

    result = inventory_collection.update_one({"_id": object_id}, {"$set": update_fields})
    if result.matched_count == 0:
        return jsonify({"msg": "Inventory item not found"}), 404

    updated = inventory_collection.find_one({"_id": object_id})
    return jsonify(_serialize_item(updated)), 200


@inventory_bp.route("/<id>/stock", methods=["PATCH"])
@admin_required
def patch_inventory_stock(id):
    object_id = parse_object_id(id)
    if not object_id:
        return jsonify({"msg": "Invalid inventory id"}), 400

    data = request.get_json() or {}
    if "delta" not in data:
        return jsonify({"msg": "delta is required"}), 400

    delta = to_int(data.get("delta"), 0)
    if delta == 0:
        return jsonify({"msg": "delta must be a non-zero integer"}), 400

    existing = inventory_collection.find_one({"_id": object_id})
    if not existing:
        return jsonify({"msg": "Inventory item not found"}), 404

    current_stock = max(0, to_int(existing.get("current_stock"), 0) + delta)
    max_capacity = max(0, to_int(existing.get("max_capacity"), 0))

    if max_capacity <= 0:
        status = "Critical" if current_stock == 0 else "Adequate"
    else:
        ratio = current_stock / max_capacity
        if ratio <= 0.2:
            status = "Critical"
        elif ratio <= 0.5:
            status = "Low"
        else:
            status = "Adequate"

    inventory_collection.update_one(
        {"_id": object_id},
        {
            "$set": {
                "current_stock": current_stock,
                "status": status,
                "updated_at": datetime.utcnow(),
            }
        },
    )

    updated = inventory_collection.find_one({"_id": object_id})
    return jsonify(_serialize_item(updated)), 200


@inventory_bp.route("/<id>", methods=["DELETE"])
@admin_required
def delete_inventory_item(id):
    object_id = parse_object_id(id)
    if not object_id:
        return jsonify({"msg": "Invalid inventory id"}), 400

    result = inventory_collection.delete_one({"_id": object_id})
    if result.deleted_count == 0:
        return jsonify({"msg": "Inventory item not found"}), 404

    return jsonify({"msg": "Inventory item deleted"}), 200
