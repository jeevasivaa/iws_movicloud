from datetime import datetime, timezone

from flask import Blueprint, jsonify, request
from pymongo.errors import DuplicateKeyError  # type: ignore[import-untyped]

from utils.db import get_db
from utils.decorators import role_required
from utils.helpers import (
    maybe_object_id,
    normalize_choice,
    normalize_iso_date,
    parse_float_value,
    parse_int_value,
    parse_object_id,
)

MAX_ORDER_ID_LENGTH = 40

orders_bp = Blueprint("orders", __name__)
db = get_db()
orders_collection = db["orders"]


def _serialize_order(order):
    order["_id"] = str(order["_id"])
    if order.get("client_id") is not None:
        order["client_id"] = str(order["client_id"])
    return order


def _normalize_status(value):
    return normalize_choice(value, ("Pending", "Processing", "Shipped", "Delivered"))


def _normalize_packing_items(items):
    if not isinstance(items, list):
        return []

    normalized_items = []
    for index, item in enumerate(items):
        if isinstance(item, dict):
            name = str(item.get("name") or item.get("label") or "").strip()
            quantity = to_int(item.get("quantity"), 1)
        else:
            name = str(item).strip()
            quantity = 1

        if not name:
            continue

        normalized_items.append(
            {
                "id": str(item.get("id") if isinstance(item, dict) and item.get("id") else index + 1),
                "name": name,
                "quantity": max(1, quantity),
            }
        )

    return normalized_items


@orders_bp.route("", methods=["GET"])
@role_required("admin", "manager", "client")
def get_orders():
    query = {}
    status = request.args.get("status")
    if status:
        query["status"] = str(status).strip()

    rows = [_serialize_order(row) for row in orders_collection.find(query).sort("date", -1)]
    return jsonify(rows), 200


@orders_bp.route("", methods=["POST"])
@role_required("admin", "manager", "client")
def create_order():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"msg": "Invalid JSON payload"}), 400
    required_fields = ["order_id", "client_id", "date", "total_items", "total_amount", "status"]
    missing_fields = [field for field in required_fields if data.get(field) in [None, ""]]
    if missing_fields:
        return jsonify({"msg": f"Missing required fields: {', '.join(missing_fields)}"}), 400

    status = data.get("status")
    normalized_status = _normalize_status(status)
    if not normalized_status:
        return jsonify({"msg": "Invalid status. Use Pending, Processing, Shipped, or Delivered"}), 400

    order_date = normalize_iso_date(data.get("date"))
    if not order_date:
        return jsonify({"msg": "Invalid date. Use YYYY-MM-DD"}), 400

    total_items = parse_int_value(data.get("total_items"))
    if total_items is None:
        return jsonify({"msg": "total_items must be a valid number"}), 400
    if total_items < 0:
        return jsonify({"msg": "total_items must be greater than or equal to 0"}), 400

    total_amount = parse_float_value(data.get("total_amount"))
    if total_amount is None:
        return jsonify({"msg": "total_amount must be a valid number"}), 400
    if total_amount < 0:
        return jsonify({"msg": "total_amount must be greater than or equal to 0"}), 400

    order_identifier = str(data.get("order_id") or "").strip().upper()
    if len(order_identifier) > MAX_ORDER_ID_LENGTH:
        return jsonify({"msg": "order_id must be at most 40 characters"}), 400

    payload = {
        "order_id": order_identifier,
        "client_id": maybe_object_id(data.get("client_id")),
        "date": order_date,
        "total_items": total_items,
        "total_amount": total_amount,
        "status": normalized_status,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }

    if "packing_items" in data:
        payload["packing_items"] = _normalize_packing_items(data.get("packing_items"))

    try:
        result = orders_collection.insert_one(payload)
    except DuplicateKeyError:
        return jsonify({"msg": "Order id already exists"}), 409

    created = orders_collection.find_one({"_id": result.inserted_id})
    return jsonify(_serialize_order(created)), 201


@orders_bp.route("/<id>", methods=["PUT"])
@role_required("admin", "manager")
def update_order(id):
    object_id = parse_object_id(id)
    if not object_id:
        return jsonify({"msg": "Invalid order id"}), 400

    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"msg": "Invalid JSON payload"}), 400
    update_fields = {}

    if "order_id" in data:
        order_identifier = str(data.get("order_id") or "").strip().upper()
        if not order_identifier:
            return jsonify({"msg": "order_id cannot be empty"}), 400
        if len(order_identifier) > MAX_ORDER_ID_LENGTH:
            return jsonify({"msg": "order_id must be at most 40 characters"}), 400
        update_fields["order_id"] = order_identifier
    if "client_id" in data:
        update_fields["client_id"] = maybe_object_id(data.get("client_id"))
    if "date" in data:
        order_date = normalize_iso_date(data.get("date"))
        if not order_date:
            return jsonify({"msg": "Invalid date. Use YYYY-MM-DD"}), 400
        update_fields["date"] = order_date
    if "total_items" in data:
        total_items = parse_int_value(data.get("total_items"))
        if total_items is None:
            return jsonify({"msg": "total_items must be a valid number"}), 400
        if total_items < 0:
            return jsonify({"msg": "total_items must be greater than or equal to 0"}), 400
        update_fields["total_items"] = total_items
    if "total_amount" in data:
        total_amount = parse_float_value(data.get("total_amount"))
        if total_amount is None:
            return jsonify({"msg": "total_amount must be a valid number"}), 400
        if total_amount < 0:
            return jsonify({"msg": "total_amount must be greater than or equal to 0"}), 400
        update_fields["total_amount"] = total_amount
    if "status" in data:
        normalized_status = _normalize_status(data.get("status"))
        if not normalized_status:
            return jsonify({"msg": "Invalid status. Use Pending, Processing, Shipped, or Delivered"}), 400
        update_fields["status"] = normalized_status

    if not update_fields:
        return jsonify({"msg": "No updatable fields provided"}), 400

    update_fields["updated_at"] = datetime.now(timezone.utc)

    try:
        result = orders_collection.update_one({"_id": object_id}, {"$set": update_fields})
    except DuplicateKeyError:
        return jsonify({"msg": "Order id already exists"}), 409

    if result.matched_count == 0:
        return jsonify({"msg": "Order not found"}), 404

    updated = orders_collection.find_one({"_id": object_id})
    return jsonify(_serialize_order(updated)), 200


@orders_bp.route("/<id>/ship", methods=["PATCH"])
@role_required("admin", "manager", "staff")
def mark_order_shipped(id):
    object_id = parse_object_id(id)
    if not object_id:
        return jsonify({"msg": "Invalid order id"}), 400

    order = orders_collection.find_one({"_id": object_id})
    if not order:
        return jsonify({"msg": "Order not found"}), 404

    data = request.get_json() or {}
    tracking_details = str(data.get("tracking_details") or order.get("tracking_details") or "").strip()

    orders_collection.update_one(
        {"_id": object_id},
        {
            "$set": {
                "status": "Shipped",
                "tracking_details": tracking_details,
                "updated_at": datetime.utcnow(),
            }
        },
    )

    updated = orders_collection.find_one({"_id": object_id})
    return jsonify(_serialize_order(updated)), 200


@orders_bp.route("/<id>", methods=["DELETE"])
@role_required("admin", "manager")
def delete_order(id):
    object_id = parse_object_id(id)
    if not object_id:
        return jsonify({"msg": "Invalid order id"}), 400

    result = orders_collection.delete_one({"_id": object_id})
    if result.deleted_count == 0:
        return jsonify({"msg": "Order not found"}), 404

    return jsonify({"msg": "Order deleted"}), 200
