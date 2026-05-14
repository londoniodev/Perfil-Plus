import pg from 'pg';
const { Client } = pg;

async function fixMenu() {
  const client = new Client({ connectionString: 'postgresql://postgres:alvarojose1998@72.62.161.199:5432/web-projects' });
  await client.connect();

  const tenantRes = await client.query("SELECT id FROM \"Tenant\" WHERE slug = 'gesco'");
  const tenantId = tenantRes.rows[0].id;

  const settingRes = await client.query("SELECT id, value FROM \"SystemSetting\" WHERE \"tenantId\" = $1 AND key = 'menu'", [tenantId]);
  const settingId = settingRes.rows[0].id;
  const menuData = settingRes.rows[0].value;

  const correctLinks = [
    { label: "Inicio", href: "/home" },
    { label: "Quiénes Somos", href: "/quienes-somos" },
    { label: "Áreas de Práctica", href: "/areas-de-practica" },
    { label: "Modalidades del Servicio", href: "/modalidades-del-servicio" },
    { label: "Contacto", href: "/contacto" },
    { label: "Nuestros Clientes", href: "/nuestros-clientes" }
  ];

  menuData.headerLinks = correctLinks;

  await client.query("UPDATE \"SystemSetting\" SET value = $1 WHERE id = $2", [JSON.stringify(menuData), settingId]);
  
  console.log("Menu fixed successfully!");
  await client.end();
}

fixMenu().catch(console.error);
