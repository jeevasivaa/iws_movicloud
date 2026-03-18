from flask import Blueprint, jsonify
from utils.db import get_db
from datetime import datetime

analytics_bp = Blueprint("analytics", __name__)
db = get_db()

@analytics_bp.route("/kpi", methods=["GET"])
def get_kpi_metrics():
    # In a real app, these would be calculated using MongoDB aggregation pipelines.
    # For the MVP/Demo, we provide realistic representative data.
    metrics = {
        "total_revenue": 1250000.00,
        "avg_profit_margin": 24.5,
        "client_churn_rate": 2.1,
        "factory_downtime": "14h 20m"
    }
    return jsonify(metrics), 200

@analytics_bp.route("/insights", methods=["GET"])
def get_ai_insights():
    insights = [
        {
            "id": 1,
            "type": "Capacity Warning",
            "severity": "High",
            "message": "Production logs indicate a 15% overflow expected in Q3 due to increased Sparkling Water demand. Recommend shifting QC schedules."
        },
        {
            "id": 2,
            "type": "Procurement Optimization",
            "severity": "Medium",
            "message": "Raw material costs for PET preforms are trending 8% lower with Supplier B. Potential annual saving: $12,400."
        },
        {
            "id": 3,
            "type": "Predictive Maintenance",
            "severity": "Low",
            "message": "Line 4 motor vibration patterns suggest bearing wear. Schedule maintenance within 200 operating hours to avoid unplanned downtime."
        }
    ]
    return jsonify(insights), 200

@analytics_bp.route("/revenue-chart", methods=["GET"])
def get_revenue_chart():
    chart_data = [
        {"month": "Jan", "actual": 98000, "target": 100000},
        {"month": "Feb", "actual": 105000, "target": 100000},
        {"month": "Mar", "actual": 120000, "target": 110000},
        {"month": "Apr", "actual": 115000, "target": 110000},
        {"month": "May", "actual": 130000, "target": 120000},
        {"month": "Jun", "actual": 145000, "target": 120000}
    ]
    return jsonify(chart_data), 200
