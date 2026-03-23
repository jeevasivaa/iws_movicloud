from datetime import datetime

from flask import Blueprint, jsonify, request
from pymongo.errors import DuplicateKeyError  # type: ignore[import-untyped]

from utils.db import get_db
from utils.helpers import parse_object_id, to_float, to_int
from utils.decorators import admin_required

products_bp = Blueprint("products", __name__)
db = get_db()
products_collection = db["products"]


def _serialize_product(product):
    product["_id"] = str(product["_id"])
    return product


def _validate_status(status):
    allowed_statuses = {"Active", "Low Stock", "Out of Stock"}
    return status in allowed_statuses


@products_bp.route("", methods=["GET"])
@admin_required
def get_products():
    products = [_serialize_product(product) for product in products_collection.find().sort("name", 1)]
    return jsonify(products), 200


@products_bp.route("", methods=["POST"])
@admin_required
def create_product():
    data = request.get_json() or {}

    required_fields = ["name", "sku", "category", "price", "stock", "status"]
    missing_fields = [field for field in required_fields if data.get(field) in [None, ""]]
    if missing_fields:
        return jsonify({"msg": f"Missing required fields: {', '.join(missing_fields)}"}), 400

    status = data.get("status")
    if not _validate_status(status):
        return jsonify({"msg": "Invalid status. Use Active, Low Stock, or Out of Stock"}), 400

    payload = {
        "name": str(data.get("name")).strip(),
        "sku": str(data.get("sku")).strip().upper(),
        "category": str(data.get("category")).strip(),
        "price": to_float(data.get("price")),
        "stock": to_int(data.get("stock")),
        "status": status,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    try:
        result = products_collection.insert_one(payload)
    except DuplicateKeyError:
        return jsonify({"msg": "SKU already exists"}), 409

    created = products_collection.find_one({"_id": result.inserted_id})
    return jsonify(_serialize_product(created)), 201


@products_bp.route("/<id>", methods=["PUT"])
@admin_required
def update_product(id):
    object_id = parse_object_id(id)
    if not object_id:
        return jsonify({"msg": "Invalid product id"}), 400

    data = request.get_json() or {}
    update_fields = {}

    if "name" in data:
        update_fields["name"] = str(data.get("name")).strip()
    if "sku" in data:
        update_fields["sku"] = str(data.get("sku")).strip().upper()
    if "category" in data:
        update_fields["category"] = str(data.get("category")).strip()
    if "price" in data:
        update_fields["price"] = to_float(data.get("price"))
    if "stock" in data:
        update_fields["stock"] = to_int(data.get("stock"))
    if "status" in data:
        status = data.get("status")
        if not _validate_status(status):
            return jsonify({"msg": "Invalid status. Use Active, Low Stock, or Out of Stock"}), 400
        update_fields["status"] = status

    if not update_fields:
        return jsonify({"msg": "No updatable fields provided"}), 400

    update_fields["updated_at"] = datetime.utcnow()

    try:
        result = products_collection.update_one({"_id": object_id}, {"$set": update_fields})
    except DuplicateKeyError:
        return jsonify({"msg": "SKU already exists"}), 409

    if result.matched_count == 0:
        return jsonify({"msg": "Product not found"}), 404

    updated = products_collection.find_one({"_id": object_id})
    return jsonify(_serialize_product(updated)), 200


@products_bp.route("/<id>", methods=["DELETE"])
@admin_required
def delete_product(id):
    object_id = parse_object_id(id)
    if not object_id:
        return jsonify({"msg": "Invalid product id"}), 400

    result = products_collection.delete_one({"_id": object_id})
    if result.deleted_count == 0:
        return jsonify({"msg": "Product not found"}), 404

    return jsonify({"msg": "Product deleted"}), 200
