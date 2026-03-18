async function run() {
    try {
        const res = await fetch('http://127.0.0.1:3001/api/store/products?tenantId=cm7mman6x000208jsf3h9h2k1&allVariants=true', {
            headers: { 'x-tenant-id': 'cm7mman6x000208jsf3h9h2k1' }
        });
        if (res.ok) {
            const data = await res.json();
            console.log("Keys of first product:", Object.keys(data[0] || {}));
            if (data[0]) {
               console.log("Full First Product JSON:", JSON.stringify(data[0], null, 2));
            }
        } else {
            console.log("Response not OK", res.status);
        }
    } catch (e) {
        console.error("Error", e);
    }
}
run();
