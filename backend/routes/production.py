from datetime import datetime

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt  # type: ignore[import-untyped]
from pymongo.errors import DuplicateKeyError  # type: ignore[import-untyped]

from utils.db import get_db
from utils.decorators import admin_required, role_required
from utils.helpers import maybe_object_id, normalize_iso_date, parse_object_id, to_int

production_bp = Blueprint("production", __name__)
db = get_db()
production_collection = db["production_batches"]
products_collection = db["products"]
incidents_collection = db["production_incidents"]

STAGE_TRANSITIONS = {
    "Planned": "In Progress",
    "In Progress": "Completed",
}


def _serialize_batch(batch):
    batch["_id"] = str(batch["_id"])
    if batch.get("product_id") is not None:
        batch["product_id"] = str(batch["product_id"])
    if batch.get("staff_id") is not None:
        batch["staff_id"] = str(batch["staff_id"])
    return batch


def _serialize_batch_with_product(batch):
    payload = _serialize_batch(batch)
    product_name = "Tender Coconut Water"
    product_id = batch.get("product_id")
    if product_id is not None:
        product = products_collection.find_one({"_id": maybe_object_id(product_id)})
        if product and product.get("name"):
            product_name = str(product.get("name"))
    payload["product_name"] = product_name
    return payload


def _identity_variants(value):
    if value in [None, ""]:
        return []

    string_value = str(value).strip()
    if not string_value:
        return []

    variants: list[object] = [string_value]
    object_id = parse_object_id(string_value)
    if object_id:
        variants.append(object_id)
    return variants


def _validate_stage(stage):
    return stage in {"Planned", "In Progress", "Completed"}


@production_bp.route("", methods=["GET"])
@role_required("admin", "manager")
def get_batches():
    rows = [_serialize_batch_with_product(row) for row in production_collection.find().sort("start_date", -1)]
    return jsonify(rows), 200


@production_bp.route("/my-batches", methods=["GET"])
@role_required("admin", "manager", "staff")
def get_assigned_batches():
    claims = get_jwt()
    user_id = claims.get("user_id")
    variants = _identity_variants(user_id)

    if not variants:
        return jsonify([]), 200

    rows = [
        _serialize_batch_with_product(row)
        for row in production_collection.find({"staff_id": {"$in": variants}}).sort("start_date", 1)
    ]
    return jsonify(rows), 200


@production_bp.route("", methods=["POST"])
@role_required("admin", "manager")
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

    if data.get("staff_id") not in [None, ""]:
        payload["staff_id"] = maybe_object_id(data.get("staff_id"))

    try:
        result = production_collection.insert_one(payload)
    except DuplicateKeyError:
        return jsonify({"msg": "Batch id already exists"}), 409

    created = production_collection.find_one({"_id": result.inserted_id})
    return jsonify(_serialize_batch_with_product(created)), 201


@production_bp.route("/<id>", methods=["PUT"])
@role_required("admin", "manager")
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
    if "staff_id" in data:
        staff_id = data.get("staff_id")
        update_fields["staff_id"] = maybe_object_id(staff_id) if staff_id not in [None, ""] else None

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
    return jsonify(_serialize_batch_with_product(updated)), 200


@production_bp.route("/<id>/advance-stage", methods=["PATCH"])
@role_required("admin", "manager", "staff")
def advance_batch_stage(id):
    object_id = parse_object_id(id)
    if not object_id:
        return jsonify({"msg": "Invalid production id"}), 400

    batch = production_collection.find_one({"_id": object_id})
    if not batch:
        return jsonify({"msg": "Production batch not found"}), 404

    if batch.get("is_halted") is True:
        return jsonify({"msg": "Batch is halted. Resolve issue before advancing stage"}), 400

    claims = get_jwt()
    role = claims.get("role")
    if role == "staff":
        user_id = claims.get("user_id")
        variants = _identity_variants(user_id)
        assigned = batch.get("staff_id")
        if assigned is None or not variants or assigned not in variants:
            return jsonify({"msg": "You can only advance your assigned batches"}), 403

    current_stage = batch.get("stage") or "Planned"
    next_stage = STAGE_TRANSITIONS.get(current_stage)
    if not next_stage:
        return jsonify({"msg": "Batch is already completed"}), 400

    production_collection.update_one(
        {"_id": object_id},
        {
            "$set": {
                "stage": next_stage,
                "updated_at": datetime.utcnow(),
            }
        },
    )

    updated = production_collection.find_one({"_id": object_id})
    return jsonify(_serialize_batch_with_product(updated)), 200


@production_bp.route("/<id>/report-issue", methods=["PATCH"])
@role_required("admin", "manager", "staff")
def report_batch_issue(id):
    object_id = parse_object_id(id)
    if not object_id:
        return jsonify({"msg": "Invalid production id"}), 400

    batch = production_collection.find_one({"_id": object_id})
    if not batch:
        return jsonify({"msg": "Production batch not found"}), 404

    claims = get_jwt()
    role = claims.get("role")
    if role == "staff":
        user_id = claims.get("user_id")
        variants = _identity_variants(user_id)
        assigned = batch.get("staff_id")
        if assigned is None or not variants or assigned not in variants:
            return jsonify({"msg": "You can only report issues for your assigned batches"}), 403

    data = request.get_json() or {}
    issue = str(data.get("issue") or "").strip()
    if not issue:
        return jsonify({"msg": "Issue details are required"}), 400

    severity = str(data.get("severity") or "high").strip().lower()
    allowed_severities = {"low", "medium", "high", "critical"}
    if severity not in allowed_severities:
        severity = "high"

    now = datetime.utcnow()
    incidents_collection.insert_one(
        {
            "production_id": object_id,
            "batch_id": batch.get("batch_id"),
            "issue": issue,
            "severity": severity,
            "status": "Open",
            "reported_by": maybe_object_id(claims.get("user_id")),
            "reported_role": role,
            "created_at": now,
            "updated_at": now,
        }
    )

    production_collection.update_one(
        {"_id": object_id},
        {
            "$set": {
                "is_halted": True,
                "halt_reason": issue,
                "halted_at": now,
                "updated_at": now,
            }
        },
    )

    updated = production_collection.find_one({"_id": object_id})
    return jsonify(_serialize_batch_with_product(updated)), 200


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
