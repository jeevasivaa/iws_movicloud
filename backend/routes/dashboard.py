from flask import Blueprint, jsonify

from utils.db import get_db
from utils.decorators import admin_required

dashboard_bp = Blueprint("dashboard", __name__)
db = get_db()


@dashboard_bp.route("/summary", methods=["GET"])
@admin_required
def get_dashboard_summary():
    orders_collection = db["orders"]
    users_collection = db["users"]
    inventory_collection = db["inventory"]

    pipeline = [{"$group": {"_id": None, "revenue": {"$sum": "$total_amount"}}}]
    revenue_doc = next(orders_collection.aggregate(pipeline), None)
    total_revenue = round(float(revenue_doc.get("revenue", 0.0)), 2) if revenue_doc else 0.0

    summary = {
        "total_revenue": total_revenue,
        "total_orders": orders_collection.count_documents({}),
        "active_staff": users_collection.count_documents({"status": "Active", "role": {"$ne": "client"}}),
        "low_stock_alerts": inventory_collection.count_documents({"status": {"$in": ["Low", "Critical"]}}),
    }

    return jsonify(summary), 200
