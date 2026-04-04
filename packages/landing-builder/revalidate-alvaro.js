async function revalidate() {
  const url = 'https://xn--alvarolondoo-khb.dev/api/webhooks/revalidate';
  const secret = '+UcWZxj1HH/yMXNldrFOXSLt171Kv0mOHPbWVAh4Qw0=';
  const tag = 'landings-alvarolondono';

  console.log(`🚀 Revalidando ${url} con tag ${tag}...`);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${secret}`
      },
      body: JSON.stringify({ tag })
    });

    const data = await response.text();
    console.log(`Status: ${response.status}`);
    console.log(`Response: ${data}`);
  } catch (err) {
    console.error('Error revalidating:', err);
  }
}

revalidate();
