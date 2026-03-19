async function testIdentify() {
  try {
    const res = await fetch("https://api.xn--alvarolondoo-khb.dev/api/tenant/identify?domain=soydeborasoysaludable", {
      method: "GET",
      headers: {
        "x-internal-token": "default_dev_secret_key"
      }
    });
    
    const data = await res.json();
    console.log("Status:", res.status);
    console.log("Response:", data);
  } catch(e) {
    console.error(e);
  }
}

testIdentify();
