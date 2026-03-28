from rbac_test_support import EndpointCase


def payload_products_create(_ids):
    return {
        "name": "Test Product",
        "sku": "SKU-NEW-001",
        "category": "Cold Pressed Oils",
        "price": 199,
        "stock": 20,
        "status": "Active",
    }


def payload_products_update(_ids):
    return {"name": "Updated Product"}


def payload_suppliers_create(_ids):
    return {
        "name": "New Supplier",
        "location": "Kerala",
        "category_supplied": "Coconut",
        "rating": 4.3,
        "total_orders": 11,
        "status": "Active",
    }


def payload_suppliers_update(_ids):
    return {"status": "Inactive"}


def payload_marketing_create(_ids):
    return {
        "company_name": "Acme Foods",
        "contact_person": "Maya Rao",
        "email": "maya@acmefoods.com",
        "total_orders": 5,
        "last_order_date": "2026-01-10",
        "rating": 4.2,
    }


def payload_marketing_update(_ids):
    return {"rating": 4.9}


def payload_settings_upsert(_ids):
    return {
        "key": "low_stock_alerts",
        "value": False,
    }


def payload_staff_create(_ids):
    return {
        "name": "Temp Staff",
        "email": "temp.staff@example.com",
        "role": "staff",
        "department": "Production",
        "status": "Active",
    }


def payload_staff_update(_ids):
    return {"status": "Inactive"}


def payload_staff_reject(_ids):
    return {"reason": "Not approved for now"}


def payload_billing_create(ids):
    return {
        "invoice_number": "INV-NEW-001",
        "client_id": ids["client_id"],
        "date": "2026-01-10",
        "amount": 1500,
        "status": "Pending",
        "items": [],
    }


def payload_billing_update(_ids):
    return {"status": "Paid"}


def payload_payroll_create(ids):
    return {
        "staff_id": ids["staff_user_id"],
        "base_salary": 10000,
        "deductions": 1000,
        "net_pay": 9000,
        "month": "2026-01",
        "status": "Pending",
    }


def payload_payroll_update(_ids):
    return {"status": "Paid"}


def payload_production_create(ids):
    return {
        "batch_id": "BATCH-NEW-001",
        "product_id": ids["product_id"],
        "quantity": 100,
        "stage": "Planned",
        "start_date": "2026-01-10",
        "end_date": "2026-01-15",
    }


def payload_production_update(_ids):
    return {"stage": "Completed"}


def payload_orders_create(ids):
    return {
        "order_id": "ORD-NEW-001",
        "client_id": ids["client_id"],
        "date": "2026-01-10",
        "total_items": 3,
        "total_amount": 1200,
        "status": "Pending",
    }


def payload_orders_update(_ids):
    return {"status": "Processing"}


def payload_inventory_create(_ids):
    return {
        "item_name": "New Item",
        "type": "Packaging",
        "warehouse_location": "WH-A",
        "current_stock": 100,
        "max_capacity": 1000,
        "expiry_date": "2027-01-01",
        "status": "Adequate",
    }


def payload_inventory_update(_ids):
    return {"status": "Low"}


def payload_notifications_create(_ids):
    return {
        "title": "Stock Alert",
        "message": "Raw material is low",
        "type": "warning",
    }


def payload_notifications_update(_ids):
    return {"is_read": True}


RBAC_MATRIX_BUSINESS_DATA = (
    EndpointCase("dashboard.summary.get", "GET", "/api/dashboard/summary", ("admin", "manager", "staff", "finance")),
    EndpointCase("products.get", "GET", "/api/products", ("admin", "manager")),
    EndpointCase("products.post", "POST", "/api/products", ("admin", "manager"), (201,), payload_products_create),
    EndpointCase("products.put", "PUT", "/api/products/{product_id}", ("admin", "manager"), (200,), payload_products_update),
    EndpointCase("products.delete", "DELETE", "/api/products/{product_id}", ("admin", "manager")),
    EndpointCase("suppliers.get", "GET", "/api/suppliers", ("admin", "manager")),
    EndpointCase("suppliers.post", "POST", "/api/suppliers", ("admin", "manager"), (201,), payload_suppliers_create),
    EndpointCase("suppliers.put", "PUT", "/api/suppliers/{supplier_id}", ("admin", "manager"), (200,), payload_suppliers_update),
    EndpointCase("suppliers.delete", "DELETE", "/api/suppliers/{supplier_id}", ("admin", "manager")),
    EndpointCase("marketing.get", "GET", "/api/marketing", ("admin", "manager")),
    EndpointCase("marketing.post", "POST", "/api/marketing", ("admin", "manager"), (201,), payload_marketing_create),
    EndpointCase("marketing.put", "PUT", "/api/marketing/{client_id}", ("admin", "manager"), (200,), payload_marketing_update),
    EndpointCase("marketing.delete", "DELETE", "/api/marketing/{client_id}", ("admin", "manager")),
    EndpointCase("reports.sales.get", "GET", "/api/reports/sales", ("admin", "manager", "finance")),
    EndpointCase("reports.production_efficiency.get", "GET", "/api/reports/production-efficiency", ("admin", "manager", "finance")),
    EndpointCase("settings.get", "GET", "/api/settings", ("admin", "manager")),
    EndpointCase("settings.put", "PUT", "/api/settings", ("admin", "manager"), (200,), payload_settings_upsert),
)


RBAC_MATRIX_PEOPLE_FINANCE = (
    EndpointCase("staff.get", "GET", "/api/staff", ("admin", "manager", "staff")),
    EndpointCase("staff.post", "POST", "/api/staff", ("admin", "manager"), (201, 202), payload_staff_create),
    EndpointCase("staff.requests.get", "GET", "/api/staff/requests", ("admin", "manager")),
    EndpointCase("staff.requests.approve", "PATCH", "/api/staff/requests/{staff_request_id}/approve", ("admin",), (200,), lambda _ids: {}),
    EndpointCase("staff.requests.reject", "PATCH", "/api/staff/requests/{staff_request_id}/reject", ("admin",), (200,), payload_staff_reject),
    EndpointCase("staff.put", "PUT", "/api/staff/{staff_user_id}", ("admin",), (200,), payload_staff_update),
    EndpointCase("staff.delete", "DELETE", "/api/staff/{staff_user_id}", ("admin",)),
    EndpointCase("billing.get", "GET", "/api/billing", ("admin", "finance")),
    EndpointCase("billing.summary.get", "GET", "/api/billing/summary", ("admin", "finance")),
    EndpointCase("billing.post", "POST", "/api/billing", ("admin", "finance"), (201,), payload_billing_create),
    EndpointCase("billing.put", "PUT", "/api/billing/{invoice_id}", ("admin", "finance"), (200,), payload_billing_update),
    EndpointCase("billing.delete", "DELETE", "/api/billing/{invoice_id}", ("admin", "finance")),
    EndpointCase("payroll.get", "GET", "/api/payroll", ("admin", "finance")),
    EndpointCase("payroll.summary.get", "GET", "/api/payroll/summary", ("admin", "finance")),
    EndpointCase("payroll.post", "POST", "/api/payroll", ("admin", "finance"), (201,), payload_payroll_create),
    EndpointCase("payroll.put", "PUT", "/api/payroll/{payroll_id}", ("admin", "finance"), (200,), payload_payroll_update),
    EndpointCase("payroll.delete", "DELETE", "/api/payroll/{payroll_id}", ("admin", "finance")),
)


RBAC_MATRIX_OPS_ALERTS = (
    EndpointCase("production.get", "GET", "/api/production", ("admin", "manager", "staff")),
    EndpointCase("production.post", "POST", "/api/production", ("admin", "manager", "staff"), (201,), payload_production_create),
    EndpointCase("production.put", "PUT", "/api/production/{batch_id}", ("admin", "manager", "staff"), (200,), payload_production_update),
    EndpointCase("production.delete", "DELETE", "/api/production/{batch_id}", ("admin", "manager", "staff")),
    EndpointCase("orders.get", "GET", "/api/orders", ("admin", "manager", "client")),
    EndpointCase("orders.post", "POST", "/api/orders", ("admin", "manager", "client"), (201,), payload_orders_create),
    EndpointCase("orders.put", "PUT", "/api/orders/{order_id}", ("admin", "manager"), (200,), payload_orders_update),
    EndpointCase("orders.delete", "DELETE", "/api/orders/{order_id}", ("admin", "manager")),
    EndpointCase("inventory.get", "GET", "/api/inventory", ("admin", "manager", "staff")),
    EndpointCase("inventory.kpis.get", "GET", "/api/inventory/kpis", ("admin", "manager", "staff")),
    EndpointCase("inventory.post", "POST", "/api/inventory", ("admin", "manager", "staff"), (201,), payload_inventory_create),
    EndpointCase("inventory.put", "PUT", "/api/inventory/{inventory_id}", ("admin", "manager", "staff"), (200,), payload_inventory_update),
    EndpointCase("inventory.delete", "DELETE", "/api/inventory/{inventory_id}", ("admin", "manager", "staff")),
    EndpointCase("notifications.get", "GET", "/api/notifications", ("admin", "manager", "staff", "finance")),
    EndpointCase("notifications.post", "POST", "/api/notifications", ("admin", "manager", "staff", "finance"), (201,), payload_notifications_create),
    EndpointCase("notifications.mark_all_read", "PUT", "/api/notifications/mark-all-read", ("admin", "manager", "staff", "finance"), (200,), lambda _ids: {}),
    EndpointCase("notifications.put", "PUT", "/api/notifications/{notification_id}", ("admin", "manager", "staff", "finance"), (200,), payload_notifications_update),
    EndpointCase("notifications.delete", "DELETE", "/api/notifications/{notification_id}", ("admin", "manager", "staff", "finance")),
)
