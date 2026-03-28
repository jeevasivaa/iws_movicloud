from datetime import datetime, timezone

from flask import Blueprint, jsonify, request
from pymongo.errors import DuplicateKeyError  # type: ignore[import-untyped]

from utils.db import get_db
from utils.decorators import role_required
from utils.helpers import normalize_choice, parse_float_value, parse_int_value, parse_object_id

products_bp = Blueprint("products", __name__)
db = get_db()
products_collection = db["products"]


def _serialize_product(product):
    product["_id"] = str(product["_id"])
    return product


def _normalize_status(value):
    return normalize_choice(value, ("Active", "Low Stock", "Out of Stock"))


@products_bp.route("", methods=["GET"])
@role_required("admin", "manager")
def get_products():
    products = [_serialize_product(product) for product in products_collection.find().sort("name", 1)]
    return jsonify(products), 200


@products_bp.route("", methods=["POST"])
@role_required("admin", "manager")
def create_product():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"msg": "Invalid JSON payload"}), 400

    required_fields = ["name", "sku", "category", "price", "stock", "status"]
    missing_fields = [field for field in required_fields if data.get(field) in [None, ""]]
    if missing_fields:
        return jsonify({"msg": f"Missing required fields: {', '.join(missing_fields)}"}), 400

    status = data.get("status")
    normalized_status = _normalize_status(status)
    if not normalized_status:
        return jsonify({"msg": "Invalid status. Use Active, Low Stock, or Out of Stock"}), 400

    price = parse_float_value(data.get("price"))
    if price is None:
        return jsonify({"msg": "price must be a valid number"}), 400
    if price < 0:
        return jsonify({"msg": "price must be greater than or equal to 0"}), 400

    stock = parse_int_value(data.get("stock"))
    if stock is None:
        return jsonify({"msg": "stock must be a valid number"}), 400
    if stock < 0:
        return jsonify({"msg": "stock must be greater than or equal to 0"}), 400

    name = str(data.get("name") or "").strip()
    if len(name) > 120:
        return jsonify({"msg": "name must be at most 120 characters"}), 400

    sku = str(data.get("sku") or "").strip().upper()
    if len(sku) > 40:
        return jsonify({"msg": "sku must be at most 40 characters"}), 400

    category = str(data.get("category") or "").strip()
    if len(category) > 80:
        return jsonify({"msg": "category must be at most 80 characters"}), 400

    payload = {
        "name": name,
        "sku": sku,
        "category": category,
        "price": price,
        "stock": stock,
        "status": normalized_status,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }

    try:
        result = products_collection.insert_one(payload)
    except DuplicateKeyError:
        return jsonify({"msg": "SKU already exists"}), 409

    created = products_collection.find_one({"_id": result.inserted_id})
    return jsonify(_serialize_product(created)), 201


@products_bp.route("/<id>", methods=["PUT"])
@role_required("admin", "manager")
def update_product(id):
    object_id = parse_object_id(id)
    if not object_id:
        return jsonify({"msg": "Invalid product id"}), 400

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
    if "sku" in data:
        sku = str(data.get("sku") or "").strip().upper()
        if not sku:
            return jsonify({"msg": "sku cannot be empty"}), 400
        if len(sku) > 40:
            return jsonify({"msg": "sku must be at most 40 characters"}), 400
        update_fields["sku"] = sku
    if "category" in data:
        category = str(data.get("category") or "").strip()
        if not category:
            return jsonify({"msg": "category cannot be empty"}), 400
        if len(category) > 80:
            return jsonify({"msg": "category must be at most 80 characters"}), 400
        update_fields["category"] = category
    if "price" in data:
        price = parse_float_value(data.get("price"))
        if price is None:
            return jsonify({"msg": "price must be a valid number"}), 400
        if price < 0:
            return jsonify({"msg": "price must be greater than or equal to 0"}), 400
        update_fields["price"] = price
    if "stock" in data:
        stock = parse_int_value(data.get("stock"))
        if stock is None:
            return jsonify({"msg": "stock must be a valid number"}), 400
        if stock < 0:
            return jsonify({"msg": "stock must be greater than or equal to 0"}), 400
        update_fields["stock"] = stock
    if "status" in data:
        normalized_status = _normalize_status(data.get("status"))
        if not normalized_status:
            return jsonify({"msg": "Invalid status. Use Active, Low Stock, or Out of Stock"}), 400
        update_fields["status"] = normalized_status

    if not update_fields:
        return jsonify({"msg": "No updatable fields provided"}), 400

    update_fields["updated_at"] = datetime.now(timezone.utc)

    try:
        result = products_collection.update_one({"_id": object_id}, {"$set": update_fields})
    except DuplicateKeyError:
        return jsonify({"msg": "SKU already exists"}), 409

    if result.matched_count == 0:
        return jsonify({"msg": "Product not found"}), 404

    updated = products_collection.find_one({"_id": object_id})
    return jsonify(_serialize_product(updated)), 200


@products_bp.route("/<id>", methods=["DELETE"])
@role_required("admin", "manager")
def delete_product(id):
    object_id = parse_object_id(id)
    if not object_id:
        return jsonify({"msg": "Invalid product id"}), 400

    result = products_collection.delete_one({"_id": object_id})
    if result.deleted_count == 0:
        return jsonify({"msg": "Product not found"}), 404

    return jsonify({"msg": "Product deleted"}), 200
