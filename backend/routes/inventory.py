from flask import Blueprint, request, jsonify
from utils.db import get_db
from bson import ObjectId
from datetime import datetime

inventory_bp = Blueprint("inventory", __name__)
db = get_db()
inventory_collection = db.inventory

def get_inventory_status(stock, threshold):
    if stock <= 0:
        return "DEPLETED"
    elif stock < threshold:
        return "LOW STOCK"
    else:
        return "IN STOCK"

@inventory_bp.route("/", methods=["GET"])
def get_inventory():
    category = request.args.get("category")
    query = {}
    if category:
        query["category"] = category
    
    items = list(inventory_collection.find(query))
    return jsonify(items), 200

@inventory_bp.route("/", methods=["POST"])
def add_inventory_item():
    data = request.get_json()
    sku = data.get("sku")
    name = data.get("name")
    category = data.get("category")
    stock_on_hand = int(data.get("stock_on_hand", 0))
    reorder_threshold = int(data.get("reorder_threshold", 10))

    if not sku or not name or not category:
        return jsonify({"msg": "Missing required fields"}), 400

    status = get_inventory_status(stock_on_hand, reorder_threshold)
    
    item_data = {
        "sku": sku,
        "name": name,
        "category": category,
        "stock_on_hand": stock_on_hand,
        "reorder_threshold": reorder_threshold,
        "status": status,
        "last_updated": datetime.utcnow()
    }
    
    result = inventory_collection.insert_one(item_data)
    return jsonify({"msg": "Item added", "id": str(result.inserted_id)}), 201

@inventory_bp.route("/<id>", methods=["PUT"])
def update_inventory_stock(id):
    data = request.get_json()
    stock_on_hand = data.get("stock_on_hand")
    
    if stock_on_hand is None:
        return jsonify({"msg": "stock_on_hand is required"}), 400

    item = inventory_collection.find_one({"_id": ObjectId(id)})
    if not item:
        return jsonify({"msg": "Item not found"}), 404

    stock_on_hand = int(stock_on_hand)
    reorder_threshold = item.get("reorder_threshold", 10)
    status = get_inventory_status(stock_on_hand, reorder_threshold)
    
    inventory_collection.update_one(
        {"_id": ObjectId(id)},
        {"$set": {
            "stock_on_hand": stock_on_hand,
            "status": status,
            "last_updated": datetime.utcnow()
        }}
    )
    
    return jsonify({"msg": "Stock updated", "status": status}), 200

@inventory_bp.route("/alerts", methods=["GET"])
def get_inventory_alerts():
    query = {"status": {"$in": ["LOW STOCK", "DEPLETED"]}}
    items = list(inventory_collection.find(query))
    return jsonify(items), 200
