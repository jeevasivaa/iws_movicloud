import os
from pymongo import MongoClient
from pymongo.errors import ConfigurationError
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(BASE_DIR)
load_dotenv(os.path.join(BACKEND_DIR, '.env'))

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/iws")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "iws")

client = MongoClient(MONGO_URI)

try:
    db = client.get_default_database()
except ConfigurationError:
    db = client[MONGO_DB_NAME]

if db is None:
    db = client[MONGO_DB_NAME]

def get_db():
    return db
