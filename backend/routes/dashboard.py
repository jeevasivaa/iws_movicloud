from flask import Blueprint, jsonify

from utils.db import get_db
from utils.decorators import role_required

dashboard_bp = Blueprint("dashboard", __name__)
db = get_db()


def _read_low_stock_threshold(default: int = 100) -> int:
    settings_collection = db["settings"]
    row = settings_collection.find_one({"key": "low_stock_threshold"})
    if not row:
        return default

    value = row.get("value")
    try:
        parsed = int(round(float(value)))
    except (TypeError, ValueError):
        return default

    return max(0, parsed)


@dashboard_bp.route("/summary", methods=["GET"])
@role_required("admin", "manager", "staff", "finance")
def get_dashboard_summary():
    orders_collection = db["orders"]
    users_collection = db["users"]
    inventory_collection = db["inventory"]
    low_stock_threshold = _read_low_stock_threshold()

    pipeline = [{"$group": {"_id": None, "revenue": {"$sum": "$total_amount"}}}]
    revenue_doc = next(orders_collection.aggregate(pipeline), None)
    total_revenue = round(float(revenue_doc.get("revenue", 0.0)), 2) if revenue_doc else 0.0

    summary = {
        "total_revenue": total_revenue,
        "total_orders": orders_collection.count_documents({}),
        "active_staff": users_collection.count_documents({"status": "Active", "role": {"$ne": "client"}}),
        "low_stock_alerts": inventory_collection.count_documents({"current_stock": {"$lte": low_stock_threshold}}),
        "low_stock_threshold": low_stock_threshold,
    }

    return jsonify(summary), 200
