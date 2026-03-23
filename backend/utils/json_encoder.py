from datetime import date, datetime

from bson import ObjectId  # pyright: ignore[reportMissingImports]
from flask.json.provider import DefaultJSONProvider


class CustomJSONProvider(DefaultJSONProvider):
    def default(self, o):  # type: ignore[override]
        if isinstance(o, ObjectId):
            return str(o)
        if isinstance(o, (datetime, date)):
            return o.isoformat()
        return super().default(o)
