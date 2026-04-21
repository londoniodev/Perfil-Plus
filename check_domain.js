const { Client } = require('pg');
const c = new Client('postgresql://postgres:alvarojose1998@72.62.161.199:5432/web-projects');

c.connect()
  .then(() => c.query('SELECT slug, domain FROM "Tenant" WHERE slug = $1', ['soydeborasoysaludable']))
  .then(r => console.log('TENANT:', r.rows))
  .catch(console.error)
  .finally(() => c.end());
