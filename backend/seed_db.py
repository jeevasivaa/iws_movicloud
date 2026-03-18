import os
from datetime import datetime, timedelta
from pymongo import MongoClient
from werkzeug.security import generate_password_hash
from dotenv import load_dotenv
from bson import ObjectId

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    print("Error: MONGO_URI not found in .env file")
    exit(1)

client = MongoClient(MONGO_URI)
db = client.get_default_database()

def seed_database():
    print("🚀 Starting Database Seeding...")

    # 1. Wipe Collections
    collections = ["users", "products", "inventory", "batches", "orders", "invoices"]
    for coll in collections:
        db[coll].delete_many({})
        print(f"🧹 Wiped collection: {coll}")

    # 2. Seed Users
    password_hash = generate_password_hash("password123")
    users = [
        {
            "_id": ObjectId(),
            "name": "Priya Nair",
            "email": "admin@vsabeverages.com",
            "password_hash": password_hash,
            "role": "admin",
            "company_name": "VSA Beverages HQ",
            "gstin": "29AAAAA0000A1Z5",
            "created_at": datetime.utcnow()
        },
        {
            "_id": ObjectId(),
            "name": "Alex Thompson",
            "email": "operations@vsabeverages.com",
            "password_hash": password_hash,
            "role": "operations",
            "created_at": datetime.utcnow()
        },
        {
            "_id": ObjectId(),
            "name": "Liam Carter",
            "email": "finance@vsabeverages.com",
            "password_hash": password_hash,
            "role": "finance",
            "created_at": datetime.utcnow()
        },
        {
            "_id": ObjectId(),
            "name": "Bistro Group",
            "email": "contact@bistro.com",
            "password_hash": password_hash,
            "role": "client",
            "company_name": "The Bistro Group",
            "gstin": "27BBBBB1111B2Z6",
            "created_at": datetime.utcnow()
        }
    ]
    db.users.insert_many(users)
    print("✅ Inserted Users")
    
    admin_id = users[0]["_id"]
    client_id = users[3]["_id"]

    # 3. Seed Products
    products = [
        {
            "_id": ObjectId(),
            "name": "Tender Coconut Water",
            "type": "Liquid",
            "packaging_options": [
                {"type": "Glass Bottle 250ml", "price_modifier": 0},
                {"type": "Tetra Pack 200ml", "price_modifier": -5}
            ],
            "base_price_per_unit": 45.0
        },
        {
            "_id": ObjectId(),
            "name": "Mango Concentrate",
            "type": "Concentrate",
            "packaging_options": [
                {"type": "HDPE Carboy 5L", "price_modifier": 0},
                {"type": "Bulk Drum 200L", "price_modifier": -200}
            ],
            "base_price_per_unit": 850.0
        },
        {
            "_id": ObjectId(),
            "name": "Eco-friendly Tetra Packs",
            "type": "Packaging Material",
            "packaging_options": [],
            "base_price_per_unit": 2.5
        }
    ]
    db.products.insert_many(products)
    print("✅ Inserted Products")
    
    product_id = products[0]["_id"]

    # 4. Seed Inventory
    inventory = [
        {
            "sku": "RAW-COCO-001",
            "name": "Organic Tender Coconut",
            "category": "Raw Material",
            "quantity_on_hand": 5000,
            "reorder_level": 1000,
            "status": "In Stock",
            "last_updated": datetime.utcnow()
        },
        {
            "sku": "PKG-GLS-250",
            "name": "Glass Bottle 250ml",
            "category": "Packaging",
            "quantity_on_hand": 85,
            "reorder_level": 500,
            "status": "Low Stock",
            "last_updated": datetime.utcnow()
        },
        {
            "sku": "PKG-LBL-ORG",
            "name": "Organic Labels",
            "category": "Packaging",
            "quantity_on_hand": 12000,
            "reorder_level": 2000,
            "status": "In Stock",
            "last_updated": datetime.utcnow()
        },
        {
            "sku": "FIN-TCW-250",
            "name": "TCW 250ml Finished",
            "category": "Finished Good",
            "quantity_on_hand": 0,
            "reorder_level": 100,
            "status": "Depleted",
            "last_updated": datetime.utcnow()
        },
        {
            "sku": "RAW-SUG-010",
            "name": "Industrial Sugar",
            "category": "Raw Material",
            "quantity_on_hand": 450,
            "reorder_level": 500,
            "status": "Low Stock",
            "last_updated": datetime.utcnow()
        }
    ]
    db.inventory.insert_many(inventory)
    print("✅ Inserted Inventory")

    # 5. Seed Production Batches
    batches = [
        {
            "batch_number": "#TCW-882",
            "product_id": product_id,
            "assigned_to": admin_id,
            "stage": "QC",
            "progress_percentage": 90,
            "expected_completion": datetime.utcnow() + timedelta(hours=4)
        },
        {
            "batch_number": "#TCW-883",
            "product_id": product_id,
            "assigned_to": admin_id,
            "stage": "In Production",
            "progress_percentage": 45,
            "expected_completion": datetime.utcnow() + timedelta(days=1)
        },
        {
            "batch_number": "#TCW-881",
            "product_id": product_id,
            "assigned_to": admin_id,
            "stage": "Completed",
            "progress_percentage": 100,
            "expected_completion": datetime.utcnow() - timedelta(days=1)
        },
        {
            "batch_number": "#TCW-884",
            "product_id": product_id,
            "assigned_to": admin_id,
            "stage": "Planned",
            "progress_percentage": 0,
            "expected_completion": datetime.utcnow() + timedelta(days=3)
        }
    ]
    db.batches.insert_many(batches)
    print("✅ Inserted Production Batches")

    # 6. Seed Orders
    orders = [
        {
            "_id": ObjectId(),
            "client_id": client_id,
            "order_number": "#ORD-2023-0891",
            "total_amount": 45000.0,
            "status": "New",
            "timeline": [{"status": "New", "timestamp": datetime.utcnow()}],
            "created_at": datetime.utcnow()
        },
        {
            "_id": ObjectId(),
            "client_id": client_id,
            "order_number": "#ORD-2023-0892",
            "total_amount": 12500.0,
            "status": "Processing",
            "timeline": [
                {"status": "New", "timestamp": datetime.utcnow() - timedelta(days=2)},
                {"status": "Processing", "timestamp": datetime.utcnow() - timedelta(days=1)}
            ],
            "created_at": datetime.utcnow() - timedelta(days=2)
        },
        {
            "_id": ObjectId(),
            "client_id": client_id,
            "order_number": "#ORD-2023-0885",
            "total_amount": 32000.0,
            "status": "Delivered",
            "timeline": [{"status": "Delivered", "timestamp": datetime.utcnow() - timedelta(days=5)}],
            "created_at": datetime.utcnow() - timedelta(days=10)
        },
        {
            "_id": ObjectId(),
            "client_id": client_id,
            "order_number": "#ORD-2023-0895",
            "total_amount": 8900.0,
            "status": "Dispatched",
            "timeline": [{"status": "Dispatched", "timestamp": datetime.utcnow() - timedelta(hours=12)}],
            "created_at": datetime.utcnow() - timedelta(days=1)
        }
    ]
    db.orders.insert_many(orders)
    print("✅ Inserted Orders")

    # 7. Seed Invoices
    invoices = [
        {
            "invoice_number": "INV-2024-001",
            "order_id": orders[2]["_id"],
            "client_id": client_id,
            "line_items": [
                {"desc": "TCW 250ml Glass Bottle", "qty": 1000, "unit_price": 45.0, "gst_rate": 18, "total": 45000.0}
            ],
            "subtotal": 45000.0,
            "cgst": 4050.0,
            "sgst": 4050.0,
            "grand_total": 53100.0,
            "status": "Paid",
            "created_at": datetime.utcnow() - timedelta(days=5)
        },
        {
            "invoice_number": "INV-2024-002",
            "order_id": orders[0]["_id"],
            "client_id": client_id,
            "line_items": [
                {"desc": "Mango Concentrate 5L", "qty": 10, "unit_price": 850.0, "gst_rate": 18, "total": 8500.0}
            ],
            "subtotal": 8500.0,
            "cgst": 765.0,
            "sgst": 765.0,
            "grand_total": 10030.0,
            "status": "Draft",
            "created_at": datetime.utcnow()
        }
    ]
    db.invoices.insert_many(invoices)
    print("✅ Inserted Invoices")

    print("\n🌟 Database Seeding Completed Successfully! 🌟")

if __name__ == "__main__":
    seed_database()
