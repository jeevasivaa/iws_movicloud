from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.database import close_mongo_connection, connect_to_mongo
from app.routes.auth_routes import router as auth_router
from app.routes.staff_routes import router as staff_router
from app.services.bootstrap_service import ensure_indexes, seed_initial_data
from app.utils.config import get_settings
from app.utils.responses import error_response, success_response

settings = get_settings()


@asynccontextmanager
async def lifespan(_app: FastAPI):
    await connect_to_mongo()
    await ensure_indexes()

    if settings.seed_sample_data:
        await seed_initial_data()

    yield

    await close_mongo_connection()


app = FastAPI(
    title=settings.app_name,
    debug=settings.debug,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(staff_router)


@app.exception_handler(RequestValidationError)
async def request_validation_exception_handler(_request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content=error_response("Validation error", exc.errors()),
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(_request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content=error_response(str(exc.detail)),
        headers=getattr(exc, "headers", None),
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(_request: Request, _exc: Exception):
    return JSONResponse(
        status_code=500,
        content=error_response("Internal server error"),
    )


@app.get("/")
async def root():
    return success_response("VSA Foods Staff Management API is running")


@app.get("/health")
async def health_check():
    return success_response(
        "Service health check successful",
        {
            "status": "healthy",
            "service": "vsa-foods-staff-fastapi",
        },
    )
