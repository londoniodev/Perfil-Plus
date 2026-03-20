import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';
import { S3Client, PutObjectCommand, HeadBucketCommand, CreateBucketCommand, PutBucketPolicyCommand } from '@aws-sdk/client-s3';
import { PrismaClient } from '@alvarosky/database';
import { randomUUID } from 'crypto';

// Configuración
const TENANT_ID = 'cmmxh26af0009mu323v0ctbel';
const TENANT_SLUG = 'cocinasiete';
const IMAGES_DIR = 'c:/Users/Pc/Desktop/ALVARO/REPOSITORIOS/Web Projects/PRODUCTOS';
const DB_URL = 'postgresql://postgres:alvarojose1998@72.62.161.199:5432/web-projects';

// S3 Credentials
const S3_CONFIG = {
  endpoint: 'https://s3.xn--alvarolondoo-khb.dev',
  region: 'us-east-1',
  accessKeyId: 'minioadmin',
  secretAccessKey: 'KJ<?k53Q8XG5Tj5sV2CXe}R4t$*ZgVBi',
  publicUrl: 'https://s3.xn--alvarolondoo-khb.dev',
};

const s3 = new S3Client({
  endpoint: S3_CONFIG.endpoint,
  region: S3_CONFIG.region,
  credentials: {
    accessKeyId: S3_CONFIG.accessKeyId,
    secretAccessKey: S3_CONFIG.secretAccessKey,
  },
  forcePathStyle: true,
});

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DB_URL,
    },
  },
});

const productsData = [
  { name: 'Hamburguesa', file: 'hamburguesa.jpg', price: 28000, description: 'Hamburguesa artesanal de res con queso, lechuga y tomate freso en pan brioche.', modifiers: ['Sin cebolla', 'Doble Queso', 'Sin salsa'] },
  { name: 'Salchipapa', file: 'salchipapa.jpg', price: 22000, description: 'Papas fritas con trozos de salchicha premium, bañadas en mezcla de salsas de la casa.', modifiers: ['Queso costeño', 'Extra salchicha'] },
  { name: 'Papas fritas', file: 'papas fritas.jpg', price: 10000, description: 'Porción generosa de papas fritas rústicas, crujientes por fuera y suaves por dentro.', modifiers: ['Con salsa extra'] },
  { name: 'Nuggets de pollo', file: 'nuggets de pollo.jpg', price: 18000, description: '8 piezas de nuggets de pechuga de pollo crocantes, acompañados de salsa BBQ.', modifiers: [] },
  { name: 'Aros de cebolla', file: 'aros de cebolla.jpg', price: 12000, description: 'Aros de cebolla apanados y fritos a la perfección.', modifiers: [] },
  { name: 'Brownie con helado', file: 'brownie con helado.jpg', price: 15000, description: 'Brownie caliente de chocolate semiamargo con bola de helado de vainilla.', modifiers: ['Salsas adicionales'] },
  { name: 'Batido de fresa', file: 'batido de fresa.jpg', price: 10000, description: 'Batido cremoso de fresas naturales.', modifiers: ['En leche', 'Sin azúcar'] },
  { name: 'Jugo natural', file: 'jugo natural.jpg', price: 8000, description: 'Jugos de frutas de temporada recién preparados.', modifiers: ['Fruta del día'] },
  { name: 'Limonada de cereza', file: 'limonada de cereza.jpg', price: 9500, description: 'Refrescante mezcla de limón y cerezas maduras.', modifiers: [] },
];

async function ensureBucket(bucket: string) {
  try {
    await s3.send(new HeadBucketCommand({ Bucket: bucket }));
    console.log(`Bucket ${bucket} already exists.`);
  } catch (err) {
    console.log(`Creating bucket ${bucket}...`);
    await s3.send(new CreateBucketCommand({ Bucket: bucket }));
    const policy = {
      Version: '2012-10-17',
      Statement: [{ Sid: 'PublicRead', Effect: 'Allow', Principal: '*', Action: 's3:GetObject', Resource: `arn:aws:s3:::${bucket}/*` }],
    };
    await s3.send(new PutBucketPolicyCommand({ Bucket: bucket, Policy: JSON.stringify(policy) }));
    console.log(`Bucket ${bucket} created with public policy.`);
  }
}

async function uploadImage(filePath: string, bucket: string): Promise<string> {
  const buffer = fs.readFileSync(filePath);
  const optimized = await sharp(buffer)
    .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();

  const key = `products/${randomUUID()}.webp`;
  await s3.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: optimized,
    ContentType: 'image/webp',
  }));

  return `${S3_CONFIG.publicUrl}/${bucket}/${key}`;
}

async function main() {
  const bucket = `${TENANT_SLUG}-public`;
  await ensureBucket(bucket);

  for (const item of productsData) {
    console.log(`Processing ${item.name}...`);
    const imagePath = path.join(IMAGES_DIR, item.file);
    if (!fs.existsSync(imagePath)) {
      console.error(`Image not found: ${imagePath}`);
      continue;
    }

    const imageUrl = await uploadImage(imagePath, bucket);
    const slug = item.name.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '');

    const product = await prisma.product.create({
      data: {
        name: item.name,
        slug: `${slug}-${randomUUID().slice(0, 4)}`,
        description: item.description,
        basePrice: item.price,
        productType: 'RESTAURANT',
        images: [imageUrl],
        published: true,
        isAvailable: true,
        tenantId: TENANT_ID,
        variants: {
          create: {
            sku: `${slug.toUpperCase()}-DEF`,
            price: item.price,
            stock: 100,
            isDefault: true,
            tenantId: TENANT_ID,
          }
        }
      }
    });

    if (item.modifiers.length > 0) {
      const group = await prisma.modifierGroup.create({
        data: {
          name: 'Opciones',
          minSelect: 0,
          maxSelect: 5,
          productId: product.id,
          tenantId: TENANT_ID,
        }
      });

      for (const modName of item.modifiers) {
        await prisma.modifier.create({
          data: {
            name: modName,
            priceAdjustment: 0, // Simplified for now
            groupId: group.id,
            tenantId: TENANT_ID,
          }
        });
      }
    }
    console.log(`Product created: ${product.name} with ID ${product.id}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
