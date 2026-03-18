from flask import Blueprint, request, jsonify
from utils.db import get_db
from datetime import datetime

finance_bp = Blueprint("finance", __name__)
db = get_db()
invoices_collection = db.invoices

@finance_bp.route("/invoice/calculate", methods=["POST"])
def calculate_invoice():
    data = request.get_json()
    items = data.get("items", [])
    
    subtotal = 0.0
    cgst_total = 0.0
    sgst_total = 0.0
    
    calculated_items = []
    
    for item in items:
        qty = float(item.get("qty", 0))
        unit_price = float(item.get("unit_price", 0))
        gst_rate = float(item.get("gst_rate", 0))
        
        line_total = qty * unit_price
        gst_amount = line_total * (gst_rate / 100)
        cgst = gst_amount / 2
        sgst = gst_amount / 2
        
        calculated_items.append({
            "description": item.get("description"),
            "qty": qty,
            "unit_price": unit_price,
            "gst_rate": gst_rate,
            "line_total": line_total,
            "cgst": cgst,
            "sgst": sgst
        })
        
        subtotal += line_total
        cgst_total += cgst
        sgst_total += sgst
        
    grand_total = subtotal + cgst_total + sgst_total
    
    return jsonify({
        "items": calculated_items,
        "subtotal": round(subtotal, 2),
        "cgst_amount": round(cgst_total, 2),
        "sgst_amount": round(sgst_total, 2),
        "grand_total": round(grand_total, 2)
    }), 200

@finance_bp.route("/invoice", methods=["POST"])
def create_invoice():
    data = request.get_json()
    
    # Required fields validation could be added here
    invoice_data = {
        "invoice_number": data.get("invoice_number"),
        "client_name": data.get("client_name"),
        "gstin": data.get("gstin"),
        "items": data.get("items"),
        "subtotal": data.get("subtotal"),
        "cgst_amount": data.get("cgst_amount"),
        "sgst_amount": data.get("sgst_amount"),
        "grand_total": data.get("grand_total"),
        "status": data.get("status", "Draft"),
        "created_at": datetime.utcnow()
    }
    
    result = invoices_collection.insert_one(invoice_data)
    return jsonify({"msg": "Invoice created", "id": str(result.inserted_id)}), 201

@finance_bp.route("/invoices", methods=["GET"])
def get_invoices():
    invoices = list(invoices_collection.find().sort("created_at", -1))
    return jsonify(invoices), 200
