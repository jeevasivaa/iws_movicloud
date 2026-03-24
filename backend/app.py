import os

from dotenv import load_dotenv
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager  # type: ignore[import-untyped]

from utils.db import ensure_indexes
from utils.json_encoder import CustomJSONProvider

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"))


def _resolve_cors_origins():
    raw_origins = str(os.getenv("CORS_ORIGINS", "*")).strip()
    if not raw_origins or raw_origins == "*":
        return "*"

    origins = [origin.strip() for origin in raw_origins.split(",") if origin.strip()]
    return origins or "*"


def create_app():
    app = Flask(
        __name__,
        static_folder=os.path.join(BASE_DIR, "../frontend/dist"),
        static_url_path="/",
    )

    # Config
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "super-secret")
    app.config["JWT_TOKEN_LOCATION"] = ["headers"]

    # JSON config
    app.json_provider_class = CustomJSONProvider
    app.json = app.json_provider_class(app)

    # CORS
    CORS(app, resources={r"/*": {"origins": _resolve_cors_origins()}})

    # JWT
    jwt = JWTManager(app)

    @jwt.unauthorized_loader
    def _missing_token(_reason):
        return jsonify({"msg": "Authentication required"}), 401

    @jwt.invalid_token_loader
    def _invalid_token(_reason):
        return jsonify({"msg": "Invalid authentication token"}), 401

    @jwt.expired_token_loader
    def _expired_token(_jwt_header, _jwt_payload):
        return jsonify({"msg": "Authentication token has expired"}), 401

    @jwt.revoked_token_loader
    def _revoked_token(_jwt_header, _jwt_payload):
        return jsonify({"msg": "Authentication token has been revoked"}), 401

    @jwt.needs_fresh_token_loader
    def _fresh_token_required(_jwt_header, _jwt_payload):
        return jsonify({"msg": "Fresh authentication required"}), 401

    # Ensure DB indexes
    ensure_indexes()

    # -------- BLUEPRINTS -------- #
    from routes.auth import auth_bp
    from routes.billing import billing_bp
    from routes.dashboard import dashboard_bp
    from routes.inventory import inventory_bp
    from routes.marketing import marketing_bp
    from routes.notifications import notifications_bp
    from routes.orders import orders_bp
    from routes.payroll import payroll_bp
    from routes.products import products_bp
    from routes.production import production_bp
    from routes.reports import reports_bp
    from routes.settings import settings_bp
    from routes.staff import staff_bp
    from routes.suppliers import suppliers_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(dashboard_bp, url_prefix="/api/dashboard")
    app.register_blueprint(products_bp, url_prefix="/api/products")
    app.register_blueprint(suppliers_bp, url_prefix="/api/suppliers")
    app.register_blueprint(staff_bp, url_prefix="/api/staff")
    app.register_blueprint(billing_bp, url_prefix="/api/billing")
    app.register_blueprint(payroll_bp, url_prefix="/api/payroll")
    app.register_blueprint(production_bp, url_prefix="/api/production")
    app.register_blueprint(orders_bp, url_prefix="/api/orders")
    app.register_blueprint(inventory_bp, url_prefix="/api/inventory")
    app.register_blueprint(reports_bp, url_prefix="/api/reports")
    app.register_blueprint(marketing_bp, url_prefix="/api/marketing")
    app.register_blueprint(notifications_bp, url_prefix="/api/notifications")
    app.register_blueprint(settings_bp, url_prefix="/api/settings")

    # -------- HEALTH CHECK -------- #
    @app.route("/health", methods=["GET"])
    def health_check():
        return jsonify({"status": "healthy", "service": "vsa-foods-admin-backend"}), 200

    # -------- SERVE FRONTEND -------- #
    @app.route("/", defaults={"path": ""})
    @app.route("/<path:path>")
    def serve_frontend(path):
        static_folder = app.static_folder

        if path != "" and os.path.exists(os.path.join(static_folder, path)):
            return send_from_directory(static_folder, path)

        return send_from_directory(static_folder, "index.html")

    return app


app = create_app()


if __name__ == "__main__":
    port = int(os.getenv("PORT", 10000))  # Render safe default
    debug = os.getenv("DEBUG", "False").lower() == "true"
    app.run(host="0.0.0.0", port=port, debug=debug)