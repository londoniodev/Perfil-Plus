import requests
import uuid

BASE_URL = 'http://localhost:3001/api'
ADMIN_TOKEN = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0LWFkbWluLXVzZXItaWQtMDAxIiwiZW1haWwiOiJhZG1pbkB0ZXN0c3ByaXRlLmNvbSIsInJvbGUiOiJBRE1JTiIsIm5hbWUiOiJUZXN0U3ByaXRlIEFkbWluIiwiaWF0IjoxNzcwOTUxOTA1LCJleHAiOjE3NzE1NTY3MDV9.I_Bt2FEfNZi11_3SqhXATyTJsMasliZA_L_VXxMmwFQ"
HEADERS_ADMIN = {
    "Authorization": ADMIN_TOKEN,
    "x-tenant-id": "mauro",
    "Content-Type": "application/json"
}
HEADERS_NO_AUTH = {
    "x-tenant-id": "mauro",
    "Content-Type": "application/json"
}
HEADERS_NON_ADMIN = {
    "Authorization": "Bearer invalid-or-nonadmin-token",
    "x-tenant-id": "mauro",
    "Content-Type": "application/json"
}

def test_create_product_with_nested_modifier_groups():
    product_name = f"Test Product {uuid.uuid4()}"
    product_slug = f"test-product-{uuid.uuid4()}"
    product_payload = {
        "name": product_name,
        "slug": product_slug,
        "description": "Test product with nested modifier groups",
        "productType": "PHYSICAL",
        "basePrice": 10.0,
        "images": ["http://example.com/image1.jpg"],
        "stock": 100,
        "sku": "sku-test-001",
        "published": True,
        "modifierGroups": [
            {
                "name": "Size",
                "minSelect": 1,
                "maxSelect": 2,
                "modifiers": [
                    {
                        "name": "Small",
                        "priceAdjustment": 0,
                        "stock": 50,
                        "isAvailable": True
                    },
                    {
                        "name": "Large",
                        "priceAdjustment": 2.5,
                        "stock": 30,
                        "isAvailable": True
                    }
                ]
            },
            {
                "name": "Extras",
                "minSelect": 0,
                "maxSelect": 3,
                "modifiers": [
                    {
                        "name": "Cheese",
                        "priceAdjustment": 1.0,
                        "stock": 20,
                        "isAvailable": True
                    },
                    {
                        "name": "Bacon",
                        "priceAdjustment": 1.5,
                        "stock": 10,
                        "isAvailable": True
                    }
                ]
            }
        ]
    }

    product_id = None

    # 1) Attempt unauthorized request (no auth)
    try:
        resp = requests.post(f"{BASE_URL}/admin/products", json=product_payload, headers=HEADERS_NO_AUTH, timeout=30)
        assert resp.status_code == 401, f"Expected 401 Unauthorized for no auth, got {resp.status_code}"
    except Exception as e:
        raise AssertionError(f"Unauthorized no-auth request failed unexpectedly: {e}")

    # 2) Attempt unauthorized request (non-admin auth)
    try:
        resp = requests.post(f"{BASE_URL}/admin/products", json=product_payload, headers=HEADERS_NON_ADMIN, timeout=30)
        assert resp.status_code in (401,403), f"Expected 401 or 403 Forbidden for non-admin, got {resp.status_code}"
    except Exception as e:
        raise AssertionError(f"Unauthorized non-admin request failed unexpectedly: {e}")

    # 3) Authorized request (admin)
    try:
        resp = requests.post(f"{BASE_URL}/admin/products", json=product_payload, headers=HEADERS_ADMIN, timeout=30)
        assert resp.status_code == 201, f"Expected 201 Created, got {resp.status_code}"
        data = resp.json()
        # Basic validation of product creation data presence
        # Check top level keys
        assert 'id' in data or 'product' in data, "Response JSON missing product id"
        # Extract product_id for cleanup
        if 'id' in data:
            product_id = data['id']
        elif 'product' in data and 'id' in data['product']:
            product_id = data['product']['id']
        else:
            # Fallback: try any id in returned object (depends on API)
            raise AssertionError("Cannot find product id in response")

        # Validate nested modifier groups and modifiers
        modifier_groups_resp = None
        if 'modifierGroups' in data:
            modifier_groups_resp = data['modifierGroups']
        elif 'product' in data and 'modifierGroups' in data['product']:
            modifier_groups_resp = data['product']['modifierGroups']

        assert modifier_groups_resp is not None, "modifierGroups missing in response"
        assert isinstance(modifier_groups_resp, list), "modifierGroups is not a list"

        # Check modifier groups count
        assert len(modifier_groups_resp) == len(product_payload['modifierGroups']), "modifierGroups count mismatch"

        for group_req in product_payload['modifierGroups']:
            found_group = None
            for group_resp in modifier_groups_resp:
                if group_resp.get('name') == group_req['name']:
                    found_group = group_resp
                    break
            assert found_group is not None, f"Modifier group {group_req['name']} not found in response"
            # Validate minSelect and maxSelect with defaults
            min_select_resp = found_group.get('minSelect', 0)
            max_select_resp = found_group.get('maxSelect', 1)
            expected_min = group_req.get('minSelect', 0)
            expected_max = group_req.get('maxSelect', 1)
            assert min_select_resp == expected_min, f"minSelect mismatch for {group_req['name']}"
            assert max_select_resp == expected_max, f"maxSelect mismatch for {group_req['name']}"
            modifiers_resp = found_group.get('modifiers')
            assert isinstance(modifiers_resp, list), f"Modifiers not a list in group {group_req['name']}"
            assert len(modifiers_resp) == len(group_req['modifiers']), f"Modifiers count mismatch in group {group_req['name']}"
            for mod_req in group_req['modifiers']:
                found_mod = None
                for mod_resp in modifiers_resp:
                    if mod_resp.get('name') == mod_req['name']:
                        found_mod = mod_resp
                        break
                assert found_mod is not None, f"Modifier {mod_req['name']} not found in group {group_req['name']}"
                # Validate priceAdjustment with default 0
                price_adj_resp = found_mod.get('priceAdjustment', 0)
                expected_price_adj = mod_req.get('priceAdjustment', 0)
                assert abs(price_adj_resp - expected_price_adj) < 0.0001, f"priceAdjustment mismatch for modifier {mod_req['name']}"
                # Validate stock
                stock_resp = found_mod.get('stock')
                expected_stock = mod_req.get('stock')
                assert stock_resp == expected_stock, f"Stock mismatch for modifier {mod_req['name']}"
                # Validate isAvailable with default True
                is_avail_resp = found_mod.get('isAvailable', True)
                expected_is_avail = mod_req.get('isAvailable', True)
                assert is_avail_resp == expected_is_avail, f"isAvailable mismatch for modifier {mod_req['name']}"

        # Validate base product fields in response if present
        if 'name' in data:
            assert data['name'] == product_payload['name'], "Product name mismatch in response"
        elif 'product' in data and 'name' in data['product']:
            assert data['product']['name'] == product_payload['name'], "Product name mismatch in response"

    finally:
        # Cleanup: delete created product if exists
        if product_id:
            try:
                del_resp = requests.delete(f"{BASE_URL}/admin/products/{product_id}",
                                          headers=HEADERS_ADMIN, timeout=30)
                # Deletion may respond 200 or 204; not strictly validated here
            except Exception:
                pass


test_create_product_with_nested_modifier_groups()