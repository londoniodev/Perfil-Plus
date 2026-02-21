import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const store = await prisma.storeSettings.findFirst()
    console.log("StoreSettings:", store)
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
