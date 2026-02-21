
async function main() {
    const API_URL = 'http://127.0.0.1:3001/api';

    console.log('--- Debugging Employees API ---');

    // 1. Login as Mesero
    console.log('1. Attempting login as mesero@demo.com...');
    try {
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'mesero@demo.com',
                password: 'staff123456'
            })
        });

        console.log(`   Login Status: ${loginRes.status}`);
        if (!loginRes.ok) {
            console.error('   Login failed:', await loginRes.text());
            return;
        }

        const loginData = await loginRes.json();
        const token = loginData.accessToken;
        console.log('   Login successful. Token preview:', token.substring(0, 20) + '...');

        // 2. Fetch Employees (Expect 403 for Mesero, but proves reachability)
        console.log('\n2. Fetching /admin/employees...');
        const empRes = await fetch(`${API_URL}/admin/employees`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log(`   Fetch Status: ${empRes.status}`);
        const empText = await empRes.text();
        console.log(`   Fetch Body:`, empText.substring(0, 500));

        if (empRes.status === 403) {
            console.log('\n✅ 403 Forbidden received. Backend IS reachable and Auth is working.');
        } else if (empRes.status === 200) {
            console.log('\n✅ 200 OK received. Endpoint accessible!');
        } else {
            console.log('\n⚠️ Unexpected status code.');
        }

    } catch (e) {
        console.error('\n❌ Network/Script Error:', e);
    }
}

main();
