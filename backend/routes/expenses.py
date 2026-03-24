from datetime import datetime

from flask import Blueprint, jsonify, request
from pymongo.errors import DuplicateKeyError  # type: ignore[import-untyped]

from utils.db import get_db
from utils.decorators import role_required
from utils.helpers import normalize_iso_date, parse_object_id, to_float

expenses_bp = Blueprint("expenses", __name__)
db = get_db()
expenses_collection = db["expenses"]


def _serialize_expense(expense):
    expense["_id"] = str(expense["_id"])
    return expense


def _is_valid_status(status):
    return status in {"Paid", "Pending"}


def _is_valid_category(category):
    return category in {
        "Raw Materials",
        "Utilities",
        "Logistics",
        "Maintenance",
        "Operations",
        "Compliance",
    }


@expenses_bp.route("", methods=["GET"])
@role_required("admin", "finance")
def get_expenses():
    rows = [
        _serialize_expense(row) for row in expenses_collection.find().sort("date", -1)
    ]
    return jsonify(rows), 200


@expenses_bp.route("/summary", methods=["GET"])
@role_required("admin", "finance")
def get_expense_summary():
    rows = list(expenses_collection.find())
    total_expenses = round(sum(to_float(row.get("amount")) for row in rows), 2)
    pending_payables = round(
        sum(
            to_float(row.get("amount"))
            for row in rows
            if row.get("status") == "Pending"
        ),
        2,
    )

    category_totals = {}
    for row in rows:
        category = str(row.get("category") or "").strip() or "Other"
        category_totals[category] = category_totals.get(category, 0.0) + to_float(
            row.get("amount")
        )

    largest_category = "Raw Materials"
    if category_totals:
        largest_category = max(category_totals, key=category_totals.get)

    return (
        jsonify(
            {
                "total_expenses": total_expenses,
                "pending_payables": pending_payables,
                "largest_category": largest_category,
            }
        ),
        200,
    )


@expenses_bp.route("", methods=["POST"])
@role_required("admin", "finance")
def create_expense():
    data = request.get_json() or {}
    required_fields = ["date", "category", "description", "amount", "status"]
    missing_fields = [
        field for field in required_fields if data.get(field) in [None, ""]
    ]
    if missing_fields:
        return jsonify(
            {"msg": f"Missing required fields: {', '.join(missing_fields)}"}
        ), 400

    category = str(data.get("category")).strip()
    status = str(data.get("status")).strip()
    if not _is_valid_category(category):
        return jsonify({"msg": "Invalid category"}), 400
    if not _is_valid_status(status):
        return jsonify({"msg": "Invalid status. Use Paid or Pending"}), 400

    payload = {
        "date": normalize_iso_date(data.get("date")),
        "category": category,
        "description": str(data.get("description")).strip(),
        "amount": round(to_float(data.get("amount")), 2),
        "status": status,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    try:
        result = expenses_collection.insert_one(payload)
    except DuplicateKeyError:
        return jsonify({"msg": "Expense already exists"}), 409

    created = expenses_collection.find_one({"_id": result.inserted_id})
    return jsonify(_serialize_expense(created)), 201


@expenses_bp.route("/<id>", methods=["PUT"])
@role_required("admin", "finance")
def update_expense(id):
    object_id = parse_object_id(id)
    if not object_id:
        return jsonify({"msg": "Invalid expense id"}), 400

    data = request.get_json() or {}
    update_fields = {}

    if "date" in data:
        update_fields["date"] = normalize_iso_date(data.get("date"))
    if "category" in data:
        category = str(data.get("category")).strip()
        if not _is_valid_category(category):
            return jsonify({"msg": "Invalid category"}), 400
        update_fields["category"] = category
    if "description" in data:
        update_fields["description"] = str(data.get("description")).strip()
    if "amount" in data:
        update_fields["amount"] = round(to_float(data.get("amount")), 2)
    if "status" in data:
        status = str(data.get("status")).strip()
        if not _is_valid_status(status):
            return jsonify({"msg": "Invalid status. Use Paid or Pending"}), 400
        update_fields["status"] = status

    if not update_fields:
        return jsonify({"msg": "No updatable fields provided"}), 400

    update_fields["updated_at"] = datetime.utcnow()

    result = expenses_collection.update_one({"_id": object_id}, {"$set": update_fields})
    if result.matched_count == 0:
        return jsonify({"msg": "Expense not found"}), 404

    updated = expenses_collection.find_one({"_id": object_id})
    return jsonify(_serialize_expense(updated)), 200


@expenses_bp.route("/<id>", methods=["DELETE"])
@role_required("admin", "finance")
def delete_expense(id):
    object_id = parse_object_id(id)
    if not object_id:
        return jsonify({"msg": "Invalid expense id"}), 400

    result = expenses_collection.delete_one({"_id": object_id})
    if result.deleted_count == 0:
        return jsonify({"msg": "Expense not found"}), 404

    return jsonify({"msg": "Expense deleted"}), 200
