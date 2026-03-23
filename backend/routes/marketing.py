from datetime import datetime

from flask import Blueprint, jsonify, request

from utils.db import get_db
from utils.decorators import admin_required
from utils.helpers import normalize_iso_date, parse_object_id, to_float, to_int

marketing_bp = Blueprint("marketing", __name__)
db = get_db()
clients_collection = db["clients"]


def _serialize_client(client):
    client["_id"] = str(client["_id"])
    return client


@marketing_bp.route("", methods=["GET"])
@admin_required
def get_clients():
    clients = [_serialize_client(client) for client in clients_collection.find().sort("company_name", 1)]
    return jsonify(clients), 200


@marketing_bp.route("", methods=["POST"])
@admin_required
def create_client():
    data = request.get_json() or {}
    required_fields = ["company_name", "contact_person", "email", "total_orders", "last_order_date", "rating"]
    missing_fields = [field for field in required_fields if data.get(field) in [None, ""]]
    if missing_fields:
        return jsonify({"msg": f"Missing required fields: {', '.join(missing_fields)}"}), 400

    payload = {
        "company_name": str(data.get("company_name")).strip(),
        "contact_person": str(data.get("contact_person")).strip(),
        "email": str(data.get("email")).strip().lower(),
        "total_orders": to_int(data.get("total_orders")),
        "last_order_date": normalize_iso_date(data.get("last_order_date")),
        "rating": round(to_float(data.get("rating")), 1),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    result = clients_collection.insert_one(payload)
    created = clients_collection.find_one({"_id": result.inserted_id})
    return jsonify(_serialize_client(created)), 201


@marketing_bp.route("/<id>", methods=["PUT"])
@admin_required
def update_client(id):
    object_id = parse_object_id(id)
    if not object_id:
        return jsonify({"msg": "Invalid client id"}), 400

    data = request.get_json() or {}
    update_fields = {}

    if "company_name" in data:
        update_fields["company_name"] = str(data.get("company_name")).strip()
    if "contact_person" in data:
        update_fields["contact_person"] = str(data.get("contact_person")).strip()
    if "email" in data:
        update_fields["email"] = str(data.get("email")).strip().lower()
    if "total_orders" in data:
        update_fields["total_orders"] = to_int(data.get("total_orders"))
    if "last_order_date" in data:
        update_fields["last_order_date"] = normalize_iso_date(data.get("last_order_date"))
    if "rating" in data:
        update_fields["rating"] = round(to_float(data.get("rating")), 1)

    if not update_fields:
        return jsonify({"msg": "No updatable fields provided"}), 400

    update_fields["updated_at"] = datetime.utcnow()

    result = clients_collection.update_one({"_id": object_id}, {"$set": update_fields})
    if result.matched_count == 0:
        return jsonify({"msg": "Client not found"}), 404

    updated = clients_collection.find_one({"_id": object_id})
    return jsonify(_serialize_client(updated)), 200


@marketing_bp.route("/<id>", methods=["DELETE"])
@admin_required
def delete_client(id):
    object_id = parse_object_id(id)
    if not object_id:
        return jsonify({"msg": "Invalid client id"}), 400

    result = clients_collection.delete_one({"_id": object_id})
    if result.deleted_count == 0:
        return jsonify({"msg": "Client not found"}), 404

    return jsonify({"msg": "Client deleted"}), 200
