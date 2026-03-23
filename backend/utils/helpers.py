from datetime import date, datetime

from bson import ObjectId  # pyright: ignore[reportMissingImports]


def parse_object_id(value):
    if isinstance(value, ObjectId):
        return value
    if isinstance(value, str) and ObjectId.is_valid(value):
        return ObjectId(value)
    return None


def maybe_object_id(value):
    object_id = parse_object_id(value)
    return object_id if object_id else value


def to_float(value, default=0.0):
    if value is None:
        return float(default)

    if isinstance(value, (int, float)):
        return float(value)

    if isinstance(value, str):
        cleaned = value.replace("₹", "").replace(",", "").strip()
        if not cleaned:
            return float(default)
        try:
            return float(cleaned)
        except ValueError:
            return float(default)

    return float(default)


def to_int(value, default=0):
    return int(round(to_float(value, default)))


def normalize_iso_date(value):
    if isinstance(value, datetime):
        return value.date().isoformat()
    if isinstance(value, date):
        return value.isoformat()

    if isinstance(value, str) and value.strip():
        trimmed = value.strip()
        try:
            return datetime.fromisoformat(trimmed.replace("Z", "+00:00")).date().isoformat()
        except ValueError:
            if len(trimmed) >= 10:
                return trimmed[:10]

    return datetime.utcnow().date().isoformat()


def normalize_month(value):
    if isinstance(value, str) and value.strip():
        trimmed = value.strip()
        if len(trimmed) >= 7:
            return trimmed[:7]
    return datetime.utcnow().strftime("%Y-%m")
