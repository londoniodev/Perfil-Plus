
import { PrismaClient } from '../generated/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding database...')

    const mauro = await prisma.tenant.upsert({
        where: { slug: 'mauro' },
        update: {
            features: ['shop', 'blog', 'lms'] // Ensure features are set
        },
        create: {
            name: 'Mauro Mera',
            slug: 'mauro',
            dbName: 'db_mauromera',
            status: 'ACTIVE',
            plan: 'pro',
            features: ['shop', 'blog', 'lms'],
            design: {
                primary: "zinc",
                radius: 0.5,
                density: "default"
            }
        },
    })

    console.log('Seeded tenant:', mauro)
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
