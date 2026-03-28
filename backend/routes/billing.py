from datetime import datetime, timezone

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt  # type: ignore[import-untyped]
from pymongo.errors import DuplicateKeyError  # type: ignore[import-untyped]

from utils.db import get_db
from utils.decorators import role_required
from utils.helpers import maybe_object_id, normalize_choice, normalize_iso_date, parse_float_value, parse_object_id

MAX_INVOICE_NUMBER_LENGTH = 40

billing_bp = Blueprint("billing", __name__)
db = get_db()
invoices_collection = db["invoices"]


def _serialize_invoice(invoice):
    invoice["_id"] = str(invoice["_id"])
    if invoice.get("client_id") is not None:
        invoice["client_id"] = str(invoice["client_id"])
    return invoice


def _normalize_status(value):
    return normalize_choice(value, ("Paid", "Pending", "Overdue"))


def _build_invoice_query_for_role() -> dict:
    claims = get_jwt()
    role = claims.get("role")
    if role == "finance":
        return {"status": {"$in": ["Paid", "Pending", "Overdue"]}}
    return {}


@billing_bp.route("", methods=["GET"])
@role_required("admin", "finance")
def get_invoices():
    query = _build_invoice_query_for_role()
    invoices = [
        _serialize_invoice(invoice)
        for invoice in invoices_collection.find(query).sort("date", -1)
    ]
    return jsonify(invoices), 200


@billing_bp.route("/summary", methods=["GET"])
@role_required("admin", "finance")
def get_billing_summary():
    query = _build_invoice_query_for_role()
    pipeline = [
        {"$match": query},
        {
            "$group": {
                "_id": "$status",
                "amount": {"$sum": "$amount"},
            }
        },
    ]
    status_amounts = {
        doc["_id"]: float(doc["amount"])
        for doc in invoices_collection.aggregate(pipeline)
    }

    total_billed = round(sum(status_amounts.values()), 2)
    total_received = round(status_amounts.get("Paid", 0.0), 2)
    total_outstanding = round(
        status_amounts.get("Pending", 0.0) + status_amounts.get("Overdue", 0.0), 2
    )

    summary = {
        "total_billed": total_billed,
        "total_received": total_received,
        "total_outstanding": total_outstanding,
    }
    return jsonify(summary), 200


@billing_bp.route("", methods=["POST"])
@role_required("admin", "finance")
def create_invoice():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"msg": "Invalid JSON payload"}), 400
    required_fields = ["invoice_number", "client_id", "date", "amount", "status", "items"]
    missing_fields = [field for field in required_fields if data.get(field) in [None, ""]]
    if missing_fields:
        return jsonify(
            {"msg": f"Missing required fields: {', '.join(missing_fields)}"}
        ), 400

    status = data.get("status")
    normalized_status = _normalize_status(status)
    if not normalized_status:
        return jsonify({"msg": "Invalid status. Use Paid, Pending, or Overdue"}), 400

    invoice_date = normalize_iso_date(data.get("date"))
    if not invoice_date:
        return jsonify({"msg": "Invalid date. Use YYYY-MM-DD"}), 400

    amount = parse_float_value(data.get("amount"))
    if amount is None:
        return jsonify({"msg": "amount must be a valid number"}), 400
    if amount < 0:
        return jsonify({"msg": "amount must be greater than or equal to 0"}), 400

    invoice_number = str(data.get("invoice_number") or "").strip().upper()
    if len(invoice_number) > MAX_INVOICE_NUMBER_LENGTH:
        return jsonify({"msg": "invoice_number must be at most 40 characters"}), 400

    items = data.get("items", [])
    if not isinstance(items, list):
        return jsonify({"msg": "items must be an array"}), 400

    payload = {
        "invoice_number": invoice_number,
        "client_id": maybe_object_id(data.get("client_id")),
        "date": invoice_date,
        "amount": amount,
        "status": normalized_status,
        "items": items,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }

    try:
        result = invoices_collection.insert_one(payload)
    except DuplicateKeyError:
        return jsonify({"msg": "Invoice number already exists"}), 409

    created = invoices_collection.find_one({"_id": result.inserted_id})
    return jsonify(_serialize_invoice(created)), 201


@billing_bp.route("/<id>", methods=["PUT"])
@role_required("admin", "finance")
def update_invoice(id):
    object_id = parse_object_id(id)
    if not object_id:
        return jsonify({"msg": "Invalid invoice id"}), 400

    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"msg": "Invalid JSON payload"}), 400
    update_fields = {}

    if "invoice_number" in data:
        invoice_number = str(data.get("invoice_number") or "").strip().upper()
        if not invoice_number:
            return jsonify({"msg": "invoice_number cannot be empty"}), 400
        if len(invoice_number) > MAX_INVOICE_NUMBER_LENGTH:
            return jsonify({"msg": "invoice_number must be at most 40 characters"}), 400
        update_fields["invoice_number"] = invoice_number
    if "client_id" in data:
        update_fields["client_id"] = maybe_object_id(data.get("client_id"))
    if "date" in data:
        invoice_date = normalize_iso_date(data.get("date"))
        if not invoice_date:
            return jsonify({"msg": "Invalid date. Use YYYY-MM-DD"}), 400
        update_fields["date"] = invoice_date
    if "amount" in data:
        amount = parse_float_value(data.get("amount"))
        if amount is None:
            return jsonify({"msg": "amount must be a valid number"}), 400
        if amount < 0:
            return jsonify({"msg": "amount must be greater than or equal to 0"}), 400
        update_fields["amount"] = amount
    if "status" in data:
        normalized_status = _normalize_status(data.get("status"))
        if not normalized_status:
            return jsonify({"msg": "Invalid status. Use Paid, Pending, or Overdue"}), 400
        update_fields["status"] = normalized_status
    if "items" in data:
        if not isinstance(data.get("items"), list):
            return jsonify({"msg": "items must be an array"}), 400
        update_fields["items"] = data.get("items")

    if not update_fields:
        return jsonify({"msg": "No updatable fields provided"}), 400

    update_fields["updated_at"] = datetime.now(timezone.utc)

    try:
        result = invoices_collection.update_one(
            {"_id": object_id}, {"$set": update_fields}
        )
    except DuplicateKeyError:
        return jsonify({"msg": "Invoice number already exists"}), 409

    if result.matched_count == 0:
        return jsonify({"msg": "Invoice not found"}), 404

    updated = invoices_collection.find_one({"_id": object_id})
    return jsonify(_serialize_invoice(updated)), 200


@billing_bp.route("/<id>", methods=["DELETE"])
@role_required("admin", "finance")
def delete_invoice(id):
    object_id = parse_object_id(id)
    if not object_id:
        return jsonify({"msg": "Invalid invoice id"}), 400

    result = invoices_collection.delete_one({"_id": object_id})
    if result.deleted_count == 0:
        return jsonify({"msg": "Invoice not found"}), 404

    return jsonify({"msg": "Invoice deleted"}), 200
