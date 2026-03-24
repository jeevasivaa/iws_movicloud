from datetime import datetime

from flask import Blueprint, jsonify, request
from pymongo.errors import DuplicateKeyError  # type: ignore[import-untyped]

from utils.db import get_db
from utils.decorators import admin_required
from utils.helpers import maybe_object_id, normalize_iso_date, parse_object_id, to_float

billing_bp = Blueprint("billing", __name__)
db = get_db()
invoices_collection = db["invoices"]


def _serialize_invoice(invoice):
    invoice["_id"] = str(invoice["_id"])
    if invoice.get("client_id") is not None:
        invoice["client_id"] = str(invoice["client_id"])
    return invoice


def _validate_status(status):
    allowed_statuses = {"Paid", "Pending", "Overdue"}
    return status in allowed_statuses


@billing_bp.route("", methods=["GET"])
@admin_required
def get_invoices():
    invoices = [_serialize_invoice(invoice) for invoice in invoices_collection.find().sort("date", -1)]
    return jsonify(invoices), 200


@billing_bp.route("/summary", methods=["GET"])
@admin_required
def get_billing_summary():
    pipeline = [
        {
            "$group": {
                "_id": "$status",
                "amount": {"$sum": "$amount"},
            }
        }
    ]
    status_amounts = {doc["_id"]: float(doc["amount"]) for doc in invoices_collection.aggregate(pipeline)}

    total_billed = round(sum(status_amounts.values()), 2)
    total_received = round(status_amounts.get("Paid", 0.0), 2)
    total_outstanding = round(status_amounts.get("Pending", 0.0) + status_amounts.get("Overdue", 0.0), 2)

    summary = {
        "total_billed": total_billed,
        "total_received": total_received,
        "total_outstanding": total_outstanding,
    }
    return jsonify(summary), 200


@billing_bp.route("", methods=["POST"])
@admin_required
def create_invoice():
    data = request.get_json() or {}
    required_fields = ["invoice_number", "client_id", "date", "amount", "status", "items"]
    missing_fields = [field for field in required_fields if data.get(field) in [None, ""]]
    if missing_fields:
        return jsonify({"msg": f"Missing required fields: {', '.join(missing_fields)}"}), 400

    status = data.get("status")
    if not _validate_status(status):
        return jsonify({"msg": "Invalid status. Use Paid, Pending, or Overdue"}), 400

    payload = {
        "invoice_number": str(data.get("invoice_number")).strip().upper(),
        "client_id": maybe_object_id(data.get("client_id")),
        "date": normalize_iso_date(data.get("date")),
        "amount": to_float(data.get("amount")),
        "status": status,
        "items": data.get("items", []),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    try:
        result = invoices_collection.insert_one(payload)
    except DuplicateKeyError:
        return jsonify({"msg": "Invoice number already exists"}), 409

    created = invoices_collection.find_one({"_id": result.inserted_id})
    return jsonify(_serialize_invoice(created)), 201


@billing_bp.route("/<id>", methods=["PUT"])
@admin_required
def update_invoice(id):
    object_id = parse_object_id(id)
    if not object_id:
        return jsonify({"msg": "Invalid invoice id"}), 400

    data = request.get_json() or {}
    update_fields = {}

    if "invoice_number" in data:
        update_fields["invoice_number"] = str(data.get("invoice_number")).strip().upper()
    if "client_id" in data:
        update_fields["client_id"] = maybe_object_id(data.get("client_id"))
    if "date" in data:
        update_fields["date"] = normalize_iso_date(data.get("date"))
    if "amount" in data:
        update_fields["amount"] = to_float(data.get("amount"))
    if "status" in data:
        status = data.get("status")
        if not _validate_status(status):
            return jsonify({"msg": "Invalid status. Use Paid, Pending, or Overdue"}), 400
        update_fields["status"] = status
    if "items" in data:
        update_fields["items"] = data.get("items")

    if not update_fields:
        return jsonify({"msg": "No updatable fields provided"}), 400

    update_fields["updated_at"] = datetime.utcnow()

    try:
        result = invoices_collection.update_one({"_id": object_id}, {"$set": update_fields})
    except DuplicateKeyError:
        return jsonify({"msg": "Invoice number already exists"}), 409

    if result.matched_count == 0:
        return jsonify({"msg": "Invoice not found"}), 404

    updated = invoices_collection.find_one({"_id": object_id})
    return jsonify(_serialize_invoice(updated)), 200


@billing_bp.route("/<id>", methods=["DELETE"])
@admin_required
def delete_invoice(id):
    object_id = parse_object_id(id)
    if not object_id:
        return jsonify({"msg": "Invalid invoice id"}), 400

    result = invoices_collection.delete_one({"_id": object_id})
    if result.deleted_count == 0:
        return jsonify({"msg": "Invoice not found"}), 404

    return jsonify({"msg": "Invoice deleted"}), 200
