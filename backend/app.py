import os

from dotenv import load_dotenv
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager  # type: ignore[import-untyped]

from utils.db import ensure_indexes
from utils.json_encoder import CustomJSONProvider

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"))


def create_app():
    app = Flask(__name__)

    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "super-secret")
    app.config["JWT_TOKEN_LOCATION"] = ["headers"]
    app.json_provider_class = CustomJSONProvider
    app.json = app.json_provider_class(app)

    CORS(app, resources={r"/api/*": {"origins": "*"}})
    JWTManager(app)
    ensure_indexes()

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

    @app.route("/health", methods=["GET"])
    def health_check():
        return jsonify({"status": "healthy", "service": "vsa-foods-admin-backend"}), 200

    return app


if __name__ == "__main__":
    app = create_app()
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("DEBUG", "True").lower() == "true"
    app.run(host="0.0.0.0", port=port, debug=debug)
