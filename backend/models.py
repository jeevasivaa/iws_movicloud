from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, EmailStr
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")

class MongoBaseModel(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

# --- User Model ---
class User(MongoBaseModel):
    name: str
    email: EmailStr
    password_hash: str
    role: str # admin, operations, finance, client
    company_name: Optional[str] = None
    gstin: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

# --- Product Model ---
class PackagingOption(BaseModel):
    type: str # Glass Bottle, Tetra Pack, etc.
    price_modifier: float

class Product(MongoBaseModel):
    name: str
    type: str # Liquid, Concentrate
    packaging_options: List[PackagingOption]
    base_price_per_unit: float

# --- Inventory Model ---
class InventoryItem(MongoBaseModel):
    sku: str
    name: str
    category: str # Raw Material, Finished Good, Packaging
    quantity_on_hand: int
    reorder_level: int
    status: str # In Stock, Low Stock, Depleted
    last_updated: datetime = Field(default_factory=datetime.utcnow)

# --- Production Model ---
class ProductionBatch(MongoBaseModel):
    batch_number: str
    product_id: PyObjectId
    assigned_to: Optional[PyObjectId] = None
    stage: str # Planned, In Production, QC, Completed
    progress_percentage: int = 0
    expected_completion: Optional[datetime] = None

# --- Order Model ---
class TimelineEvent(BaseModel):
    status: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class Order(MongoBaseModel):
    client_id: PyObjectId
    order_number: str
    total_amount: float
    status: str # New, Processing, Dispatched, Delivered
    timeline: List[TimelineEvent] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)

# --- Invoice Model ---
class InvoiceItem(BaseModel):
    description: str
    qty: int
    unit_price: float
    gst_rate: float
    total: float

class Invoice(MongoBaseModel):
    invoice_number: str
    order_id: PyObjectId
    client_id: PyObjectId
    line_items: List[InvoiceItem]
    subtotal: float
    cgst: float
    sgst: float
    grand_total: float
    status: str # Draft, Sent, Paid
    created_at: datetime = Field(default_factory=datetime.utcnow)
