async function testLogin() {
  try {
    const res = await fetch("https://api.xn--alvarolondoo-khb.dev/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-tenant-id": "cmmxgzguj0001mu32xctbhkmb"
      },
      body: JSON.stringify({
        email: "soydeborasoysaludable@gmail.com",
        password: "Gordolindo0218*"
      })
    });
    
    const data = await res.json();
    console.log("Status:", res.status);
    console.log("Response:", data);
  } catch(e) {
    console.error(e);
  }
}

testLogin();
