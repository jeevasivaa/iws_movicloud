from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt, verify_jwt_in_request  # type: ignore[import-untyped]


def role_required(*roles):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            user_role = claims.get("role")

            if user_role not in roles:
                return jsonify({"msg": "Unauthorized access: Insufficient permissions"}), 403

            return f(*args, **kwargs)
        return decorated_function
    return decorator


def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        verify_jwt_in_request()
        claims = get_jwt()
        user_role = claims.get("role")

        if user_role != "admin":
            return jsonify({"msg": "Admin access required"}), 403

        return f(*args, **kwargs)

    return decorated_function
