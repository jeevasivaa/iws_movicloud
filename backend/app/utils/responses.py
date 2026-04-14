from __future__ import annotations

from typing import Any


def success_response(message: str, data: Any = None) -> dict[str, Any]:
    response: dict[str, Any] = {
        "success": True,
        "message": message,
    }
    if data is not None:
        response["data"] = data
    return response


def error_response(message: str, data: Any = None) -> dict[str, Any]:
    response: dict[str, Any] = {
        "success": False,
        "message": message,
    }
    if data is not None:
        response["data"] = data
    return response
