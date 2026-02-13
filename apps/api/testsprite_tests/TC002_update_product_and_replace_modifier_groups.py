import requests
import uuid

BASE_URL = "http://localhost:3001/api"
HEADERS = {
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0LWFkbWluLXVzZXItaWQtMDAxIiwiZW1haWwiOiJhZG1pbkB0ZXN0c3ByaXRlLmNvbSIsInJvbGUiOiJBRE1JTiIsIm5hbWUiOiJUZXN0U3ByaXRlIEFkbWluIiwiaWF0IjoxNzcwOTUxOTA1LCJleHAiOjE3NzE1NTY3MDV9.I_Bt2FEfNZi11_3SqhXATyTJsMasliZA_L_VXxMmwFQ",
    "x-tenant-id": "mauro",
    "Content-Type": "application/json",
}
TIMEOUT = 30


def test_update_product_and_replace_modifier_groups():
    # Step 1: Create a product first to get a valid product ID
    create_payload = {
        "name": f"Test Product {uuid.uuid4()}",
        "slug": f"test-product-{uuid.uuid4()}",
        "description": "Test product description",
        "productType": "PHYSICAL",
        "basePrice": 10.0,
        "images": ["https://example.com/image1.jpg"],
        "stock": 100,
        "sku": "TESTSKU123",
        "published": True,
        "modifierGroups": [
            {
                "name": "Original Modifier Group",
                "minSelect": 1,
                "maxSelect": 2,
                "modifiers": [
                    {"name": "Original Modifier 1", "priceAdjustment": 1.0, "stock": 10, "isAvailable": True},
                    {"name": "Original Modifier 2", "priceAdjustment": 2.0, "stock": 5, "isAvailable": True},
                ],
            }
        ],
    }

    product_id = None
    try:
        create_resp = requests.post(
            f"{BASE_URL}/admin/products", json=create_payload, headers=HEADERS, timeout=TIMEOUT
        )
        assert create_resp.status_code == 201, f"Product creation failed: {create_resp.text}"
        product = create_resp.json()
        product_id = product.get("id") or product.get("data", {}).get("id")
        # If API returns id nested differently, fallback or raise
        if not product_id:
            # If the response returns full product info, try to parse accordingly
            product_id = product.get("id")
        assert product_id, "Created product ID not found in response"

        # Step 2: Update the product replacing all modifier groups
        update_payload = {
            "name": create_payload["name"] + " Updated",
            "slug": create_payload["slug"] + "-updated",
            "description": "Updated product description",
            "productType": "PHYSICAL",
            "basePrice": 15.0,
            "images": ["https://example.com/image2.jpg"],
            "stock": 150,
            "sku": "TESTSKU123-UPDATED",
            "published": False,
            "modifierGroups": [
                {
                    "name": "New Modifier Group 1",
                    "minSelect": 0,
                    "maxSelect": 1,
                    "modifiers": [
                        {"name": "New Modifier 1", "priceAdjustment": 3.0, "stock": 20, "isAvailable": True}
                    ],
                },
                {
                    "name": "New Modifier Group 2",
                    "minSelect": 1,
                    "maxSelect": 3,
                    "modifiers": [
                        {"name": "New Modifier 2", "priceAdjustment": 0.5, "stock": 10, "isAvailable": True},
                        {"name": "New Modifier 3", "priceAdjustment": 1.5, "stock": 15, "isAvailable": True},
                    ],
                },
            ],
        }

        update_resp = requests.put(
            f"{BASE_URL}/admin/products/{product_id}", json=update_payload, headers=HEADERS, timeout=TIMEOUT
        )
        assert update_resp.status_code == 200, f"Product update failed: {update_resp.text}"
        updated_product = update_resp.json()

        # Validate the response contains updated product info - assume API returns updated product data
        # Check that the modifierGroups count matches the update payload
        modifier_groups = updated_product.get("modifierGroups") or updated_product.get("data", {}).get("modifierGroups")
        if modifier_groups is None:
            # Try to fetch the product to confirm the replacement happened
            get_resp = requests.get(
                f"{BASE_URL}/admin/products/{product_id}", headers=HEADERS, timeout=TIMEOUT
            )
            assert get_resp.status_code == 200, f"Fetching updated product failed: {get_resp.text}"
            product_data = get_resp.json()
            modifier_groups = product_data.get("modifierGroups") or product_data.get("data", {}).get("modifierGroups")
            assert modifier_groups is not None, "modifierGroups missing after update"

        # Assert old modifier groups deleted: count must be equal to new modifierGroups length
        assert len(modifier_groups) == len(update_payload["modifierGroups"]), "Modifier groups count mismatch after update"

        # Verify names of new modifier groups present and old ones are absent
        new_names = set(mg["name"] for mg in update_payload["modifierGroups"])
        response_names = set(mg["name"] for mg in modifier_groups)
        assert new_names == response_names, "Modifier group names mismatch after update"

        # Step 3: Test error handling for non-existent product ID
        fake_id = "00000000-0000-0000-0000-000000000000"
        resp_404 = requests.put(
            f"{BASE_URL}/admin/products/{fake_id}", json=update_payload, headers=HEADERS, timeout=TIMEOUT
        )
        assert resp_404.status_code == 404, f"Expected 404 for non-existent product ID, got {resp_404.status_code}"

        # Step 4: Test unauthorized access (missing or invalid token)
        bad_headers = HEADERS.copy()
        bad_headers["Authorization"] = "Bearer invalidtoken"
        resp_unauth = requests.put(
            f"{BASE_URL}/admin/products/{product_id}", json=update_payload, headers=bad_headers, timeout=TIMEOUT
        )
        assert resp_unauth.status_code in (401, 403), f"Expected 401/403 for unauthorized access, got {resp_unauth.status_code}"

    finally:
        # Cleanup: delete the created product if it exists
        if product_id:
            requests.delete(f"{BASE_URL}/admin/products/{product_id}", headers=HEADERS, timeout=TIMEOUT)


test_update_product_and_replace_modifier_groups()