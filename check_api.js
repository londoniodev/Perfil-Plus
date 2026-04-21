const id = "cmmxgzguj0001mu32xctbhkmb";
fetch(`http://localhost:3001/api/tenant/branding`, {
  headers: {
    'x-tenant-id': id,
    'x-internal-token': 'default_dev_secret_key'
  }
})
.then(r => r.json())
.then(data => {
  console.log("DESIGN headerLinks:", data.headerLinks);
  console.log("DESIGN features:", data.features);
})
.catch(console.error);
