from datetime import datetime

from flask import Blueprint, jsonify, request

from utils.db import get_db
from utils.decorators import admin_required
from utils.helpers import parse_object_id, to_float, to_int

suppliers_bp = Blueprint("suppliers", __name__)
db = get_db()
suppliers_collection = db["suppliers"]


def _serialize_supplier(supplier):
    supplier["_id"] = str(supplier["_id"])
    return supplier


def _validate_status(status):
    allowed_statuses = {"Active", "Inactive", "Under Review"}
    return status in allowed_statuses


@suppliers_bp.route("", methods=["GET"])
@admin_required
def get_suppliers():
    suppliers = [_serialize_supplier(supplier) for supplier in suppliers_collection.find().sort("name", 1)]
    return jsonify(suppliers), 200


@suppliers_bp.route("", methods=["POST"])
@admin_required
def create_supplier():
    data = request.get_json() or {}
    required_fields = ["name", "location", "category_supplied", "rating", "total_orders", "status"]
    missing_fields = [field for field in required_fields if data.get(field) in [None, ""]]
    if missing_fields:
        return jsonify({"msg": f"Missing required fields: {', '.join(missing_fields)}"}), 400

    status = data.get("status")
    if not _validate_status(status):
        return jsonify({"msg": "Invalid status. Use Active, Inactive, or Under Review"}), 400

    payload = {
        "name": str(data.get("name")).strip(),
        "location": str(data.get("location")).strip(),
        "category_supplied": str(data.get("category_supplied")).strip(),
        "rating": round(to_float(data.get("rating")), 1),
        "total_orders": to_int(data.get("total_orders")),
        "status": status,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    result = suppliers_collection.insert_one(payload)
    created = suppliers_collection.find_one({"_id": result.inserted_id})
    return jsonify(_serialize_supplier(created)), 201


@suppliers_bp.route("/<id>", methods=["PUT"])
@admin_required
def update_supplier(id):
    object_id = parse_object_id(id)
    if not object_id:
        return jsonify({"msg": "Invalid supplier id"}), 400

    data = request.get_json() or {}
    update_fields = {}

    if "name" in data:
        update_fields["name"] = str(data.get("name")).strip()
    if "location" in data:
        update_fields["location"] = str(data.get("location")).strip()
    if "category_supplied" in data:
        update_fields["category_supplied"] = str(data.get("category_supplied")).strip()
    if "rating" in data:
        update_fields["rating"] = round(to_float(data.get("rating")), 1)
    if "total_orders" in data:
        update_fields["total_orders"] = to_int(data.get("total_orders"))
    if "status" in data:
        status = data.get("status")
        if not _validate_status(status):
            return jsonify({"msg": "Invalid status. Use Active, Inactive, or Under Review"}), 400
        update_fields["status"] = status

    if not update_fields:
        return jsonify({"msg": "No updatable fields provided"}), 400

    update_fields["updated_at"] = datetime.utcnow()

    result = suppliers_collection.update_one({"_id": object_id}, {"$set": update_fields})
    if result.matched_count == 0:
        return jsonify({"msg": "Supplier not found"}), 404

    updated = suppliers_collection.find_one({"_id": object_id})
    return jsonify(_serialize_supplier(updated)), 200


@suppliers_bp.route("/<id>", methods=["DELETE"])
@admin_required
def delete_supplier(id):
    object_id = parse_object_id(id)
    if not object_id:
        return jsonify({"msg": "Invalid supplier id"}), 400

    result = suppliers_collection.delete_one({"_id": object_id})
    if result.deleted_count == 0:
        return jsonify({"msg": "Supplier not found"}), 404

    return jsonify({"msg": "Supplier deleted"}), 200
