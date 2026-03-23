from datetime import datetime

from flask import Blueprint, jsonify, request
from pymongo.errors import DuplicateKeyError  # type: ignore[import-untyped]

from utils.db import get_db
from utils.decorators import admin_required
from utils.helpers import maybe_object_id, normalize_iso_date, parse_object_id, to_int

production_bp = Blueprint("production", __name__)
db = get_db()
production_collection = db["production_batches"]


def _serialize_batch(batch):
    batch["_id"] = str(batch["_id"])
    if batch.get("product_id") is not None:
        batch["product_id"] = str(batch["product_id"])
    return batch


def _validate_stage(stage):
    return stage in {"Planned", "In Progress", "Completed"}


@production_bp.route("", methods=["GET"])
@admin_required
def get_batches():
    rows = [_serialize_batch(row) for row in production_collection.find().sort("start_date", -1)]
    return jsonify(rows), 200


@production_bp.route("", methods=["POST"])
@admin_required
def create_batch():
    data = request.get_json() or {}
    required_fields = ["batch_id", "product_id", "quantity", "stage", "start_date", "end_date"]
    missing_fields = [field for field in required_fields if data.get(field) in [None, ""]]
    if missing_fields:
        return jsonify({"msg": f"Missing required fields: {', '.join(missing_fields)}"}), 400

    stage = data.get("stage")
    if not _validate_stage(stage):
        return jsonify({"msg": "Invalid stage. Use Planned, In Progress, or Completed"}), 400

    payload = {
        "batch_id": str(data.get("batch_id")).strip().upper(),
        "product_id": maybe_object_id(data.get("product_id")),
        "quantity": to_int(data.get("quantity")),
        "stage": stage,
        "start_date": normalize_iso_date(data.get("start_date")),
        "end_date": normalize_iso_date(data.get("end_date")),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    try:
        result = production_collection.insert_one(payload)
    except DuplicateKeyError:
        return jsonify({"msg": "Batch id already exists"}), 409

    created = production_collection.find_one({"_id": result.inserted_id})
    return jsonify(_serialize_batch(created)), 201


@production_bp.route("/<id>", methods=["PUT"])
@admin_required
def update_batch(id):
    object_id = parse_object_id(id)
    if not object_id:
        return jsonify({"msg": "Invalid production id"}), 400

    data = request.get_json() or {}
    update_fields = {}

    if "batch_id" in data:
        update_fields["batch_id"] = str(data.get("batch_id")).strip().upper()
    if "product_id" in data:
        update_fields["product_id"] = maybe_object_id(data.get("product_id"))
    if "quantity" in data:
        update_fields["quantity"] = to_int(data.get("quantity"))
    if "stage" in data:
        stage = data.get("stage")
        if not _validate_stage(stage):
            return jsonify({"msg": "Invalid stage. Use Planned, In Progress, or Completed"}), 400
        update_fields["stage"] = stage
    if "start_date" in data:
        update_fields["start_date"] = normalize_iso_date(data.get("start_date"))
    if "end_date" in data:
        update_fields["end_date"] = normalize_iso_date(data.get("end_date"))

    if not update_fields:
        return jsonify({"msg": "No updatable fields provided"}), 400

    update_fields["updated_at"] = datetime.utcnow()

    try:
        result = production_collection.update_one({"_id": object_id}, {"$set": update_fields})
    except DuplicateKeyError:
        return jsonify({"msg": "Batch id already exists"}), 409

    if result.matched_count == 0:
        return jsonify({"msg": "Production batch not found"}), 404

    updated = production_collection.find_one({"_id": object_id})
    return jsonify(_serialize_batch(updated)), 200


@production_bp.route("/<id>", methods=["DELETE"])
@admin_required
def delete_batch(id):
    object_id = parse_object_id(id)
    if not object_id:
        return jsonify({"msg": "Invalid production id"}), 400

    result = production_collection.delete_one({"_id": object_id})
    if result.deleted_count == 0:
        return jsonify({"msg": "Production batch not found"}), 404

    return jsonify({"msg": "Production batch deleted"}), 200
