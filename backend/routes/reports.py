from flask import Blueprint, jsonify

from utils.db import get_db
from utils.decorators import admin_required

reports_bp = Blueprint("reports", __name__)
db = get_db()
orders_collection = db["orders"]


@reports_bp.route("/sales", methods=["GET"])
@admin_required
def get_sales_report():
    pipeline = [
        {
            "$group": {
                "_id": {"$substr": ["$date", 0, 7]},
                "sales": {"$sum": "$total_amount"},
            }
        },
        {"$sort": {"_id": 1}},
    ]

    month_map = {
        "01": "Jan",
        "02": "Feb",
        "03": "Mar",
        "04": "Apr",
        "05": "May",
        "06": "Jun",
        "07": "Jul",
        "08": "Aug",
        "09": "Sep",
        "10": "Oct",
        "11": "Nov",
        "12": "Dec",
    }

    rows = []
    for doc in orders_collection.aggregate(pipeline):
        year_month = doc.get("_id", "")
        month_token = year_month[-2:] if len(year_month) == 7 else ""
        month_label = month_map.get(month_token, year_month)
        rows.append({"month": month_label, "sales": round(float(doc.get("sales", 0.0)), 2)})

    return jsonify(rows), 200


@reports_bp.route("/production-efficiency", methods=["GET"])
@admin_required
def get_production_efficiency():
    efficiency_rows = [
        {"month": "Jan", "efficiency": 82},
        {"month": "Feb", "efficiency": 78},
        {"month": "Mar", "efficiency": 88},
        {"month": "Apr", "efficiency": 85},
        {"month": "May", "efficiency": 91},
        {"month": "Jun", "efficiency": 87},
    ]
    return jsonify(efficiency_rows), 200
