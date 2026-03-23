from datetime import datetime

from flask import Blueprint, jsonify, request

from utils.db import get_db
from utils.decorators import admin_required
from utils.helpers import maybe_object_id, normalize_month, parse_object_id, to_float

payroll_bp = Blueprint("payroll", __name__)
db = get_db()
payroll_collection = db["payroll"]


def _serialize_payroll(row):
    row["_id"] = str(row["_id"])
    if row.get("staff_id") is not None:
        row["staff_id"] = str(row["staff_id"])
    return row


def _validate_status(status):
    return status in {"Paid", "Pending"}


@payroll_bp.route("", methods=["GET"])
@admin_required
def get_payroll_rows():
    rows = [_serialize_payroll(row) for row in payroll_collection.find().sort("month", -1)]
    return jsonify(rows), 200


@payroll_bp.route("/summary", methods=["GET"])
@admin_required
def get_payroll_summary():
    current_month = datetime.utcnow().strftime("%Y-%m")

    pipeline = [
        {"$match": {"month": current_month}},
        {
            "$group": {
                "_id": "$status",
                "amount": {"$sum": "$net_pay"},
            }
        },
    ]

    status_amounts = {doc["_id"]: float(doc["amount"]) for doc in payroll_collection.aggregate(pipeline)}
    paid = round(status_amounts.get("Paid", 0.0), 2)
    pending = round(status_amounts.get("Pending", 0.0), 2)

    return jsonify({
        "month": current_month,
        "total_payroll": round(paid + pending, 2),
        "paid": paid,
        "pending": pending,
    }), 200


@payroll_bp.route("", methods=["POST"])
@admin_required
def create_payroll_row():
    data = request.get_json() or {}
    required_fields = ["staff_id", "base_salary", "deductions", "net_pay", "month", "status"]
    missing_fields = [field for field in required_fields if data.get(field) in [None, ""]]
    if missing_fields:
        return jsonify({"msg": f"Missing required fields: {', '.join(missing_fields)}"}), 400

    status = data.get("status")
    if not _validate_status(status):
        return jsonify({"msg": "Invalid status. Use Paid or Pending"}), 400

    payload = {
        "staff_id": maybe_object_id(data.get("staff_id")),
        "base_salary": to_float(data.get("base_salary")),
        "deductions": to_float(data.get("deductions")),
        "net_pay": to_float(data.get("net_pay")),
        "month": normalize_month(data.get("month")),
        "status": status,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    result = payroll_collection.insert_one(payload)
    created = payroll_collection.find_one({"_id": result.inserted_id})
    return jsonify(_serialize_payroll(created)), 201


@payroll_bp.route("/<id>", methods=["PUT"])
@admin_required
def update_payroll_row(id):
    object_id = parse_object_id(id)
    if not object_id:
        return jsonify({"msg": "Invalid payroll id"}), 400

    data = request.get_json() or {}
    update_fields = {}

    if "staff_id" in data:
        update_fields["staff_id"] = maybe_object_id(data.get("staff_id"))
    if "base_salary" in data:
        update_fields["base_salary"] = to_float(data.get("base_salary"))
    if "deductions" in data:
        update_fields["deductions"] = to_float(data.get("deductions"))
    if "net_pay" in data:
        update_fields["net_pay"] = to_float(data.get("net_pay"))
    if "month" in data:
        update_fields["month"] = normalize_month(data.get("month"))
    if "status" in data:
        status = data.get("status")
        if not _validate_status(status):
            return jsonify({"msg": "Invalid status. Use Paid or Pending"}), 400
        update_fields["status"] = status

    if not update_fields:
        return jsonify({"msg": "No updatable fields provided"}), 400

    update_fields["updated_at"] = datetime.utcnow()

    result = payroll_collection.update_one({"_id": object_id}, {"$set": update_fields})
    if result.matched_count == 0:
        return jsonify({"msg": "Payroll row not found"}), 404

    updated = payroll_collection.find_one({"_id": object_id})
    return jsonify(_serialize_payroll(updated)), 200


@payroll_bp.route("/<id>", methods=["DELETE"])
@admin_required
def delete_payroll_row(id):
    object_id = parse_object_id(id)
    if not object_id:
        return jsonify({"msg": "Invalid payroll id"}), 400

    result = payroll_collection.delete_one({"_id": object_id})
    if result.deleted_count == 0:
        return jsonify({"msg": "Payroll row not found"}), 404

    return jsonify({"msg": "Payroll row deleted"}), 200
