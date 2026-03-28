from datetime import datetime, timezone

from flask import Blueprint, jsonify, request

from utils.db import get_db
from utils.decorators import role_required
from utils.helpers import normalize_iso_date, parse_float_value, parse_int_value, parse_object_id

MAX_COMPANY_NAME_LENGTH = 160
MAX_CONTACT_PERSON_LENGTH = 120
MAX_EMAIL_LENGTH = 254

marketing_bp = Blueprint("marketing", __name__)
db = get_db()
clients_collection = db["clients"]


def _serialize_client(client):
    client["_id"] = str(client["_id"])
    return client


def _serialize_client_for_finance(client):
    return {
        "_id": str(client["_id"]),
        "company_name": client.get("company_name", ""),
        "gstin": client.get("gstin", "-"),
        "billing_address": client.get("billing_address", "-"),
        "email": client.get("email", ""),
        "contact_person": client.get("contact_person", ""),
    }


@marketing_bp.route("", methods=["GET"])
@role_required("admin", "manager")
def get_clients():
    if request.args.get("scope") == "finance":
        clients = [
            _serialize_client_for_finance(client)
            for client in clients_collection.find().sort("company_name", 1)
        ]
        return jsonify(clients), 200

    clients = [
        _serialize_client(client)
        for client in clients_collection.find().sort("company_name", 1)
    ]
    return jsonify(clients), 200


@marketing_bp.route("", methods=["POST"])
@role_required("admin", "manager")
def create_client():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"msg": "Invalid JSON payload"}), 400
    required_fields = ["company_name", "contact_person", "email", "total_orders", "last_order_date", "rating"]
    missing_fields = [field for field in required_fields if data.get(field) in [None, ""]]
    if missing_fields:
        return jsonify(
            {"msg": f"Missing required fields: {', '.join(missing_fields)}"}
        ), 400

    last_order_date = normalize_iso_date(data.get("last_order_date"))
    if not last_order_date:
        return jsonify({"msg": "Invalid last_order_date. Use YYYY-MM-DD"}), 400

    total_orders = parse_int_value(data.get("total_orders"))
    if total_orders is None:
        return jsonify({"msg": "total_orders must be a valid number"}), 400
    if total_orders < 0:
        return jsonify({"msg": "total_orders must be greater than or equal to 0"}), 400

    rating = parse_float_value(data.get("rating"))
    if rating is None:
        return jsonify({"msg": "rating must be a valid number"}), 400
    if rating < 0 or rating > 5:
        return jsonify({"msg": "rating must be between 0 and 5"}), 400

    company_name = str(data.get("company_name") or "").strip()
    if len(company_name) > MAX_COMPANY_NAME_LENGTH:
        return jsonify({"msg": "company_name must be at most 160 characters"}), 400

    contact_person = str(data.get("contact_person") or "").strip()
    if len(contact_person) > MAX_CONTACT_PERSON_LENGTH:
        return jsonify({"msg": "contact_person must be at most 120 characters"}), 400

    email = str(data.get("email") or "").strip().lower()
    if len(email) > MAX_EMAIL_LENGTH:
        return jsonify({"msg": "email must be at most 254 characters"}), 400

    payload = {
        "company_name": company_name,
        "contact_person": contact_person,
        "email": email,
        "total_orders": total_orders,
        "last_order_date": last_order_date,
        "rating": round(rating, 1),
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }

    result = clients_collection.insert_one(payload)
    created = clients_collection.find_one({"_id": result.inserted_id})
    return jsonify(_serialize_client(created)), 201


@marketing_bp.route("/<id>", methods=["PUT"])
@role_required("admin", "manager")
def update_client(id):
    object_id = parse_object_id(id)
    if not object_id:
        return jsonify({"msg": "Invalid client id"}), 400

    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"msg": "Invalid JSON payload"}), 400
    update_fields = {}

    if "company_name" in data:
        company_name = str(data.get("company_name") or "").strip()
        if not company_name:
            return jsonify({"msg": "company_name cannot be empty"}), 400
        if len(company_name) > MAX_COMPANY_NAME_LENGTH:
            return jsonify({"msg": "company_name must be at most 160 characters"}), 400
        update_fields["company_name"] = company_name
    if "contact_person" in data:
        contact_person = str(data.get("contact_person") or "").strip()
        if not contact_person:
            return jsonify({"msg": "contact_person cannot be empty"}), 400
        if len(contact_person) > MAX_CONTACT_PERSON_LENGTH:
            return jsonify({"msg": "contact_person must be at most 120 characters"}), 400
        update_fields["contact_person"] = contact_person
    if "email" in data:
        email = str(data.get("email") or "").strip().lower()
        if not email:
            return jsonify({"msg": "email cannot be empty"}), 400
        if len(email) > MAX_EMAIL_LENGTH:
            return jsonify({"msg": "email must be at most 254 characters"}), 400
        update_fields["email"] = email
    if "total_orders" in data:
        total_orders = parse_int_value(data.get("total_orders"))
        if total_orders is None:
            return jsonify({"msg": "total_orders must be a valid number"}), 400
        if total_orders < 0:
            return jsonify({"msg": "total_orders must be greater than or equal to 0"}), 400
        update_fields["total_orders"] = total_orders
    if "last_order_date" in data:
        last_order_date = normalize_iso_date(data.get("last_order_date"))
        if not last_order_date:
            return jsonify({"msg": "Invalid last_order_date. Use YYYY-MM-DD"}), 400
        update_fields["last_order_date"] = last_order_date
    if "rating" in data:
        rating = parse_float_value(data.get("rating"))
        if rating is None:
            return jsonify({"msg": "rating must be a valid number"}), 400
        if rating < 0 or rating > 5:
            return jsonify({"msg": "rating must be between 0 and 5"}), 400
        update_fields["rating"] = round(rating, 1)

    if not update_fields:
        return jsonify({"msg": "No updatable fields provided"}), 400

    update_fields["updated_at"] = datetime.now(timezone.utc)

    result = clients_collection.update_one({"_id": object_id}, {"$set": update_fields})
    if result.matched_count == 0:
        return jsonify({"msg": "Client not found"}), 404

    updated = clients_collection.find_one({"_id": object_id})
    return jsonify(_serialize_client(updated)), 200


@marketing_bp.route("/<id>", methods=["DELETE"])
@role_required("admin", "manager")
def delete_client(id):
    object_id = parse_object_id(id)
    if not object_id:
        return jsonify({"msg": "Invalid client id"}), 400

    result = clients_collection.delete_one({"_id": object_id})
    if result.deleted_count == 0:
        return jsonify({"msg": "Client not found"}), 404

    return jsonify({"msg": "Client deleted"}), 200
