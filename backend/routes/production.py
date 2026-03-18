from flask import Blueprint, request, jsonify
from utils.db import get_db
from utils.decorators import role_required
from flask_jwt_extended import jwt_required
from bson import ObjectId
from datetime import datetime

production_bp = Blueprint("production", __name__)
db = get_db()
batches_collection = db.batches

@production_bp.route("/board", methods=["GET"])
@jwt_required()
@role_required("operations", "admin")
def get_production_board():
    stages = ["Planned", "In Production", "QC", "Completed"]
    board = {stage: [] for stage in stages}
    
    batches = list(batches_collection.find())
    for batch in batches:
        stage = batch.get("stage", "Planned")
        if stage in board:
            board[stage].append(batch)
            
    return jsonify(board), 200

@production_bp.route("/batch", methods=["POST"])
@jwt_required()
@role_required("operations", "admin")
def create_batch():
    data = request.get_json()
    batch_id = data.get("batch_id")
    product_name = data.get("product_name")
    operator_name = data.get("operator_name")
    progress_percentage = int(data.get("progress_percentage", 0))

    if not batch_id or not product_name:
        return jsonify({"msg": "Missing batch_id or product_name"}), 400

    batch_data = {
        "batch_id": batch_id,
        "product_name": product_name,
        "stage": "Planned",
        "progress_percentage": progress_percentage,
        "operator_name": operator_name,
        "created_at": datetime.utcnow()
    }
    
    result = batches_collection.insert_one(batch_data)
    return jsonify({"msg": "Batch created", "id": str(result.inserted_id)}), 201

@production_bp.route("/batch/<id>/move", methods=["PATCH"])
@jwt_required()
@role_required("operations", "admin")
def move_batch(id):
    data = request.get_json()
    new_stage = data.get("new_stage")
    
    valid_stages = ["Planned", "In Production", "QC", "Completed"]
    if new_stage not in valid_stages:
        return jsonify({"msg": "Invalid stage"}), 400

    result = batches_collection.update_one(
        {"_id": ObjectId(id)},
        {"$set": {"stage": new_stage, "updated_at": datetime.utcnow()}}
    )
    
    if result.matched_count == 0:
        return jsonify({"msg": "Batch not found"}), 404
        
    return jsonify({"msg": f"Batch moved to {new_stage}"}), 200

@production_bp.route("/stats", methods=["GET"])
@jwt_required()
@role_required("operations", "admin")
def get_production_stats():
    active_stages = ["Planned", "In Production", "QC"]
    active_batches_count = batches_collection.count_documents({"stage": {"$in": active_stages}})
    
    # Mocking overall utilization for now as per prompt example
    stats = {
        "active_batches": active_batches_count,
        "overall_utilization": 78 # Example value
    }
    
    return jsonify(stats), 200
