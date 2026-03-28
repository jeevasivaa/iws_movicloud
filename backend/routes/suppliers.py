from datetime import datetime, timezone

from flask import Blueprint, jsonify, request

from utils.db import get_db
from utils.decorators import role_required
from utils.helpers import normalize_choice, parse_float_value, parse_int_value, parse_object_id

suppliers_bp = Blueprint("suppliers", __name__)
db = get_db()
suppliers_collection = db["suppliers"]


def _serialize_supplier(supplier):
    supplier["_id"] = str(supplier["_id"])
    return supplier


def _normalize_status(value):
    return normalize_choice(value, ("Active", "Inactive", "Under Review"))


@suppliers_bp.route("", methods=["GET"])
@role_required("admin", "manager")
def get_suppliers():
    suppliers = [_serialize_supplier(supplier) for supplier in suppliers_collection.find().sort("name", 1)]
    return jsonify(suppliers), 200


@suppliers_bp.route("", methods=["POST"])
@role_required("admin", "manager")
def create_supplier():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"msg": "Invalid JSON payload"}), 400
    required_fields = ["name", "location", "category_supplied", "rating", "total_orders", "status"]
    missing_fields = [field for field in required_fields if data.get(field) in [None, ""]]
    if missing_fields:
        return jsonify({"msg": f"Missing required fields: {', '.join(missing_fields)}"}), 400

    status = data.get("status")
    normalized_status = _normalize_status(status)
    if not normalized_status:
        return jsonify({"msg": "Invalid status. Use Active, Inactive, or Under Review"}), 400

    rating = parse_float_value(data.get("rating"))
    if rating is None:
        return jsonify({"msg": "rating must be a valid number"}), 400
    if rating < 0 or rating > 5:
        return jsonify({"msg": "rating must be between 0 and 5"}), 400

    total_orders = parse_int_value(data.get("total_orders"))
    if total_orders is None:
        return jsonify({"msg": "total_orders must be a valid number"}), 400
    if total_orders < 0:
        return jsonify({"msg": "total_orders must be greater than or equal to 0"}), 400

    name = str(data.get("name") or "").strip()
    if len(name) > 120:
        return jsonify({"msg": "name must be at most 120 characters"}), 400

    location = str(data.get("location") or "").strip()
    if len(location) > 120:
        return jsonify({"msg": "location must be at most 120 characters"}), 400

    category_supplied = str(data.get("category_supplied") or "").strip()
    if len(category_supplied) > 120:
        return jsonify({"msg": "category_supplied must be at most 120 characters"}), 400

    payload = {
        "name": name,
        "location": location,
        "category_supplied": category_supplied,
        "rating": round(rating, 1),
        "total_orders": total_orders,
        "status": normalized_status,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }

    result = suppliers_collection.insert_one(payload)
    created = suppliers_collection.find_one({"_id": result.inserted_id})
    return jsonify(_serialize_supplier(created)), 201


@suppliers_bp.route("/<id>", methods=["PUT"])
@role_required("admin", "manager")
def update_supplier(id):
    object_id = parse_object_id(id)
    if not object_id:
        return jsonify({"msg": "Invalid supplier id"}), 400

    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"msg": "Invalid JSON payload"}), 400
    update_fields = {}

    if "name" in data:
        name = str(data.get("name") or "").strip()
        if not name:
            return jsonify({"msg": "name cannot be empty"}), 400
        if len(name) > 120:
            return jsonify({"msg": "name must be at most 120 characters"}), 400
        update_fields["name"] = name
    if "location" in data:
        location = str(data.get("location") or "").strip()
        if not location:
            return jsonify({"msg": "location cannot be empty"}), 400
        if len(location) > 120:
            return jsonify({"msg": "location must be at most 120 characters"}), 400
        update_fields["location"] = location
    if "category_supplied" in data:
        category_supplied = str(data.get("category_supplied") or "").strip()
        if not category_supplied:
            return jsonify({"msg": "category_supplied cannot be empty"}), 400
        if len(category_supplied) > 120:
            return jsonify({"msg": "category_supplied must be at most 120 characters"}), 400
        update_fields["category_supplied"] = category_supplied
    if "rating" in data:
        rating = parse_float_value(data.get("rating"))
        if rating is None:
            return jsonify({"msg": "rating must be a valid number"}), 400
        if rating < 0 or rating > 5:
            return jsonify({"msg": "rating must be between 0 and 5"}), 400
        update_fields["rating"] = round(rating, 1)
    if "total_orders" in data:
        total_orders = parse_int_value(data.get("total_orders"))
        if total_orders is None:
            return jsonify({"msg": "total_orders must be a valid number"}), 400
        if total_orders < 0:
            return jsonify({"msg": "total_orders must be greater than or equal to 0"}), 400
        update_fields["total_orders"] = total_orders
    if "status" in data:
        normalized_status = _normalize_status(data.get("status"))
        if not normalized_status:
            return jsonify({"msg": "Invalid status. Use Active, Inactive, or Under Review"}), 400
        update_fields["status"] = normalized_status

    if not update_fields:
        return jsonify({"msg": "No updatable fields provided"}), 400

    update_fields["updated_at"] = datetime.now(timezone.utc)

    result = suppliers_collection.update_one({"_id": object_id}, {"$set": update_fields})
    if result.matched_count == 0:
        return jsonify({"msg": "Supplier not found"}), 404

    updated = suppliers_collection.find_one({"_id": object_id})
    return jsonify(_serialize_supplier(updated)), 200


@suppliers_bp.route("/<id>", methods=["DELETE"])
@role_required("admin", "manager")
def delete_supplier(id):
    object_id = parse_object_id(id)
    if not object_id:
        return jsonify({"msg": "Invalid supplier id"}), 400

    result = suppliers_collection.delete_one({"_id": object_id})
    if result.deleted_count == 0:
        return jsonify({"msg": "Supplier not found"}), 404

    return jsonify({"msg": "Supplier deleted"}), 200
