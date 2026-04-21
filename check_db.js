const { Client } = require('pg');
const c = new Client('postgresql://postgres:alvarojose1998@72.62.161.199:5432/web-projects');

c.connect()
  .then(() => c.query('SELECT slug, features FROM "Tenant" WHERE slug = $1', ['soydeborasoysaludable']))
  .then(r => console.log('TENANT:', r.rows))
  .then(() => c.query('SELECT value FROM "SystemSetting" WHERE "tenantId" = (SELECT id FROM "Tenant" WHERE slug = $1) AND key = $2', ['soydeborasoysaludable', 'menu']))
  .then(r => console.log('MENU:', JSON.stringify(r.rows, null, 2)))
  .catch(console.error)
  .finally(() => c.end());
