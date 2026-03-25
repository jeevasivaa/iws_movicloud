from datetime import datetime

from flask import Blueprint, jsonify, request
from pymongo.errors import DuplicateKeyError  # type: ignore[import-untyped]

from utils.db import get_db
from utils.decorators import admin_required, role_required
from utils.helpers import maybe_object_id, normalize_iso_date, parse_object_id, to_float, to_int

orders_bp = Blueprint("orders", __name__)
db = get_db()
orders_collection = db["orders"]


def _serialize_order(order):
    order["_id"] = str(order["_id"])
    if order.get("client_id") is not None:
        order["client_id"] = str(order["client_id"])
    return order


def _validate_status(status):
    return status in {"Pending", "Processing", "Shipped", "Delivered"}


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
@role_required("admin", "manager", "staff", "finance", "client")
def get_orders():
    query = {}
    status = request.args.get("status")
    if status:
        query["status"] = str(status).strip()

    rows = [_serialize_order(row) for row in orders_collection.find(query).sort("date", -1)]
    return jsonify(rows), 200


@orders_bp.route("", methods=["POST"])
@role_required("admin", "manager")
def create_order():
    data = request.get_json() or {}
    required_fields = ["order_id", "client_id", "date", "total_items", "total_amount", "status"]
    missing_fields = [field for field in required_fields if data.get(field) in [None, ""]]
    if missing_fields:
        return jsonify({"msg": f"Missing required fields: {', '.join(missing_fields)}"}), 400

    status = data.get("status")
    if not _validate_status(status):
        return jsonify({"msg": "Invalid status. Use Pending, Processing, Shipped, or Delivered"}), 400

    payload = {
        "order_id": str(data.get("order_id")).strip().upper(),
        "client_id": maybe_object_id(data.get("client_id")),
        "date": normalize_iso_date(data.get("date")),
        "total_items": to_int(data.get("total_items")),
        "total_amount": to_float(data.get("total_amount")),
        "status": status,
        "tracking_details": str(data.get("tracking_details")).strip() if data.get("tracking_details") else "",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
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
@role_required("admin", "manager", "staff")
def update_order(id):
    object_id = parse_object_id(id)
    if not object_id:
        return jsonify({"msg": "Invalid order id"}), 400

    data = request.get_json() or {}
    update_fields = {}

    if "order_id" in data:
        update_fields["order_id"] = str(data.get("order_id")).strip().upper()
    if "client_id" in data:
        update_fields["client_id"] = maybe_object_id(data.get("client_id"))
    if "date" in data:
        update_fields["date"] = normalize_iso_date(data.get("date"))
    if "total_items" in data:
        update_fields["total_items"] = to_int(data.get("total_items"))
    if "total_amount" in data:
        update_fields["total_amount"] = to_float(data.get("total_amount"))
    if "status" in data:
        status = data.get("status")
        if not _validate_status(status):
            return jsonify({"msg": "Invalid status. Use Pending, Processing, Shipped, or Delivered"}), 400
        update_fields["status"] = status
    if "tracking_details" in data:
        update_fields["tracking_details"] = str(data.get("tracking_details")).strip()
    if "packing_items" in data:
        update_fields["packing_items"] = _normalize_packing_items(data.get("packing_items"))

    if not update_fields:
        return jsonify({"msg": "No updatable fields provided"}), 400

    update_fields["updated_at"] = datetime.utcnow()

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
@admin_required
def delete_order(id):
    object_id = parse_object_id(id)
    if not object_id:
        return jsonify({"msg": "Invalid order id"}), 400

    result = orders_collection.delete_one({"_id": object_id})
    if result.deleted_count == 0:
        return jsonify({"msg": "Order not found"}), 404

    return jsonify({"msg": "Order deleted"}), 200
