from datetime import datetime, timezone

from flask import Blueprint, jsonify, request

from utils.db import get_db
from utils.decorators import role_required
from utils.helpers import maybe_object_id, normalize_choice, normalize_month, parse_float_value, parse_object_id

payroll_bp = Blueprint("payroll", __name__)
db = get_db()
payroll_collection = db["payroll"]


def _serialize_payroll(row):
    row["_id"] = str(row["_id"])
    if row.get("staff_id") is not None:
        row["staff_id"] = str(row["staff_id"])
    return row


def _normalize_status(value):
    return normalize_choice(value, ("Paid", "Pending"))


@payroll_bp.route("", methods=["GET"])
@role_required("admin", "finance")
def get_payroll_rows():
    rows = [_serialize_payroll(row) for row in payroll_collection.find().sort("month", -1)]
    return jsonify(rows), 200


@payroll_bp.route("/summary", methods=["GET"])
@role_required("admin", "finance")
def get_payroll_summary():
    current_month = datetime.now(timezone.utc).strftime("%Y-%m")

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
@role_required("admin", "finance")
def create_payroll_row():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"msg": "Invalid JSON payload"}), 400
    required_fields = ["staff_id", "base_salary", "deductions", "net_pay", "month", "status"]
    missing_fields = [field for field in required_fields if data.get(field) in [None, ""]]
    if missing_fields:
        return jsonify({"msg": f"Missing required fields: {', '.join(missing_fields)}"}), 400

    status = data.get("status")
    normalized_status = _normalize_status(status)
    if not normalized_status:
        return jsonify({"msg": "Invalid status. Use Paid or Pending"}), 400

    month_value = normalize_month(data.get("month"))
    if not month_value:
        return jsonify({"msg": "Invalid month. Use YYYY-MM"}), 400

    base_salary = parse_float_value(data.get("base_salary"))
    if base_salary is None:
        return jsonify({"msg": "base_salary must be a valid number"}), 400
    if base_salary < 0:
        return jsonify({"msg": "base_salary must be greater than or equal to 0"}), 400

    deductions = parse_float_value(data.get("deductions"))
    if deductions is None:
        return jsonify({"msg": "deductions must be a valid number"}), 400
    if deductions < 0:
        return jsonify({"msg": "deductions must be greater than or equal to 0"}), 400

    net_pay = parse_float_value(data.get("net_pay"))
    if net_pay is None:
        return jsonify({"msg": "net_pay must be a valid number"}), 400
    if net_pay < 0:
        return jsonify({"msg": "net_pay must be greater than or equal to 0"}), 400

    payload = {
        "staff_id": maybe_object_id(data.get("staff_id")),
        "base_salary": base_salary,
        "deductions": deductions,
        "net_pay": net_pay,
        "month": month_value,
        "status": normalized_status,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }

    result = payroll_collection.insert_one(payload)
    created = payroll_collection.find_one({"_id": result.inserted_id})
    return jsonify(_serialize_payroll(created)), 201


@payroll_bp.route("/<id>", methods=["PUT"])
@role_required("admin", "finance")
def update_payroll_row(id):
    object_id = parse_object_id(id)
    if not object_id:
        return jsonify({"msg": "Invalid payroll id"}), 400

    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"msg": "Invalid JSON payload"}), 400
    update_fields = {}

    if "staff_id" in data:
        update_fields["staff_id"] = maybe_object_id(data.get("staff_id"))
    if "base_salary" in data:
        base_salary = parse_float_value(data.get("base_salary"))
        if base_salary is None:
            return jsonify({"msg": "base_salary must be a valid number"}), 400
        if base_salary < 0:
            return jsonify({"msg": "base_salary must be greater than or equal to 0"}), 400
        update_fields["base_salary"] = base_salary
    if "deductions" in data:
        deductions = parse_float_value(data.get("deductions"))
        if deductions is None:
            return jsonify({"msg": "deductions must be a valid number"}), 400
        if deductions < 0:
            return jsonify({"msg": "deductions must be greater than or equal to 0"}), 400
        update_fields["deductions"] = deductions
    if "net_pay" in data:
        net_pay = parse_float_value(data.get("net_pay"))
        if net_pay is None:
            return jsonify({"msg": "net_pay must be a valid number"}), 400
        if net_pay < 0:
            return jsonify({"msg": "net_pay must be greater than or equal to 0"}), 400
        update_fields["net_pay"] = net_pay
    if "month" in data:
        month_value = normalize_month(data.get("month"))
        if not month_value:
            return jsonify({"msg": "Invalid month. Use YYYY-MM"}), 400
        update_fields["month"] = month_value
    if "status" in data:
        normalized_status = _normalize_status(data.get("status"))
        if not normalized_status:
            return jsonify({"msg": "Invalid status. Use Paid or Pending"}), 400
        update_fields["status"] = normalized_status

    if not update_fields:
        return jsonify({"msg": "No updatable fields provided"}), 400

    update_fields["updated_at"] = datetime.now(timezone.utc)

    result = payroll_collection.update_one({"_id": object_id}, {"$set": update_fields})
    if result.matched_count == 0:
        return jsonify({"msg": "Payroll row not found"}), 404

    updated = payroll_collection.find_one({"_id": object_id})
    return jsonify(_serialize_payroll(updated)), 200


@payroll_bp.route("/<id>", methods=["DELETE"])
@role_required("admin", "finance")
def delete_payroll_row(id):
    object_id = parse_object_id(id)
    if not object_id:
        return jsonify({"msg": "Invalid payroll id"}), 400

    result = payroll_collection.delete_one({"_id": object_id})
    if result.deleted_count == 0:
        return jsonify({"msg": "Payroll row not found"}), 404

    return jsonify({"msg": "Payroll row deleted"}), 200
