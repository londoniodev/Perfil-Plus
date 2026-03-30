import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const updates = [
    { id: 'i_jamon_t', name: 'Jamón de Ternera' },
    { id: 'i_jamon_c', name: 'Jamón de Cerdo' },
    { id: 'i_jamon_co', name: 'Jamón de Cordero' },
    { id: 'i_jamon_p', name: 'Jamón de Pavo' },
    { id: 'i_champ', name: 'Champiñones' },
    { id: 'i_bufalo', name: 'Salsa Búfalo (Picante)' },
    { id: 'i_papas', name: 'Papas a la francesa (Porción)' },
    { id: 'i_azucar', name: 'Azúcar' },
    { id: 'i_zumo_limon', name: 'Zumo de Limón' },
    { id: 'i_vaso_carton', name: 'Vaso de Cartón' },
    { id: 'i_pina', name: 'Piña' }
  ];

  let updated = 0;
  for (const item of updates) {
    try {
      await prisma.inventoryItem.update({
        where: { id: item.id },
        data: { name: item.name }
      });
      updated++;
      console.log(`Updated ${item.id} -> ${item.name}`);
    } catch (e) {
      console.error(`Failed to update ${item.id}:`, e.message);
    }
  }
  
  console.log(`Successfully updated ${updated} items.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
