"""FastAPI application package for VSA Foods staff management."""

from __future__ import annotations

import importlib.util
from pathlib import Path
from types import ModuleType
from typing import Any

_LEGACY_FLASK_MODULE: ModuleType | None = None


def _load_legacy_flask_module() -> ModuleType:
    global _LEGACY_FLASK_MODULE

    if _LEGACY_FLASK_MODULE is not None:
        return _LEGACY_FLASK_MODULE

    legacy_app_path = Path(__file__).resolve().parents[1] / "app.py"
    spec = importlib.util.spec_from_file_location("_iws_legacy_flask_app", legacy_app_path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Could not load legacy Flask app module from {legacy_app_path}")

    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    _LEGACY_FLASK_MODULE = module
    return module


def __getattr__(name: str) -> Any:
    if name in {"create_app", "app"}:
        module = _load_legacy_flask_module()
        return getattr(module, name)
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")


def __dir__() -> list[str]:
    return sorted(set(globals()) | {"app", "create_app"})
