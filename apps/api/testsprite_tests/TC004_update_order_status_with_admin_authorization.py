import requests
import uuid
import time

BASE_URL = "http://localhost:3001/api"
HEADERS = {
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0LWFkbWluLXVzZXItaWQtMDAxIiwiZW1haWwiOiJhZG1pbkB0ZXN0c3ByaXRlLmNvbSIsInJvbGUiOiJBRE1JTiIsIm5hbWUiOiJUZXN0U3ByaXRlIEFkbWluIiwiaWF0IjoxNzcwOTUxOTA1LCJleHAiOjE3NzE1NTY3MDV9.I_Bt2FEfNZi11_3SqhXATyTJsMasliZA_L_VXxMmwFQ",
    "x-tenant-id": "mauro",
    "Content-Type": "application/json"
}
TIMEOUT = 30

def test_update_order_status_with_admin_authorization():
    # Step 1: Create a product with modifier groups and modifiers (to create variant and modifiers)
    product_payload = {
        "name": f"Test Product {uuid.uuid4()}",
        "slug": f"test-product-{uuid.uuid4()}",
        "description": "Test product for order creation",
        "productType": "PHYSICAL",
        "basePrice": 10.0,
        "images": [],
        "modifierGroups": [
            {
                "name": "Group 1",
                "minSelect": 0,
                "maxSelect": 1,
                "modifiers": [
                    {
                        "name": "Modifier 1",
                        "priceAdjustment": 0,
                        "stock": 10,
                        "isAvailable": True
                    }
                ]
            }
        ],
        "stock": 100,
        "sku": f"sku-{uuid.uuid4()}",
        "published": True
    }

    product_id = None
    order_id = None
    try:
        # Create product
        product_resp = requests.post(f"{BASE_URL}/admin/products", json=product_payload, headers=HEADERS, timeout=TIMEOUT)
        assert product_resp.status_code == 201, f"Product creation failed: {product_resp.text}"
        product_data = product_resp.json()
        product_id = product_data.get("id")
        assert product_id, "Product ID not returned"

        # Extract first variantId and modifierId from response if present (or fetch product to get variant id)
        # Since response shape is not detailed, we get variants via GET /admin/products/:id or from returned data
        # We'll try GET /admin/products/:id to get variants and modifiers
        product_get_resp = requests.get(f"{BASE_URL}/admin/products/{product_id}", headers=HEADERS, timeout=TIMEOUT)
        assert product_get_resp.status_code == 200, f"Product fetch failed: {product_get_resp.text}"
        product_full = product_get_resp.json()

        # Extract variantId
        variants = product_full.get("variants") or []
        assert len(variants) > 0, "No variants found in product"
        variant_id = variants[0].get("id")
        assert variant_id, "Variant id missing"

        # Extract modifierId for the modifier in first group
        modifier_groups = product_full.get("modifierGroups") or []
        assert len(modifier_groups) > 0, "No modifier groups found in product"
        modifiers = modifier_groups[0].get("modifiers") or []
        assert len(modifiers) > 0, "No modifiers in modifier group"
        modifier_id = modifiers[0].get("id")
        assert modifier_id, "Modifier id missing"

        # Step 2: Create an order with this variant and modifier
        order_payload = {
            "orderType": "DINE_IN",
            "tableNumber": "12",
            "items": [
                {
                    "variantId": variant_id,
                    "quantity": 1,
                    "notes": "Test note",
                    "modifiers": [
                        {
                            "modifierId": modifier_id,
                            "quantity": 1
                        }
                    ]
                }
            ]
        }
        order_resp = requests.post(f"{BASE_URL}/orders", json=order_payload, headers=HEADERS, timeout=TIMEOUT)
        assert order_resp.status_code == 201, f"Order creation failed: {order_resp.text}"
        order_data = order_resp.json()
        order_id = order_data.get("id")
        assert order_id, "Order ID not returned"

        # Step 3: Update order status with ADMIN authorization - valid status update
        new_status = "PREPARING"
        patch_payload = {"status": new_status}
        patch_resp = requests.patch(f"{BASE_URL}/admin/orders/{order_id}/status", json=patch_payload, headers=HEADERS, timeout=TIMEOUT)
        assert patch_resp.status_code == 200, f"Order status update failed: {patch_resp.text}"
        patch_data = patch_resp.json()
        # Validate that returned status matches update, possibly response contains updated order or minimal confirmation
        # If response returns updated order, assert status
        if "status" in patch_data:
            assert patch_data["status"] == new_status, "Order status not updated properly"

        # Step 4: Try updating with invalid/non-existent order id -> expect 404
        invalid_order_id = str(uuid.uuid4())
        patch_invalid_resp = requests.patch(f"{BASE_URL}/admin/orders/{invalid_order_id}/status", json={"status": "READY"}, headers=HEADERS, timeout=TIMEOUT)
        assert patch_invalid_resp.status_code == 404, f"Expected 404 for non-existent order id, got {patch_invalid_resp.status_code}"

        # Step 5: Verify that non-admin authorization fails (try with no or incorrect token)
        headers_non_admin = {
            "Authorization": "Bearer invalid_token",
            "x-tenant-id": "mauro",
            "Content-Type": "application/json"
        }
        patch_unauth_resp = requests.patch(f"{BASE_URL}/admin/orders/{order_id}/status", json={"status": "READY"}, headers=headers_non_admin, timeout=TIMEOUT)
        # Unauthorized or Forbidden likely 401 or 403
        assert patch_unauth_resp.status_code in (401, 403), f"Expected 401/403 for unauthorized update, got {patch_unauth_resp.status_code}"

    finally:
        # Cleanup: delete created order if possible
        if order_id:
            try:
                requests.delete(f"{BASE_URL}/admin/orders/{order_id}", headers=HEADERS, timeout=TIMEOUT)
            except Exception:
                pass
        # Cleanup: delete created product
        if product_id:
            try:
                requests.delete(f"{BASE_URL}/admin/products/{product_id}", headers=HEADERS, timeout=TIMEOUT)
            except Exception:
                pass

test_update_order_status_with_admin_authorization()