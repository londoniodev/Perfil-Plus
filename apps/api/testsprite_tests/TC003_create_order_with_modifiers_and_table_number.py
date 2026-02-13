import requests
import uuid

BASE_URL = 'http://localhost:3001/api'
ADMIN_TOKEN = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0LWFkbWluLXVzZXItaWQtMDAxIiwiZW1haWwiOiJhZG1pbkB0ZXN0c3ByaXRlLmNvbSIsInJvbGUiOiJBRE1JTiIsIm5hbWUiOiJUZXN0U3ByaXRlIEFkbWluIiwiaWF0IjoxNzcwOTUxOTA1LCJleHAiOjE3NzE1NTY3MDV9.I_Bt2FEfNZi11_3SqhXATyTJsMasliZA_L_VXxMmwFQ'
HEADERS = {
    'Authorization': ADMIN_TOKEN,
    'x-tenant-id': 'mauro',
    'Content-Type': 'application/json'
}

def create_physical_product_with_modifiers():
    """
    Creates a physical product with nested modifier groups and modifiers,
    returning the product and variant info for ordering.
    """
    product_slug = f"test-product-{uuid.uuid4()}"
    product_payload = {
        "name": "Test Product with Modifiers",
        "slug": product_slug,
        "description": "A test product with modifier groups for order creation test",
        "productType": "PHYSICAL",
        "basePrice": 1000,
        "images": ["https://example.com/image.png"],
        "modifierGroups": [
            {
                "name": "Cheese Options",
                "minSelect": 1,
                "maxSelect": 2,
                "modifiers": [
                    {"name": "Cheddar", "priceAdjustment": 100, "stock": 10, "isAvailable": True},
                    {"name": "Swiss", "priceAdjustment": 150, "stock": 5, "isAvailable": True},
                    {"name": "No Cheese", "priceAdjustment": 0, "stock": 100, "isAvailable": True}
                ]
            },
            {
                "name": "Extras",
                "minSelect": 0,
                "maxSelect": 3,
                "modifiers": [
                    {"name": "Bacon", "priceAdjustment": 250, "stock": 7, "isAvailable": True},
                    {"name": "Avocado", "priceAdjustment": 300, "stock": 2, "isAvailable": True}
                ]
            }
        ]
    }
    response = requests.post(f"{BASE_URL}/admin/products", json=product_payload, headers=HEADERS, timeout=30)
    response.raise_for_status()
    product = response.json()
    # Extract variantId for ordering - assume first variant returned in product variants if present
    variant_id = None
    # The API docs do not explicitly say how variants return, try to grab variantId from response if present
    if "variants" in product and isinstance(product["variants"], list) and product["variants"]:
        variant_id = product["variants"][0]["id"]
    elif "id" in product:
        # fallback - treat product id as variantId if no variants provided (unlikely)
        variant_id = product["id"]
    else:
        # If no variant info, we cannot proceed
        raise Exception("No variantId found from created product")

    # Map modifier names to ids for order request
    modifier_ids = {}
    if "modifierGroups" in product and isinstance(product["modifierGroups"], list):
        for group in product["modifierGroups"]:
            if "modifiers" in group and isinstance(group["modifiers"], list):
                for modifier in group["modifiers"]:
                    modifier_ids[modifier["name"]] = modifier["id"]

    return variant_id, modifier_ids, product["id"]

def delete_product(product_id: str):
    """Deletes product by ID."""
    try:
        resp = requests.delete(f"{BASE_URL}/admin/products/{product_id}", headers=HEADERS, timeout=30)
        # 204 No Content or 200 OK are valid deletions
        if resp.status_code not in (200, 204, 404):
            resp.raise_for_status()
    except Exception:
        pass  # ignore deletion errors to not mask test results

def test_create_order_with_modifiers_and_table_number():
    variant_id = None
    modifier_ids = {}
    product_id = None
    order_id = None
    try:
        # Setup product with modifiers to obtain variantId and modifierIds
        variant_id, modifier_ids, product_id = create_physical_product_with_modifiers()

        # Prepare order payloads for each orderType with modifiers and tableNumber
        order_types = ["DINE_IN", "TAKE_AWAY", "DELIVERY"]
        for order_type in order_types:
            order_payload = {
                "orderType": order_type,
                "tableNumber": "T12" if order_type == "DINE_IN" else None,
                "items": [
                    {
                        "variantId": variant_id,
                        "quantity": 2,
                        "notes": "Please be quick",
                        "modifiers": [
                            {"modifierId": modifier_ids.get("Cheddar"), "quantity": 1},
                            {"modifierId": modifier_ids.get("Bacon"), "quantity": 2}
                        ]
                    }
                ]
            }
            # Remove tableNumber key if None to test optional presence
            if order_payload["tableNumber"] is None:
                order_payload.pop("tableNumber")

            response = requests.post(f"{BASE_URL}/orders", json=order_payload, headers=HEADERS, timeout=30)
            # Validate successful creation
            assert response.status_code == 201, f"Failed to create order for {order_type}, status {response.status_code}"
            data = response.json()
            assert data is not None and "id" in data, "Response missing order id"
            order_id = data["id"]

            # Validate returned order details include expected fields
            assert "items" in data and isinstance(data["items"], list) and len(data["items"]) == 1
            item = data["items"][0]
            assert item["variantId"] == variant_id
            assert item["quantity"] == 2
            assert item.get("notes") == "Please be quick"
            # Validate modifiers present with correct quantities
            returned_modifiers = item.get("modifiers", [])
            mod_qty_map = {m["modifierId"]: m["quantity"] for m in returned_modifiers}
            assert mod_qty_map.get(modifier_ids.get("Cheddar")) == 1
            assert mod_qty_map.get(modifier_ids.get("Bacon")) == 2

            # Validate server-calculated total price: base price + modifiers * quantities * item quantity
            base_price = 1000
            price_adjustments = 100 * 1 + 250 * 2  # cheddar + bacon
            expected_total_per_item = base_price + price_adjustments
            expected_total = expected_total_per_item * 2  # quantity 2
            # Total validation - total format depends on API, assume decimal price integer
            assert "total" in data, "Order total not returned"
            assert isinstance(data["total"], (int, float)), "Order total should be numeric"
            # Allow small floating rounding tolerances in price check
            assert abs(data["total"] - expected_total) < 1, f"Total price mismatch: expected {expected_total} got {data['total']}"

            # Validate minSelect/maxSelect constraints implicitly by API response success (no 400)
            # Further negative tests should be in separate test cases

            # Validate that the tableNumber is assigned correctly for DINE_IN orderType
            if order_type == "DINE_IN":
                assert data.get("tableNumber") == "T12"
            else:
                # Should be null or absent for TAKE_AWAY and DELIVERY
                assert "tableNumber" not in data or data["tableNumber"] is None

            # After each order creation, optionally verify stock decrement by attempting a second order with quantities exceeding stock could be done,
            # but out of scope, here we rely on success and no error 400
            # Delete created order to keep test isolated if API supports DELETE order - not stated, so ignoring here

    finally:
        # Cleanup product created for test
        if product_id:
            delete_product(product_id)

test_create_order_with_modifiers_and_table_number()