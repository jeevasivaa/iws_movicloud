import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
from utils.json_encoder import CustomJSONEncoder

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, '.env'))

def create_app():
    app = Flask(__name__)
    
    # Configuration
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "super-secret")
    app.json_encoder = CustomJSONEncoder
    
    # Extensions
    CORS(app)
    jwt = JWTManager(app)
    
    # Blueprints
    from routes.auth import auth_bp
    from routes.inventory import inventory_bp
    from routes.production import production_bp
    from routes.finance import finance_bp
    from routes.analytics import analytics_bp
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(inventory_bp, url_prefix="/api/inventory")
    app.register_blueprint(production_bp, url_prefix="/api/production")
    app.register_blueprint(finance_bp, url_prefix="/api/finance")
    app.register_blueprint(analytics_bp, url_prefix="/api/analytics")
    
    # Routes
    @app.route("/health")
    def health_check():
        return jsonify({"status": "healthy"})
    
    return app

if __name__ == "__main__":
    app = create_app()
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=os.getenv("DEBUG", "True") == "True")
