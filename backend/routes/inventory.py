from datetime import datetime, timezone

from flask import Blueprint, jsonify, request

from utils.db import get_db
from utils.decorators import role_required
from utils.helpers import normalize_choice, normalize_iso_date, parse_int_value, parse_object_id

MAX_ITEM_NAME_LENGTH = 120
MAX_TYPE_LENGTH = 60
MAX_WAREHOUSE_LOCATION_LENGTH = 60

inventory_bp = Blueprint("inventory", __name__)
db = get_db()
inventory_collection = db["inventory"]
settings_collection = db["settings"]
movements_collection = db["inventory_movements"]


def _serialize_item(item):
    item["_id"] = str(item["_id"])
    return item


def _normalize_status(value):
    return normalize_choice(value, ("Adequate", "Low", "Critical"))


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


def _derive_status(current_stock: int, max_capacity: int) -> str:
    capacity = max(0, to_int(max_capacity, 0))
    stock = max(0, to_int(current_stock, 0))

    if capacity <= 0:
        return "Critical" if stock == 0 else "Adequate"

    ratio = stock / capacity
    if ratio <= 0.2:
        return "Critical"
    if ratio <= 0.5:
        return "Low"
    return "Adequate"


def _create_stock_movement(item, change: int, resulting_stock: int, reason: str) -> None:
    movements_collection.insert_one(
        {
            "inventory_id": item.get("_id"),
            "item_name": item.get("item_name"),
            "warehouse_location": item.get("warehouse_location"),
            "change": to_int(change, 0),
            "resulting_stock": to_int(resulting_stock, 0),
            "reason": reason,
            "timestamp": datetime.utcnow(),
            "created_at": datetime.utcnow(),
        }
    )


@inventory_bp.route("", methods=["GET"])
@role_required("admin", "manager", "staff")
def get_inventory_items():
    rows = [_serialize_item(row) for row in inventory_collection.find().sort("item_name", 1)]
    return jsonify(rows), 200


@inventory_bp.route("/kpis", methods=["GET"])
@role_required("admin", "manager", "staff")
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


@inventory_bp.route("/movements", methods=["GET"])
@role_required("admin", "manager", "staff")
def get_inventory_movements():
    limit = to_int(request.args.get("limit"), 100)
    limit = max(1, min(500, limit))

    rows = [
        _serialize_movement(row)
        for row in movements_collection.find().sort("timestamp", -1).limit(limit)
    ]

    return jsonify(rows), 200


@inventory_bp.route("", methods=["POST"])
@role_required("admin", "manager", "staff")
def create_inventory_item():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"msg": "Invalid JSON payload"}), 400
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
    normalized_status = _normalize_status(status)
    if not normalized_status:
        return jsonify({"msg": "Invalid status. Use Adequate, Low, or Critical"}), 400

    expiry_date = normalize_iso_date(data.get("expiry_date"))
    if not expiry_date:
        return jsonify({"msg": "Invalid expiry_date. Use YYYY-MM-DD"}), 400

    current_stock = parse_int_value(data.get("current_stock"))
    if current_stock is None:
        return jsonify({"msg": "current_stock must be a valid number"}), 400
    if current_stock < 0:
        return jsonify({"msg": "current_stock must be greater than or equal to 0"}), 400

    max_capacity = parse_int_value(data.get("max_capacity"))
    if max_capacity is None:
        return jsonify({"msg": "max_capacity must be a valid number"}), 400
    if max_capacity < 0:
        return jsonify({"msg": "max_capacity must be greater than or equal to 0"}), 400

    item_name = str(data.get("item_name") or "").strip()
    if len(item_name) > MAX_ITEM_NAME_LENGTH:
        return jsonify({"msg": "item_name must be at most 120 characters"}), 400

    item_type = str(data.get("type") or "").strip()
    if len(item_type) > MAX_TYPE_LENGTH:
        return jsonify({"msg": "type must be at most 60 characters"}), 400

    warehouse_location = str(data.get("warehouse_location") or "").strip()
    if len(warehouse_location) > MAX_WAREHOUSE_LOCATION_LENGTH:
        return jsonify({"msg": "warehouse_location must be at most 60 characters"}), 400

    payload = {
        "item_name": item_name,
        "type": item_type,
        "warehouse_location": warehouse_location,
        "current_stock": current_stock,
        "max_capacity": max_capacity,
        "expiry_date": expiry_date,
        "status": normalized_status,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }

    result = inventory_collection.insert_one(payload)
    created = inventory_collection.find_one({"_id": result.inserted_id})
    if created:
        _create_stock_movement(created, payload["current_stock"], payload["current_stock"], "entry_created")
    return jsonify(_serialize_item(created)), 201


@inventory_bp.route("/<id>", methods=["PUT"])
@role_required("admin", "manager", "staff")
def update_inventory_item(id):
    object_id = parse_object_id(id)
    if not object_id:
        return jsonify({"msg": "Invalid inventory id"}), 400

    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"msg": "Invalid JSON payload"}), 400
    update_fields = {}

    if "item_name" in data:
        item_name = str(data.get("item_name") or "").strip()
        if not item_name:
            return jsonify({"msg": "item_name cannot be empty"}), 400
        if len(item_name) > MAX_ITEM_NAME_LENGTH:
            return jsonify({"msg": "item_name must be at most 120 characters"}), 400
        update_fields["item_name"] = item_name
    if "type" in data:
        item_type = str(data.get("type") or "").strip()
        if not item_type:
            return jsonify({"msg": "type cannot be empty"}), 400
        if len(item_type) > MAX_TYPE_LENGTH:
            return jsonify({"msg": "type must be at most 60 characters"}), 400
        update_fields["type"] = item_type
    if "warehouse_location" in data:
        warehouse_location = str(data.get("warehouse_location") or "").strip()
        if not warehouse_location:
            return jsonify({"msg": "warehouse_location cannot be empty"}), 400
        if len(warehouse_location) > MAX_WAREHOUSE_LOCATION_LENGTH:
            return jsonify({"msg": "warehouse_location must be at most 60 characters"}), 400
        update_fields["warehouse_location"] = warehouse_location
    if "current_stock" in data:
        current_stock = parse_int_value(data.get("current_stock"))
        if current_stock is None:
            return jsonify({"msg": "current_stock must be a valid number"}), 400
        if current_stock < 0:
            return jsonify({"msg": "current_stock must be greater than or equal to 0"}), 400
        update_fields["current_stock"] = current_stock
    if "max_capacity" in data:
        max_capacity = parse_int_value(data.get("max_capacity"))
        if max_capacity is None:
            return jsonify({"msg": "max_capacity must be a valid number"}), 400
        if max_capacity < 0:
            return jsonify({"msg": "max_capacity must be greater than or equal to 0"}), 400
        update_fields["max_capacity"] = max_capacity
    if "expiry_date" in data:
        expiry_date = normalize_iso_date(data.get("expiry_date"))
        if not expiry_date:
            return jsonify({"msg": "Invalid expiry_date. Use YYYY-MM-DD"}), 400
        update_fields["expiry_date"] = expiry_date
    if "status" in data:
        normalized_status = _normalize_status(data.get("status"))
        if not normalized_status:
            return jsonify({"msg": "Invalid status. Use Adequate, Low, or Critical"}), 400
        update_fields["status"] = normalized_status

    if not update_fields:
        return jsonify({"msg": "No updatable fields provided"}), 400

    update_fields["updated_at"] = datetime.now(timezone.utc)

    result = inventory_collection.update_one({"_id": object_id}, {"$set": update_fields})
    if result.matched_count == 0:
        return jsonify({"msg": "Inventory item not found"}), 404

    updated = inventory_collection.find_one({"_id": object_id})
    if "current_stock" in update_fields and updated:
        previous_stock = to_int(existing.get("current_stock"), 0)
        latest_stock = to_int(updated.get("current_stock"), 0)
        change = latest_stock - previous_stock
        if change != 0:
            _create_stock_movement(updated, change, latest_stock, "stock_updated")

    return jsonify(_serialize_item(updated)), 200


@inventory_bp.route("/<id>/stock", methods=["PATCH"])
@role_required("admin", "manager", "staff")
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
    status = _derive_status(current_stock, max_capacity)

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
    if updated:
        _create_stock_movement(updated, delta, current_stock, "quick_adjustment")

    return jsonify(_serialize_item(updated)), 200


@inventory_bp.route("/deduct", methods=["PATCH"])
@role_required("admin", "manager", "staff")
def deduct_inventory_item():
    data = request.get_json() or {}
    inventory_id = data.get("inventory_id")
    quantity = to_int(data.get("quantity"), 0)

    if not inventory_id:
        return jsonify({"msg": "inventory_id is required"}), 400

    if quantity <= 0:
        return jsonify({"msg": "quantity must be a positive integer"}), 400

    object_id = parse_object_id(inventory_id)
    if not object_id:
        return jsonify({"msg": "Invalid inventory id"}), 400

    existing = inventory_collection.find_one({"_id": object_id})
    if not existing:
        return jsonify({"msg": "Inventory item not found"}), 404

    current_stock = max(0, to_int(existing.get("current_stock"), 0))
    next_stock = max(0, current_stock - quantity)
    delta = next_stock - current_stock
    status = _derive_status(next_stock, to_int(existing.get("max_capacity"), 0))

    inventory_collection.update_one(
        {"_id": object_id},
        {
            "$set": {
                "current_stock": next_stock,
                "status": status,
                "updated_at": datetime.utcnow(),
            }
        },
    )

    updated = inventory_collection.find_one({"_id": object_id})
    if updated and delta != 0:
        _create_stock_movement(updated, delta, next_stock, "deducted_for_floor_use")

    return jsonify(_serialize_item(updated)), 200


@inventory_bp.route("/<id>", methods=["DELETE"])
@role_required("admin", "manager", "staff")
def delete_inventory_item(id):
    object_id = parse_object_id(id)
    if not object_id:
        return jsonify({"msg": "Invalid inventory id"}), 400

    result = inventory_collection.delete_one({"_id": object_id})
    if result.deleted_count == 0:
        return jsonify({"msg": "Inventory item not found"}), 404

    return jsonify({"msg": "Inventory item deleted"}), 200
