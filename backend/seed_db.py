import os
from datetime import datetime, timedelta

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


def create_indexes():
    db["users"].create_index([("email", ASCENDING)], unique=True)
    db["products"].create_index([("sku", ASCENDING)], unique=True)
    db["invoices"].create_index([("invoice_number", ASCENDING)], unique=True)
    db["orders"].create_index([("order_id", ASCENDING)], unique=True)
    db["production_batches"].create_index([("batch_id", ASCENDING)], unique=True)
    db["settings"].create_index([("key", ASCENDING)], unique=True)


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
            "last_order_date": "2024-03-01",
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
            "last_order_date": "2024-03-03",
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
            "last_order_date": "2024-03-05",
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
            "last_order_date": "2024-03-07",
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
            "last_order_date": "2024-03-09",
            "rating": 4.6,
            "created_at": now,
            "updated_at": now,
        },
    ]
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
    db["suppliers"].insert_many(suppliers)
    print("Inserted suppliers")

    inventory_rows = [
        {
            "item_name": "Raw Coconut",
            "type": "Raw Material",
            "warehouse_location": "WH-A",
            "current_stock": 2500,
            "max_capacity": 5000,
            "expiry_date": "2026-06-15",
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
            "expiry_date": "2026-05-20",
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
            "expiry_date": "2027-03-01",
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
            "expiry_date": "2029-12-31",
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
            "expiry_date": "2029-12-31",
            "status": "Adequate",
            "created_at": now,
            "updated_at": now,
        },
    ]
    db["inventory"].insert_many(inventory_rows)
    print("Inserted inventory")

    orders = [
        {
            "_id": ObjectId(),
            "order_id": "ORD-2024-001",
            "client_id": clients[0]["_id"],
            "date": "2024-03-01",
            "total_items": 5,
            "total_amount": 45200.0,
            "status": "Processing",
            "created_at": now - timedelta(days=18),
            "updated_at": now - timedelta(days=17),
        },
        {
            "_id": ObjectId(),
            "order_id": "ORD-2024-002",
            "client_id": clients[1]["_id"],
            "date": "2024-03-03",
            "total_items": 3,
            "total_amount": 32800.0,
            "status": "Shipped",
            "created_at": now - timedelta(days=16),
            "updated_at": now - timedelta(days=15),
        },
        {
            "_id": ObjectId(),
            "order_id": "ORD-2024-003",
            "client_id": clients[2]["_id"],
            "date": "2024-03-05",
            "total_items": 8,
            "total_amount": 67500.0,
            "status": "Pending",
            "created_at": now - timedelta(days=14),
            "updated_at": now - timedelta(days=12),
        },
        {
            "_id": ObjectId(),
            "order_id": "ORD-2024-004",
            "client_id": clients[3]["_id"],
            "date": "2024-03-07",
            "total_items": 2,
            "total_amount": 28900.0,
            "status": "Delivered",
            "created_at": now - timedelta(days=12),
            "updated_at": now - timedelta(days=10),
        },
        {
            "_id": ObjectId(),
            "order_id": "ORD-2024-005",
            "client_id": clients[4]["_id"],
            "date": "2024-03-09",
            "total_items": 6,
            "total_amount": 54300.0,
            "status": "Processing",
            "created_at": now - timedelta(days=10),
            "updated_at": now - timedelta(days=9),
        },
    ]
    db["orders"].insert_many(orders)
    print("Inserted orders")

    invoices = [
        {
            "invoice_number": "INV-2024-001",
            "client_id": clients[0]["_id"],
            "date": "2024-03-01",
            "amount": 45200.0,
            "status": "Paid",
            "items": [
                {"description": "Cold Pressed Coconut Oil", "qty": 100, "unit_price": 452.0, "line_total": 45200.0}
            ],
            "created_at": now - timedelta(days=18),
            "updated_at": now - timedelta(days=17),
        },
        {
            "invoice_number": "INV-2024-002",
            "client_id": clients[1]["_id"],
            "date": "2024-03-05",
            "amount": 32800.0,
            "status": "Pending",
            "items": [
                {"description": "Virgin Sesame Oil", "qty": 80, "unit_price": 410.0, "line_total": 32800.0}
            ],
            "created_at": now - timedelta(days=14),
            "updated_at": now - timedelta(days=13),
        },
        {
            "invoice_number": "INV-2024-003",
            "client_id": clients[2]["_id"],
            "date": "2024-03-08",
            "amount": 67500.0,
            "status": "Overdue",
            "items": [
                {"description": "Organic Groundnut Oil", "qty": 150, "unit_price": 450.0, "line_total": 67500.0}
            ],
            "created_at": now - timedelta(days=12),
            "updated_at": now - timedelta(days=9),
        },
        {
            "invoice_number": "INV-2024-004",
            "client_id": clients[3]["_id"],
            "date": "2024-03-10",
            "amount": 28900.0,
            "status": "Paid",
            "items": [
                {"description": "Flaxseed Oil", "qty": 50, "unit_price": 578.0, "line_total": 28900.0}
            ],
            "created_at": now - timedelta(days=10),
            "updated_at": now - timedelta(days=8),
        },
        {
            "invoice_number": "INV-2024-005",
            "client_id": clients[4]["_id"],
            "date": "2024-03-12",
            "amount": 54300.0,
            "status": "Pending",
            "items": [
                {"description": "Black Sesame Oil", "qty": 90, "unit_price": 603.33, "line_total": 54300.0}
            ],
            "created_at": now - timedelta(days=8),
            "updated_at": now - timedelta(days=7),
        },
    ]
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
    db["payroll"].insert_many(payroll_rows)
    print("Inserted payroll")

    production_batches = [
        {
            "batch_id": "BATCH-001",
            "product_id": products[0]["_id"],
            "quantity": 500,
            "stage": "In Progress",
            "start_date": "2024-03-01",
            "end_date": "2024-03-04",
            "created_at": now - timedelta(days=18),
            "updated_at": now - timedelta(days=16),
        },
        {
            "batch_id": "BATCH-002",
            "product_id": products[1]["_id"],
            "quantity": 300,
            "stage": "In Progress",
            "start_date": "2024-03-02",
            "end_date": "2024-03-06",
            "created_at": now - timedelta(days=17),
            "updated_at": now - timedelta(days=14),
        },
        {
            "batch_id": "BATCH-003",
            "product_id": products[2]["_id"],
            "quantity": 450,
            "stage": "Completed",
            "start_date": "2024-02-28",
            "end_date": "2024-03-03",
            "created_at": now - timedelta(days=20),
            "updated_at": now - timedelta(days=15),
        },
        {
            "batch_id": "BATCH-004",
            "product_id": products[3]["_id"],
            "quantity": 200,
            "stage": "Planned",
            "start_date": "2024-03-05",
            "end_date": "2024-03-10",
            "created_at": now - timedelta(days=14),
            "updated_at": now - timedelta(days=12),
        },
        {
            "batch_id": "BATCH-005",
            "product_id": products[4]["_id"],
            "quantity": 380,
            "stage": "Planned",
            "start_date": "2024-03-08",
            "end_date": "2024-03-13",
            "created_at": now - timedelta(days=11),
            "updated_at": now - timedelta(days=10),
        },
    ]
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
            "message": "Order ORD-2024-003 for Rs 67,500 received.",
            "type": "success",
            "timestamp": now - timedelta(hours=1),
            "is_read": False,
            "created_at": now - timedelta(hours=1),
            "updated_at": now - timedelta(hours=1),
        },
        {
            "title": "Pending approval: Purchase Order PO-045",
            "message": "Rs 1,25,000 for raw coconut from AgroFresh Farms.",
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
