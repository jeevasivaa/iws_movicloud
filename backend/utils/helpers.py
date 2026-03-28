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

    if isinstance(value, bool):
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


def parse_float_value(value):
    if value is None or isinstance(value, bool):
        return None

    if isinstance(value, (int, float)):
        return float(value)

    if isinstance(value, str):
        cleaned = value.replace("₹", "").replace(",", "").strip()
        if not cleaned:
            return None
        try:
            return float(cleaned)
        except ValueError:
            return None

    return None


def parse_int_value(value):
    number = parse_float_value(value)
    if number is None:
        return None
    return int(round(number))


def normalize_choice(value, allowed_values):
    if not isinstance(value, str):
        return None

    normalized_input = " ".join(value.strip().split()).lower()
    if not normalized_input:
        return None

    choice_map = {
        " ".join(str(choice).strip().split()).lower(): choice
        for choice in allowed_values
    }
    return choice_map.get(normalized_input)


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
            if len(trimmed) >= 10 and trimmed[4:5] == "-" and trimmed[7:8] == "-":
                try:
                    return date.fromisoformat(trimmed[:10]).isoformat()
                except ValueError:
                    return None

    return None


def normalize_month(value):
    if isinstance(value, str) and value.strip():
        trimmed = value.strip()
        if len(trimmed) >= 7:
            month_value = trimmed[:7]
            try:
                datetime.strptime(month_value, "%Y-%m")
            except ValueError:
                return None
            return month_value
    return None
