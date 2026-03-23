import calendar
import os
from datetime import date, datetime, timedelta

from bson import ObjectId  # type: ignore[import-untyped]
from dotenv import load_dotenv
from pymongo import ASCENDING, MongoClient  # type: ignore[import-untyped]
from pymongo.errors import ConfigurationError  # type: ignore[import-untyped]
from werkzeug.security import generate_password_hash

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"))

MONGO_URI = os.getenv("MONGO_URI")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "iws")

if not MONGO_URI:
    raise RuntimeError("MONGO_URI is required in backend/.env")

client = MongoClient(MONGO_URI)

try:
    db = client.get_default_database()
except ConfigurationError:
    db = client[MONGO_DB_NAME]

if db is None:
    db = client[MONGO_DB_NAME]


def _create_unique_non_empty_string_index(collection: str, field: str, name: str) -> None:
    db[collection].create_index(
        [(field, ASCENDING)],
        unique=True,
        name=name,
        partialFilterExpression={
            "$and": [
                {field: {"$type": "string"}},
                {field: {"$gt": ""}},
            ]
        },
    )


def create_indexes():
    _create_unique_non_empty_string_index("users", "email", "email_unique_non_empty")
    _create_unique_non_empty_string_index("products", "sku", "sku_unique_non_empty")
    _create_unique_non_empty_string_index("invoices", "invoice_number", "invoice_number_unique_non_empty")
    _create_unique_non_empty_string_index("orders", "order_id", "order_id_unique_non_empty")
    _create_unique_non_empty_string_index("production_batches", "batch_id", "batch_id_unique_non_empty")
    _create_unique_non_empty_string_index("settings", "key", "settings_key_unique_non_empty")


def seed_database():
    print("Starting VSA Foods admin database seeding...")

    collections = [
        "products",
        "suppliers",
        "users",
        "invoices",
        "payroll",
        "production_batches",
        "orders",
        "inventory",
        "clients",
        "notifications",
        "settings",
    ]

    for collection_name in collections:
        db[collection_name].drop()
        print(f"Dropped collection: {collection_name}")

    create_indexes()

    now = datetime.utcnow()
    current_month = now.strftime("%Y-%m")
    year_token = now.strftime("%Y")

    def year_month_from_delta(month_delta: int) -> tuple[int, int]:
        year = now.year
        month = now.month + month_delta

        while month > 12:
            month -= 12
            year += 1

        while month < 1:
            month += 12
            year -= 1

        return year, month

    def month_date(month_delta: int, day: int) -> str:
        year, month = year_month_from_delta(month_delta)

        max_day = calendar.monthrange(year, month)[1]
        return date(year, month, min(day, max_day)).isoformat()

    def month_datetime(month_delta: int, day: int, hour: int = 9) -> datetime:
        year, month = year_month_from_delta(month_delta)
        max_day = calendar.monthrange(year, month)[1]
        return datetime(year, month, min(day, max_day), hour, 0, 0)

    def days_from_now(day_offset: int) -> str:
        return (now + timedelta(days=day_offset)).date().isoformat()

    users = [
        {
            "_id": ObjectId(),
            "name": "Raj Kumar",
            "email": "admin@vsafoods.com",
            "password_hash": generate_password_hash("password123"),
            "role": "admin",
            "department": "Administration",
            "status": "Active",
            "created_at": now,
            "updated_at": now,
        },
        {
            "_id": ObjectId(),
            "name": "Vikram Singh",
            "email": "vikram@vsafoods.com",
            "password_hash": generate_password_hash("password123"),
            "role": "manager",
            "department": "Production",
            "status": "Active",
            "created_at": now,
            "updated_at": now,
        },
        {
            "_id": ObjectId(),
            "name": "Anita Desai",
            "email": "anita@vsafoods.com",
            "password_hash": generate_password_hash("password123"),
            "role": "staff",
            "department": "Quality",
            "status": "Active",
            "created_at": now,
            "updated_at": now,
        },
        {
            "_id": ObjectId(),
            "name": "Ravi Menon",
            "email": "ravi.finance@vsafoods.com",
            "password_hash": generate_password_hash("password123"),
            "role": "finance",
            "department": "Finance",
            "status": "Active",
            "created_at": now,
            "updated_at": now,
        },
        {
            "_id": ObjectId(),
            "name": "Nita Shah",
            "email": "nita@organichub.in",
            "password_hash": generate_password_hash("password123"),
            "role": "client",
            "department": "External",
            "status": "Active",
            "created_at": now,
            "updated_at": now,
        },
    ]
    db["users"].insert_many(users)
    print("Inserted users")

    clients = [
        {
            "_id": ObjectId(),
            "company_name": "FreshMart Stores",
            "contact_person": "Ramesh Gupta",
            "email": "ramesh@freshmart.in",
            "total_orders": 24,
            "last_order_date": month_date(0, 2),
            "rating": 4.8,
            "created_at": now,
            "updated_at": now,
        },
        {
            "_id": ObjectId(),
            "company_name": "Nature's Best Co.",
            "contact_person": "Lakshmi Iyer",
            "email": "lakshmi@naturesbest.in",
            "total_orders": 18,
            "last_order_date": month_date(0, 5),
            "rating": 4.5,
            "created_at": now,
            "updated_at": now,
        },
        {
            "_id": ObjectId(),
            "company_name": "Green Valley Foods",
            "contact_person": "Suresh Menon",
            "email": "suresh@greenvalley.in",
            "total_orders": 32,
            "last_order_date": month_date(0, 8),
            "rating": 4.9,
            "created_at": now,
            "updated_at": now,
        },
        {
            "_id": ObjectId(),
            "company_name": "Organic Hub",
            "contact_person": "Nita Shah",
            "email": "nita@organichub.in",
            "total_orders": 12,
            "last_order_date": month_date(0, 11),
            "rating": 4.3,
            "created_at": now,
            "updated_at": now,
        },
        {
            "_id": ObjectId(),
            "company_name": "HealthyLife Markets",
            "contact_person": "Ajay Verma",
            "email": "ajay@healthylife.in",
            "total_orders": 8,
            "last_order_date": month_date(0, 14),
            "rating": 4.6,
            "created_at": now,
            "updated_at": now,
        },
    ]
    clients.extend(
        [
            {
                "_id": ObjectId(),
                "company_name": "Urban Basket Retail",
                "contact_person": "Priya Nair",
                "email": "priya@urbanbasket.in",
                "total_orders": 14,
                "last_order_date": month_date(-1, 25),
                "rating": 4.4,
                "created_at": now,
                "updated_at": now,
            },
            {
                "_id": ObjectId(),
                "company_name": "Sunrise Gourmet",
                "contact_person": "Arun Bhat",
                "email": "arun@sunrisegourmet.in",
                "total_orders": 21,
                "last_order_date": month_date(-2, 16),
                "rating": 4.7,
                "created_at": now,
                "updated_at": now,
            },
            {
                "_id": ObjectId(),
                "company_name": "Metro Fresh Chain",
                "contact_person": "Meena Kapoor",
                "email": "meena@metrofresh.in",
                "total_orders": 27,
                "last_order_date": month_date(-1, 9),
                "rating": 4.5,
                "created_at": now,
                "updated_at": now,
            },
            {
                "_id": ObjectId(),
                "company_name": "Farm2Fork Collective",
                "contact_person": "Deepak Rao",
                "email": "deepak@farm2fork.in",
                "total_orders": 11,
                "last_order_date": month_date(-3, 27),
                "rating": 4.2,
                "created_at": now,
                "updated_at": now,
            },
            {
                "_id": ObjectId(),
                "company_name": "Daily Needs Hypermart",
                "contact_person": "Sonia Mathew",
                "email": "sonia@dailyneeds.in",
                "total_orders": 35,
                "last_order_date": month_date(0, 19),
                "rating": 4.9,
                "created_at": now,
                "updated_at": now,
            },
        ]
    )
    db["clients"].insert_many(clients)
    print("Inserted clients")

    products = [
        {
            "_id": ObjectId(),
            "name": "Cold Pressed Coconut Oil",
            "sku": "VSA-CO-001",
            "category": "Cold Pressed Oils",
            "price": 450.0,
            "stock": 320,
            "status": "Active",
            "created_at": now,
            "updated_at": now,
        },
        {
            "_id": ObjectId(),
            "name": "Virgin Sesame Oil",
            "sku": "VSA-SO-002",
            "category": "Cold Pressed Oils",
            "price": 380.0,
            "stock": 180,
            "status": "Active",
            "created_at": now,
            "updated_at": now,
        },
        {
            "_id": ObjectId(),
            "name": "Organic Groundnut Oil",
            "sku": "VSA-GO-003",
            "category": "Cold Pressed Oils",
            "price": 320.0,
            "stock": 45,
            "status": "Low Stock",
            "created_at": now,
            "updated_at": now,
        },
        {
            "_id": ObjectId(),
            "name": "Flaxseed Oil",
            "sku": "VSA-FL-004",
            "category": "Essential Oils",
            "price": 620.0,
            "stock": 0,
            "status": "Out of Stock",
            "created_at": now,
            "updated_at": now,
        },
        {
            "_id": ObjectId(),
            "name": "Black Sesame Oil",
            "sku": "VSA-BS-005",
            "category": "Essential Oils",
            "price": 510.0,
            "stock": 95,
            "status": "Active",
            "created_at": now,
            "updated_at": now,
        },
    ]
    products.extend(
        [
            {
                "_id": ObjectId(),
                "name": "Mustard Oil Premium",
                "sku": "VSA-MO-006",
                "category": "Cold Pressed Oils",
                "price": 360.0,
                "stock": 210,
                "status": "Active",
                "created_at": now,
                "updated_at": now,
            },
            {
                "_id": ObjectId(),
                "name": "Almond Oil Extra Virgin",
                "sku": "VSA-AO-007",
                "category": "Essential Oils",
                "price": 780.0,
                "stock": 52,
                "status": "Low Stock",
                "created_at": now,
                "updated_at": now,
            },
            {
                "_id": ObjectId(),
                "name": "Rice Bran Oil",
                "sku": "VSA-RB-008",
                "category": "Refined Oils",
                "price": 295.0,
                "stock": 430,
                "status": "Active",
                "created_at": now,
                "updated_at": now,
            },
            {
                "_id": ObjectId(),
                "name": "Sunflower Oil Classic",
                "sku": "VSA-SF-009",
                "category": "Refined Oils",
                "price": 270.0,
                "stock": 125,
                "status": "Active",
                "created_at": now,
                "updated_at": now,
            },
        ]
    )
    db["products"].insert_many(products)
    print("Inserted products")

    suppliers = [
        {
            "name": "AgroFresh Farms",
            "location": "Tamil Nadu",
            "category_supplied": "Coconut",
            "rating": 4.8,
            "total_orders": 156,
            "status": "Active",
            "created_at": now,
            "updated_at": now,
        },
        {
            "name": "Golden Seeds Corp",
            "location": "Gujarat",
            "category_supplied": "Groundnut",
            "rating": 4.5,
            "total_orders": 98,
            "status": "Active",
            "created_at": now,
            "updated_at": now,
        },
        {
            "name": "Nature's Harvest",
            "location": "Rajasthan",
            "category_supplied": "Sesame",
            "rating": 4.2,
            "total_orders": 72,
            "status": "Active",
            "created_at": now,
            "updated_at": now,
        },
        {
            "name": "PackRight Solutions",
            "location": "Maharashtra",
            "category_supplied": "Packaging",
            "rating": 4.6,
            "total_orders": 45,
            "status": "Under Review",
            "created_at": now,
            "updated_at": now,
        },
        {
            "name": "PureSeed Traders",
            "location": "Karnataka",
            "category_supplied": "Flaxseed",
            "rating": 3.9,
            "total_orders": 34,
            "status": "Inactive",
            "created_at": now,
            "updated_at": now,
        },
    ]
    suppliers.extend(
        [
            {
                "name": "South Coast Agro Oils",
                "location": "Kerala",
                "category_supplied": "Coconut",
                "rating": 4.4,
                "total_orders": 88,
                "status": "Active",
                "created_at": now,
                "updated_at": now,
            },
            {
                "name": "HarvestPulse Logistics",
                "location": "Telangana",
                "category_supplied": "Transportation",
                "rating": 4.1,
                "total_orders": 63,
                "status": "Under Review",
                "created_at": now,
                "updated_at": now,
            },
            {
                "name": "Evergreen Packaging Works",
                "location": "Madhya Pradesh",
                "category_supplied": "Packaging",
                "rating": 4.7,
                "total_orders": 104,
                "status": "Active",
                "created_at": now,
                "updated_at": now,
            },
        ]
    )
    db["suppliers"].insert_many(suppliers)
    print("Inserted suppliers")

    inventory_rows = [
        {
            "item_name": "Raw Coconut",
            "type": "Raw Material",
            "warehouse_location": "WH-A",
            "current_stock": 2500,
            "max_capacity": 5000,
            "expiry_date": days_from_now(120),
            "status": "Adequate",
            "created_at": now,
            "updated_at": now,
        },
        {
            "item_name": "Sesame Seeds",
            "type": "Raw Material",
            "warehouse_location": "WH-A",
            "current_stock": 800,
            "max_capacity": 3000,
            "expiry_date": days_from_now(90),
            "status": "Low",
            "created_at": now,
            "updated_at": now,
        },
        {
            "item_name": "Coconut Oil 500ml",
            "type": "Finished Product",
            "warehouse_location": "WH-B",
            "current_stock": 320,
            "max_capacity": 1000,
            "expiry_date": days_from_now(365),
            "status": "Low",
            "created_at": now,
            "updated_at": now,
        },
        {
            "item_name": "Glass Bottles 500ml",
            "type": "Packaging",
            "warehouse_location": "WH-C",
            "current_stock": 150,
            "max_capacity": 2000,
            "expiry_date": days_from_now(720),
            "status": "Critical",
            "created_at": now,
            "updated_at": now,
        },
        {
            "item_name": "Premium Labels",
            "type": "Packaging",
            "warehouse_location": "WH-C",
            "current_stock": 5000,
            "max_capacity": 12000,
            "expiry_date": days_from_now(900),
            "status": "Adequate",
            "created_at": now,
            "updated_at": now,
        },
    ]
    inventory_rows.extend(
        [
            {
                "item_name": "Groundnut Kernels",
                "type": "Raw Material",
                "warehouse_location": "WH-A",
                "current_stock": 1600,
                "max_capacity": 4000,
                "expiry_date": days_from_now(110),
                "status": "Adequate",
                "created_at": now,
                "updated_at": now,
            },
            {
                "item_name": "Flaxseed",
                "type": "Raw Material",
                "warehouse_location": "WH-A",
                "current_stock": 420,
                "max_capacity": 2500,
                "expiry_date": days_from_now(75),
                "status": "Low",
                "created_at": now,
                "updated_at": now,
            },
            {
                "item_name": "Sesame Oil 1L",
                "type": "Finished Product",
                "warehouse_location": "WH-B",
                "current_stock": 710,
                "max_capacity": 1400,
                "expiry_date": days_from_now(380),
                "status": "Adequate",
                "created_at": now,
                "updated_at": now,
            },
            {
                "item_name": "Groundnut Oil 1L",
                "type": "Finished Product",
                "warehouse_location": "WH-B",
                "current_stock": 120,
                "max_capacity": 1200,
                "expiry_date": days_from_now(320),
                "status": "Critical",
                "created_at": now,
                "updated_at": now,
            },
            {
                "item_name": "Shipping Cartons",
                "type": "Packaging",
                "warehouse_location": "WH-C",
                "current_stock": 2100,
                "max_capacity": 6000,
                "expiry_date": days_from_now(860),
                "status": "Adequate",
                "created_at": now,
                "updated_at": now,
            },
            {
                "item_name": "Safety Seals",
                "type": "Packaging",
                "warehouse_location": "WH-C",
                "current_stock": 260,
                "max_capacity": 3000,
                "expiry_date": days_from_now(700),
                "status": "Low",
                "created_at": now,
                "updated_at": now,
            },
            {
                "item_name": "Labels - Export Batch",
                "type": "Packaging",
                "warehouse_location": "WH-D",
                "current_stock": 140,
                "max_capacity": 2200,
                "expiry_date": days_from_now(540),
                "status": "Critical",
                "created_at": now,
                "updated_at": now,
            },
        ]
    )
    db["inventory"].insert_many(inventory_rows)
    print("Inserted inventory")

    orders = [
        {
            "_id": ObjectId(),
            "order_id": f"ORD-{year_token}-001",
            "client_id": clients[0]["_id"],
            "date": month_date(-4, 6),
            "total_items": 5,
            "total_amount": 45200.0,
            "status": "Processing",
            "created_at": now - timedelta(days=125),
            "updated_at": now - timedelta(days=124),
        },
        {
            "_id": ObjectId(),
            "order_id": f"ORD-{year_token}-002",
            "client_id": clients[1]["_id"],
            "date": month_date(-3, 10),
            "total_items": 3,
            "total_amount": 32800.0,
            "status": "Shipped",
            "created_at": now - timedelta(days=95),
            "updated_at": now - timedelta(days=94),
        },
        {
            "_id": ObjectId(),
            "order_id": f"ORD-{year_token}-003",
            "client_id": clients[2]["_id"],
            "date": month_date(-2, 14),
            "total_items": 8,
            "total_amount": 67500.0,
            "status": "Pending",
            "created_at": now - timedelta(days=65),
            "updated_at": now - timedelta(days=63),
        },
        {
            "_id": ObjectId(),
            "order_id": f"ORD-{year_token}-004",
            "client_id": clients[3]["_id"],
            "date": month_date(-1, 18),
            "total_items": 2,
            "total_amount": 28900.0,
            "status": "Delivered",
            "created_at": now - timedelta(days=35),
            "updated_at": now - timedelta(days=32),
        },
        {
            "_id": ObjectId(),
            "order_id": f"ORD-{year_token}-005",
            "client_id": clients[4]["_id"],
            "date": month_date(0, 8),
            "total_items": 6,
            "total_amount": 54300.0,
            "status": "Processing",
            "created_at": now - timedelta(days=12),
            "updated_at": now - timedelta(days=10),
        },
    ]
    orders.extend(
        [
            {
                "_id": ObjectId(),
                "order_id": f"ORD-{year_token}-006",
                "client_id": clients[5]["_id"],
                "date": month_date(-5, 7),
                "total_items": 9,
                "total_amount": 81200.0,
                "status": "Delivered",
                "created_at": month_datetime(-5, 7),
                "updated_at": month_datetime(-5, 8),
            },
            {
                "_id": ObjectId(),
                "order_id": f"ORD-{year_token}-007",
                "client_id": clients[6]["_id"],
                "date": month_date(-5, 22),
                "total_items": 4,
                "total_amount": 47400.0,
                "status": "Shipped",
                "created_at": month_datetime(-5, 22),
                "updated_at": month_datetime(-5, 23),
            },
            {
                "_id": ObjectId(),
                "order_id": f"ORD-{year_token}-008",
                "client_id": clients[7]["_id"],
                "date": month_date(-4, 11),
                "total_items": 7,
                "total_amount": 59800.0,
                "status": "Delivered",
                "created_at": month_datetime(-4, 11),
                "updated_at": month_datetime(-4, 12),
            },
            {
                "_id": ObjectId(),
                "order_id": f"ORD-{year_token}-009",
                "client_id": clients[8]["_id"],
                "date": month_date(-4, 24),
                "total_items": 3,
                "total_amount": 36250.0,
                "status": "Delivered",
                "created_at": month_datetime(-4, 24),
                "updated_at": month_datetime(-4, 25),
            },
            {
                "_id": ObjectId(),
                "order_id": f"ORD-{year_token}-010",
                "client_id": clients[9]["_id"],
                "date": month_date(-3, 6),
                "total_items": 10,
                "total_amount": 73400.0,
                "status": "Processing",
                "created_at": month_datetime(-3, 6),
                "updated_at": month_datetime(-3, 7),
            },
            {
                "_id": ObjectId(),
                "order_id": f"ORD-{year_token}-011",
                "client_id": clients[0]["_id"],
                "date": month_date(-3, 27),
                "total_items": 2,
                "total_amount": 28950.0,
                "status": "Shipped",
                "created_at": month_datetime(-3, 27),
                "updated_at": month_datetime(-3, 28),
            },
            {
                "_id": ObjectId(),
                "order_id": f"ORD-{year_token}-012",
                "client_id": clients[2]["_id"],
                "date": month_date(-2, 9),
                "total_items": 11,
                "total_amount": 91500.0,
                "status": "Delivered",
                "created_at": month_datetime(-2, 9),
                "updated_at": month_datetime(-2, 10),
            },
            {
                "_id": ObjectId(),
                "order_id": f"ORD-{year_token}-013",
                "client_id": clients[3]["_id"],
                "date": month_date(-2, 26),
                "total_items": 5,
                "total_amount": 44800.0,
                "status": "Processing",
                "created_at": month_datetime(-2, 26),
                "updated_at": month_datetime(-2, 27),
            },
            {
                "_id": ObjectId(),
                "order_id": f"ORD-{year_token}-014",
                "client_id": clients[4]["_id"],
                "date": month_date(-1, 12),
                "total_items": 4,
                "total_amount": 38200.0,
                "status": "Pending",
                "created_at": month_datetime(-1, 12),
                "updated_at": month_datetime(-1, 13),
            },
            {
                "_id": ObjectId(),
                "order_id": f"ORD-{year_token}-015",
                "client_id": clients[7]["_id"],
                "date": month_date(-1, 28),
                "total_items": 8,
                "total_amount": 67600.0,
                "status": "Delivered",
                "created_at": month_datetime(-1, 28),
                "updated_at": month_datetime(-1, 29),
            },
            {
                "_id": ObjectId(),
                "order_id": f"ORD-{year_token}-016",
                "client_id": clients[9]["_id"],
                "date": month_date(0, 5),
                "total_items": 7,
                "total_amount": 52900.0,
                "status": "Processing",
                "created_at": month_datetime(0, 5),
                "updated_at": month_datetime(0, 6),
            },
            {
                "_id": ObjectId(),
                "order_id": f"ORD-{year_token}-017",
                "client_id": clients[1]["_id"],
                "date": month_date(0, 17),
                "total_items": 6,
                "total_amount": 41800.0,
                "status": "Pending",
                "created_at": month_datetime(0, 17),
                "updated_at": month_datetime(0, 18),
            },
        ]
    )
    db["orders"].insert_many(orders)
    print("Inserted orders")

    invoices = [
        {
            "invoice_number": f"INV-{year_token}-001",
            "client_id": clients[0]["_id"],
            "date": orders[0]["date"],
            "amount": 45200.0,
            "status": "Paid",
            "items": [
                {"description": "Cold Pressed Coconut Oil", "qty": 100, "unit_price": 452.0, "line_total": 45200.0}
            ],
            "created_at": now - timedelta(days=124),
            "updated_at": now - timedelta(days=123),
        },
        {
            "invoice_number": f"INV-{year_token}-002",
            "client_id": clients[1]["_id"],
            "date": orders[1]["date"],
            "amount": 32800.0,
            "status": "Pending",
            "items": [
                {"description": "Virgin Sesame Oil", "qty": 80, "unit_price": 410.0, "line_total": 32800.0}
            ],
            "created_at": now - timedelta(days=93),
            "updated_at": now - timedelta(days=92),
        },
        {
            "invoice_number": f"INV-{year_token}-003",
            "client_id": clients[2]["_id"],
            "date": orders[2]["date"],
            "amount": 67500.0,
            "status": "Overdue",
            "items": [
                {"description": "Organic Groundnut Oil", "qty": 150, "unit_price": 450.0, "line_total": 67500.0}
            ],
            "created_at": now - timedelta(days=62),
            "updated_at": now - timedelta(days=60),
        },
        {
            "invoice_number": f"INV-{year_token}-004",
            "client_id": clients[3]["_id"],
            "date": orders[3]["date"],
            "amount": 28900.0,
            "status": "Paid",
            "items": [
                {"description": "Flaxseed Oil", "qty": 50, "unit_price": 578.0, "line_total": 28900.0}
            ],
            "created_at": now - timedelta(days=31),
            "updated_at": now - timedelta(days=29),
        },
        {
            "invoice_number": f"INV-{year_token}-005",
            "client_id": clients[4]["_id"],
            "date": orders[4]["date"],
            "amount": 54300.0,
            "status": "Pending",
            "items": [
                {"description": "Black Sesame Oil", "qty": 90, "unit_price": 603.33, "line_total": 54300.0}
            ],
            "created_at": now - timedelta(days=8),
            "updated_at": now - timedelta(days=7),
        },
    ]
    invoices.extend(
        [
            {
                "invoice_number": f"INV-{year_token}-006",
                "client_id": orders[5]["client_id"],
                "date": orders[5]["date"],
                "amount": 81200.0,
                "status": "Paid",
                "items": [
                    {"description": "Mustard Oil Premium", "qty": 140, "unit_price": 580.0, "line_total": 81200.0}
                ],
                "created_at": month_datetime(-5, 8),
                "updated_at": month_datetime(-5, 9),
            },
            {
                "invoice_number": f"INV-{year_token}-007",
                "client_id": orders[6]["client_id"],
                "date": orders[6]["date"],
                "amount": 47400.0,
                "status": "Paid",
                "items": [
                    {"description": "Sunflower Oil Classic", "qty": 120, "unit_price": 395.0, "line_total": 47400.0}
                ],
                "created_at": month_datetime(-5, 23),
                "updated_at": month_datetime(-5, 24),
            },
            {
                "invoice_number": f"INV-{year_token}-008",
                "client_id": orders[7]["client_id"],
                "date": orders[7]["date"],
                "amount": 59800.0,
                "status": "Paid",
                "items": [
                    {"description": "Rice Bran Oil", "qty": 200, "unit_price": 299.0, "line_total": 59800.0}
                ],
                "created_at": month_datetime(-4, 12),
                "updated_at": month_datetime(-4, 13),
            },
            {
                "invoice_number": f"INV-{year_token}-009",
                "client_id": orders[8]["client_id"],
                "date": orders[8]["date"],
                "amount": 36250.0,
                "status": "Paid",
                "items": [
                    {"description": "Virgin Sesame Oil", "qty": 95, "unit_price": 381.58, "line_total": 36250.0}
                ],
                "created_at": month_datetime(-4, 25),
                "updated_at": month_datetime(-4, 26),
            },
            {
                "invoice_number": f"INV-{year_token}-010",
                "client_id": orders[9]["client_id"],
                "date": orders[9]["date"],
                "amount": 73400.0,
                "status": "Pending",
                "items": [
                    {"description": "Cold Pressed Coconut Oil", "qty": 160, "unit_price": 458.75, "line_total": 73400.0}
                ],
                "created_at": month_datetime(-3, 7),
                "updated_at": month_datetime(-3, 8),
            },
            {
                "invoice_number": f"INV-{year_token}-011",
                "client_id": orders[10]["client_id"],
                "date": orders[10]["date"],
                "amount": 28950.0,
                "status": "Paid",
                "items": [
                    {"description": "Flaxseed Oil", "qty": 45, "unit_price": 643.33, "line_total": 28950.0}
                ],
                "created_at": month_datetime(-3, 28),
                "updated_at": month_datetime(-3, 29),
            },
            {
                "invoice_number": f"INV-{year_token}-012",
                "client_id": orders[11]["client_id"],
                "date": orders[11]["date"],
                "amount": 91500.0,
                "status": "Paid",
                "items": [
                    {"description": "Almond Oil Extra Virgin", "qty": 150, "unit_price": 610.0, "line_total": 91500.0}
                ],
                "created_at": month_datetime(-2, 10),
                "updated_at": month_datetime(-2, 11),
            },
            {
                "invoice_number": f"INV-{year_token}-013",
                "client_id": orders[12]["client_id"],
                "date": orders[12]["date"],
                "amount": 44800.0,
                "status": "Overdue",
                "items": [
                    {"description": "Groundnut Oil 1L", "qty": 140, "unit_price": 320.0, "line_total": 44800.0}
                ],
                "created_at": month_datetime(-2, 27),
                "updated_at": month_datetime(-2, 28),
            },
            {
                "invoice_number": f"INV-{year_token}-014",
                "client_id": orders[13]["client_id"],
                "date": orders[13]["date"],
                "amount": 38200.0,
                "status": "Pending",
                "items": [
                    {"description": "Sesame Oil 1L", "qty": 100, "unit_price": 382.0, "line_total": 38200.0}
                ],
                "created_at": month_datetime(-1, 13),
                "updated_at": month_datetime(-1, 14),
            },
            {
                "invoice_number": f"INV-{year_token}-015",
                "client_id": orders[14]["client_id"],
                "date": orders[14]["date"],
                "amount": 67600.0,
                "status": "Paid",
                "items": [
                    {"description": "Mustard Oil Premium", "qty": 130, "unit_price": 520.0, "line_total": 67600.0}
                ],
                "created_at": month_datetime(-1, 29),
                "updated_at": month_datetime(-1, 30),
            },
            {
                "invoice_number": f"INV-{year_token}-016",
                "client_id": orders[15]["client_id"],
                "date": orders[15]["date"],
                "amount": 52900.0,
                "status": "Pending",
                "items": [
                    {"description": "Rice Bran Oil", "qty": 170, "unit_price": 311.18, "line_total": 52900.0}
                ],
                "created_at": month_datetime(0, 6),
                "updated_at": month_datetime(0, 7),
            },
        ]
    )
    db["invoices"].insert_many(invoices)
    print("Inserted invoices")

    payroll_rows = [
        {
            "staff_id": users[1]["_id"],
            "base_salary": 35000.0,
            "deductions": 3500.0,
            "net_pay": 31500.0,
            "month": current_month,
            "status": "Paid",
            "created_at": now,
            "updated_at": now,
        },
        {
            "staff_id": users[2]["_id"],
            "base_salary": 28000.0,
            "deductions": 2800.0,
            "net_pay": 25200.0,
            "month": current_month,
            "status": "Paid",
            "created_at": now,
            "updated_at": now,
        },
        {
            "staff_id": users[3]["_id"],
            "base_salary": 32000.0,
            "deductions": 3200.0,
            "net_pay": 28800.0,
            "month": current_month,
            "status": "Pending",
            "created_at": now,
            "updated_at": now,
        },
        {
            "staff_id": users[0]["_id"],
            "base_salary": 22000.0,
            "deductions": 2200.0,
            "net_pay": 19800.0,
            "month": current_month,
            "status": "Paid",
            "created_at": now,
            "updated_at": now,
        },
        {
            "staff_id": users[1]["_id"],
            "base_salary": 26000.0,
            "deductions": 2600.0,
            "net_pay": 23400.0,
            "month": current_month,
            "status": "Pending",
            "created_at": now,
            "updated_at": now,
        },
    ]
    payroll_rows.extend(
        [
            {
                "staff_id": users[1]["_id"],
                "base_salary": 35000.0,
                "deductions": 3600.0,
                "net_pay": 31400.0,
                "month": month_datetime(-1, 1).strftime("%Y-%m"),
                "status": "Paid",
                "created_at": month_datetime(-1, 2),
                "updated_at": month_datetime(-1, 2),
            },
            {
                "staff_id": users[2]["_id"],
                "base_salary": 28000.0,
                "deductions": 2700.0,
                "net_pay": 25300.0,
                "month": month_datetime(-1, 1).strftime("%Y-%m"),
                "status": "Paid",
                "created_at": month_datetime(-1, 2),
                "updated_at": month_datetime(-1, 2),
            },
            {
                "staff_id": users[3]["_id"],
                "base_salary": 32000.0,
                "deductions": 3100.0,
                "net_pay": 28900.0,
                "month": month_datetime(-1, 1).strftime("%Y-%m"),
                "status": "Paid",
                "created_at": month_datetime(-1, 2),
                "updated_at": month_datetime(-1, 2),
            },
            {
                "staff_id": users[1]["_id"],
                "base_salary": 35000.0,
                "deductions": 3500.0,
                "net_pay": 31500.0,
                "month": month_datetime(-2, 1).strftime("%Y-%m"),
                "status": "Paid",
                "created_at": month_datetime(-2, 2),
                "updated_at": month_datetime(-2, 2),
            },
            {
                "staff_id": users[2]["_id"],
                "base_salary": 28000.0,
                "deductions": 2800.0,
                "net_pay": 25200.0,
                "month": month_datetime(-2, 1).strftime("%Y-%m"),
                "status": "Pending",
                "created_at": month_datetime(-2, 2),
                "updated_at": month_datetime(-2, 2),
            },
            {
                "staff_id": users[0]["_id"],
                "base_salary": 22000.0,
                "deductions": 2200.0,
                "net_pay": 19800.0,
                "month": month_datetime(-2, 1).strftime("%Y-%m"),
                "status": "Paid",
                "created_at": month_datetime(-2, 2),
                "updated_at": month_datetime(-2, 2),
            },
        ]
    )
    db["payroll"].insert_many(payroll_rows)
    print("Inserted payroll")

    production_batches = [
        {
            "batch_id": "BATCH-001",
            "product_id": products[0]["_id"],
            "quantity": 500,
            "stage": "In Progress",
            "start_date": days_from_now(-6),
            "end_date": days_from_now(2),
            "created_at": now - timedelta(days=18),
            "updated_at": now - timedelta(days=16),
        },
        {
            "batch_id": "BATCH-002",
            "product_id": products[1]["_id"],
            "quantity": 300,
            "stage": "In Progress",
            "start_date": days_from_now(-4),
            "end_date": days_from_now(3),
            "created_at": now - timedelta(days=17),
            "updated_at": now - timedelta(days=14),
        },
        {
            "batch_id": "BATCH-003",
            "product_id": products[2]["_id"],
            "quantity": 450,
            "stage": "Completed",
            "start_date": days_from_now(-20),
            "end_date": days_from_now(-15),
            "created_at": now - timedelta(days=20),
            "updated_at": now - timedelta(days=15),
        },
        {
            "batch_id": "BATCH-004",
            "product_id": products[3]["_id"],
            "quantity": 200,
            "stage": "Planned",
            "start_date": days_from_now(4),
            "end_date": days_from_now(10),
            "created_at": now - timedelta(days=14),
            "updated_at": now - timedelta(days=12),
        },
        {
            "batch_id": "BATCH-005",
            "product_id": products[4]["_id"],
            "quantity": 380,
            "stage": "Planned",
            "start_date": days_from_now(7),
            "end_date": days_from_now(13),
            "created_at": now - timedelta(days=11),
            "updated_at": now - timedelta(days=10),
        },
    ]
    production_batches.extend(
        [
            {
                "batch_id": "BATCH-006",
                "product_id": products[5]["_id"],
                "quantity": 420,
                "stage": "Completed",
                "start_date": month_date(-5, 5),
                "end_date": month_date(-5, 11),
                "created_at": month_datetime(-5, 5),
                "updated_at": month_datetime(-5, 11),
            },
            {
                "batch_id": "BATCH-007",
                "product_id": products[6]["_id"],
                "quantity": 260,
                "stage": "Completed",
                "start_date": month_date(-5, 16),
                "end_date": month_date(-5, 23),
                "created_at": month_datetime(-5, 16),
                "updated_at": month_datetime(-5, 23),
            },
            {
                "batch_id": "BATCH-008",
                "product_id": products[7]["_id"],
                "quantity": 610,
                "stage": "Completed",
                "start_date": month_date(-4, 4),
                "end_date": month_date(-4, 13),
                "created_at": month_datetime(-4, 4),
                "updated_at": month_datetime(-4, 13),
            },
            {
                "batch_id": "BATCH-009",
                "product_id": products[8]["_id"],
                "quantity": 540,
                "stage": "Completed",
                "start_date": month_date(-4, 18),
                "end_date": month_date(-4, 25),
                "created_at": month_datetime(-4, 18),
                "updated_at": month_datetime(-4, 25),
            },
            {
                "batch_id": "BATCH-010",
                "product_id": products[0]["_id"],
                "quantity": 700,
                "stage": "In Progress",
                "start_date": month_date(-3, 3),
                "end_date": month_date(-3, 12),
                "created_at": month_datetime(-3, 3),
                "updated_at": month_datetime(-3, 8),
            },
            {
                "batch_id": "BATCH-011",
                "product_id": products[1]["_id"],
                "quantity": 500,
                "stage": "Completed",
                "start_date": month_date(-3, 14),
                "end_date": month_date(-3, 20),
                "created_at": month_datetime(-3, 14),
                "updated_at": month_datetime(-3, 20),
            },
            {
                "batch_id": "BATCH-012",
                "product_id": products[2]["_id"],
                "quantity": 450,
                "stage": "Completed",
                "start_date": month_date(-2, 6),
                "end_date": month_date(-2, 13),
                "created_at": month_datetime(-2, 6),
                "updated_at": month_datetime(-2, 13),
            },
            {
                "batch_id": "BATCH-013",
                "product_id": products[6]["_id"],
                "quantity": 330,
                "stage": "In Progress",
                "start_date": month_date(-2, 18),
                "end_date": month_date(-2, 26),
                "created_at": month_datetime(-2, 18),
                "updated_at": month_datetime(-2, 23),
            },
            {
                "batch_id": "BATCH-014",
                "product_id": products[8]["_id"],
                "quantity": 610,
                "stage": "Completed",
                "start_date": month_date(-1, 7),
                "end_date": month_date(-1, 15),
                "created_at": month_datetime(-1, 7),
                "updated_at": month_datetime(-1, 15),
            },
            {
                "batch_id": "BATCH-015",
                "product_id": products[5]["_id"],
                "quantity": 390,
                "stage": "Planned",
                "start_date": month_date(0, 24),
                "end_date": month_date(0, 30),
                "created_at": month_datetime(0, 20),
                "updated_at": month_datetime(0, 20),
            },
        ]
    )
    db["production_batches"].insert_many(production_batches)
    print("Inserted production batches")

    notifications = [
        {
            "title": "Low stock: Glass Bottles 500ml",
            "message": "Only 150 units remaining. Reorder recommended.",
            "type": "alert",
            "timestamp": now - timedelta(minutes=5),
            "is_read": False,
            "created_at": now - timedelta(minutes=5),
            "updated_at": now - timedelta(minutes=5),
        },
        {
            "title": "Batch BATCH-003 nearing completion",
            "message": "Organic Groundnut Oil packaging is 90% complete.",
            "type": "info",
            "timestamp": now - timedelta(minutes=15),
            "is_read": False,
            "created_at": now - timedelta(minutes=15),
            "updated_at": now - timedelta(minutes=15),
        },
        {
            "title": "New order from Green Valley Foods",
            "message": f"Order {orders[2]['order_id']} for ₹67,500 received.",
            "type": "success",
            "timestamp": now - timedelta(hours=1),
            "is_read": False,
            "created_at": now - timedelta(hours=1),
            "updated_at": now - timedelta(hours=1),
        },
        {
            "title": "Pending approval: Purchase Order PO-045",
            "message": "₹1,25,000 for raw coconut from AgroFresh Farms.",
            "type": "warning",
            "timestamp": now - timedelta(hours=2),
            "is_read": True,
            "created_at": now - timedelta(hours=2),
            "updated_at": now - timedelta(hours=2),
        },
        {
            "title": "Payroll processed for current month",
            "message": "3 of 5 employees have been paid.",
            "type": "success",
            "timestamp": now - timedelta(hours=3),
            "is_read": True,
            "created_at": now - timedelta(hours=3),
            "updated_at": now - timedelta(hours=3),
        },
    ]
    notifications.extend(
        [
            {
                "title": "Dispatch delayed: ORD-" + year_token + "-010",
                "message": "Truck allocation delayed due to weather. Revised dispatch ETA: +6 hours.",
                "type": "warning",
                "timestamp": now - timedelta(hours=4),
                "is_read": False,
                "created_at": now - timedelta(hours=4),
                "updated_at": now - timedelta(hours=4),
            },
            {
                "title": "High demand alert: Almond Oil",
                "message": "Current week demand is 22% above baseline. Plan additional production batch.",
                "type": "info",
                "timestamp": now - timedelta(hours=6),
                "is_read": False,
                "created_at": now - timedelta(hours=6),
                "updated_at": now - timedelta(hours=6),
            },
            {
                "title": "Invoice overdue reminder sent",
                "message": f"Auto-reminder sent for invoice INV-{year_token}-013.",
                "type": "alert",
                "timestamp": now - timedelta(hours=9),
                "is_read": True,
                "created_at": now - timedelta(hours=9),
                "updated_at": now - timedelta(hours=9),
            },
            {
                "title": "Supplier rating updated",
                "message": "Evergreen Packaging Works moved to preferred supplier tier.",
                "type": "success",
                "timestamp": now - timedelta(hours=12),
                "is_read": True,
                "created_at": now - timedelta(hours=12),
                "updated_at": now - timedelta(hours=12),
            },
            {
                "title": "Critical stock: Labels - Export Batch",
                "message": "Only 140 units left in WH-D. Urgent replenishment required.",
                "type": "alert",
                "timestamp": now - timedelta(hours=16),
                "is_read": False,
                "created_at": now - timedelta(hours=16),
                "updated_at": now - timedelta(hours=16),
            },
        ]
    )
    db["notifications"].insert_many(notifications)
    print("Inserted notifications")

    settings = [
        {"key": "low_stock_alerts", "value": True, "created_at": now, "updated_at": now},
        {"key": "production_updates", "value": True, "created_at": now, "updated_at": now},
        {"key": "new_order_notifications", "value": True, "created_at": now, "updated_at": now},
        {"key": "payroll_reminders", "value": True, "created_at": now, "updated_at": now},
        {"key": "reporting_timezone", "value": "Asia/Kolkata", "created_at": now, "updated_at": now},
    ]
    db["settings"].insert_many(settings)
    print("Inserted settings")

    print("Seeding completed successfully.")


if __name__ == "__main__":
    seed_database()
