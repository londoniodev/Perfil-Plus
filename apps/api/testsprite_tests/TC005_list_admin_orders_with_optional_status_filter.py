import requests

BASE_URL = 'http://localhost:3001/api'
TOKEN = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0LWFkbWluLXVzZXItaWQtMDAxIiwiZW1haWwiOiJhZG1pbkB0ZXN0c3ByaXRlLmNvbSIsInJvbGUiOiJBRE1JTiIsIm5hbWUiOiJUZXN0U3ByaXRlIEFkbWluIiwiaWF0IjoxNzcwOTUxOTA1LCJleHAiOjE3NzE1NTY3MDV9.I_Bt2FEfNZi11_3SqhXATyTJsMasliZA_L_VXxMmwFQ'
HEADERS = {
    'Authorization': TOKEN,
    'x-tenant-id': 'mauro',
    'Content-Type': 'application/json'
}
TIMEOUT = 30

def test_list_admin_orders_with_status_filter():
    # Test without status filter
    url = f"{BASE_URL}/admin/orders"
    try:
        response = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"
    assert response.status_code == 200, f"Expected status code 200 but got {response.status_code}"
    data = response.json()
    assert isinstance(data, list), "Response should be a list"
    for order in data:
        # Validate user info present
        user = order.get('user')
        assert user is not None, "Order should include user info"
        assert 'id' in user and 'email' in user, "User info should include id and email"
        # Validate items info
        items = order.get('items')
        assert isinstance(items, list), "Order items should be a list"
        for item in items:
            # Validate product details included
            product = item.get('product')
            assert product is not None, "Order item should include product details"
            assert 'id' in product and 'name' in product, "Product details should include id and name"
            # Validate modifiers for item
            modifiers = item.get('modifiers', [])
            assert isinstance(modifiers, list), "Modifiers should be a list"
            for mod in modifiers:
                assert 'id' in mod and 'name' in mod, "Modifier should include id and name"

    # Test with a valid status filter
    valid_status = "PREPARING"
    params = {'status': valid_status}
    try:
        response_status = requests.get(url, headers=HEADERS, params=params, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Request with status filter failed: {e}"
    assert response_status.status_code == 200, f"Expected status code 200 but got {response_status.status_code}"
    data_status = response_status.json()
    assert isinstance(data_status, list), "Response with status filter should be a list"
    for order in data_status:
        # Validate status field equals filter and user info exists
        assert 'status' in order, "Order should include status"
        assert order['status'] == valid_status, f"Order status expected {valid_status} but got {order['status']}"
        user = order.get('user')
        assert user is not None and 'id' in user and 'email' in user, "Order should include valid user info"
        items = order.get('items')
        assert isinstance(items, list), "Order items should be a list"
        for item in items:
            product = item.get('product')
            assert product is not None and 'id' in product and 'name' in product, "Product details should be in item"
            modifiers = item.get('modifiers', [])
            assert isinstance(modifiers, list), "Modifiers should be a list"
            for mod in modifiers:
                assert 'id' in mod and 'name' in mod, "Modifier should include id and name"

    # Test unauthorized access
    headers_no_auth = {
        'x-tenant-id': 'mauro',
        'Content-Type': 'application/json'
    }
    try:
        response_unauth = requests.get(url, headers=headers_no_auth, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Unauthorized request failed: {e}"
    assert response_unauth.status_code in (401, 403), f"Expected 401 or 403 for unauthorized but got {response_unauth.status_code}"


test_list_admin_orders_with_status_filter()