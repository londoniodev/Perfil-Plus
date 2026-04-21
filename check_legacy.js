const { Client } = require('pg');
const c = new Client('postgresql://postgres:alvarojose1998@72.62.161.199:5432/web-projects');

c.connect()
  .then(() => c.query('SELECT id FROM "Tenant" WHERE slug = $1', ['soydeborasoysaludable']))
  .then(r => {
    const links = [
      {href: '/quien-soy', label: 'Mi Historia'},
      {href: '/servicios', label: 'Servicios'},
      {href: '/emprende', label: 'Emprendimiento'}
    ];
    return c.query(
      'INSERT INTO "SystemSetting" (id, "tenantId", key, value, "isPublic", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) ON CONFLICT ("tenantId", key) DO UPDATE SET value = $4, "updatedAt" = NOW()',
      ['id_customlinks', r.rows[0].id, 'customLinks', JSON.stringify(links), true]
    );
  })
  .then(() => console.log('Legacy customLinks inserted!'))
  .catch(console.error)
  .finally(() => c.end());
