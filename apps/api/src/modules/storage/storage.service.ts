import {
  Injectable,
  BadRequestException,
  Scope,
  Inject,
  Logger,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import * as fs from 'fs/promises';
import { join } from 'path';
import sharp from 'sharp';
import { PrismaService } from '../../prisma/prisma.service';
import {
  getStorageSlug,
  getBucketName as resolveBucketName,
} from '@alvarosky/shared';

/** Perfiles de optimización de imagen por carpeta */
interface ImageProfile {
  maxWidth: number;
  maxHeight: number;
  quality: number;
}

const IMAGE_PROFILES: Record<string, ImageProfile> = {
  products: { maxWidth: 1200, maxHeight: 1200, quality: 82 },
  branding: { maxWidth: 1920, maxHeight: 1920, quality: 85 }, // Aumentado para soportar Hero Images
  images: { maxWidth: 1024, maxHeight: 1024, quality: 80 },
  uploads: { maxWidth: 1024, maxHeight: 1024, quality: 80 },
};

const IMAGE_MIMETYPES = /^image\/(jpeg|jpg|png|gif|webp|avif|tiff|bmp)$/i;

export interface UploadResult {
  key: string;
  url: string;
  bucket: string;
}

@Injectable({ scope: Scope.REQUEST })
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private s3Client: any = null;
  private endpoint: string;
  private publicUrl: string;

  // Cache estático para no verificar existencia del bucket en cada request
  private static verifiedBuckets = new Set<string>();

  constructor(
    @Inject(REQUEST) private request: Request,
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.endpoint = this.configService.get(
      'S3_ENDPOINT',
      'http://localhost:9000',
    );
    // Si es local, la URL pública base es diferente
    if (this.configService.get('STORAGE_DRIVER') === 'local') {
      const apiUrl =
        this.configService.get('API_URL') ||
        `http://localhost:${this.configService.get('PORT') || 3001}`;
      this.publicUrl = `${apiUrl}/uploads`;
    } else {
      this.publicUrl = this.configService.get('S3_PUBLIC_URL', this.endpoint);
    }
  }

  private async getS3Client() {
    if (this.s3Client) return this.s3Client;

    const { S3Client } = await import('@aws-sdk/client-s3');

    this.s3Client = new S3Client({
      endpoint: this.endpoint,
      region: this.configService.get('S3_REGION', 'us-east-1'),
      credentials: {
        accessKeyId: this.configService.get('S3_ACCESS_KEY', ''),
        secretAccessKey: this.configService.get('S3_SECRET_KEY', ''),
      },
      forcePathStyle: true,
      // Añadir timeout para evitar colgar la API si el DNS falla
      requestHandler: {
        connectionTimeout: 5000,
        requestTimeout: 10000,
      } as any,
    });

    return this.s3Client;
  }

  private async getTenantId(): Promise<string> {
    // Prioridad 1: tenantId del JWT (el tenant REAL del usuario autenticado)
    // En saas_dashboard, el header x-tenant-id contiene "admin_build" (el ID del dashboard),
    // NO el tenant del usuario. Por eso el JWT tiene prioridad absoluta.
    const user = (this.request as any).user;
    if (user?.tenantId) {
      try {
        const tenantInfo = await this.prisma.secure.tenant.findUnique({
          where: { id: user.tenantId },
          select: { slug: true },
        });

        if (tenantInfo?.slug) {
          return getStorageSlug(tenantInfo.slug);
        }
      } catch (error: any) {
        this.logger.error(
          `[StorageService] Error resolviendo slug de tenantId: ${error.message || error}`,
        );
      }

      // Si falla la búsqueda del slug, usamos el CUID como fallback
      return getStorageSlug(user.tenantId);
    }

    // Prioridad 2: header x-tenant-id (SOLO para rutas públicas sin autenticación)
    const headerTenantId = this.request.headers['x-tenant-id'];
    if (headerTenantId) {
      return getStorageSlug(headerTenantId as string);
    }

    return 'default';
  }

  private async getBucketName(isPrivate: boolean): Promise<string> {
    const tenantSlug = await this.getTenantId();
    return resolveBucketName(tenantSlug, isPrivate);
  }

  private async ensureBucketExists(
    bucket: string,
    isPrivate: boolean,
  ): Promise<void> {
    if (StorageService.verifiedBuckets.has(bucket)) return;

    const client = await this.getS3Client();
    const { HeadBucketCommand, CreateBucketCommand } =
      await import('@aws-sdk/client-s3');

    try {
      await client.send(new HeadBucketCommand({ Bucket: bucket }));
      StorageService.verifiedBuckets.add(bucket);
    } catch (error) {
      // Si error es 404 (NotFound), creamos el bucket
      try {
        this.logger.log(`Bucket ${bucket} not found. Creating...`);
        await client.send(new CreateBucketCommand({ Bucket: bucket }));

        if (!isPrivate) {
          await this.setPublicPolicy(bucket);
        }

        StorageService.verifiedBuckets.add(bucket);
        this.logger.log(`Bucket ${bucket} created successfully.`);
      } catch (createError: any) {
        this.logger.error(
          `Failed to create bucket ${bucket}: ${createError.message || createError}`,
        );
        throw new BadRequestException(
          `No se pudo crear el almacenamiento para ${bucket}`,
        );
      }
    }
  }

  /**
   * Aprovisiona preventivamente los buckets público y privado para un nuevo Tenant.
   */
  async provisionBuckets(tenantSlug: string): Promise<void> {
    const publicBucket = resolveBucketName(tenantSlug, false);
    const privateBucket = resolveBucketName(tenantSlug, true);

    this.logger.log(
      `[STORAGE] Aprovisionando buckets para Tenant: ${tenantSlug}`,
    );
    await this.ensureBucketExists(publicBucket, false);
    await this.ensureBucketExists(privateBucket, true);
  }

  private async setPublicPolicy(bucket: string) {
    const client = await this.getS3Client();
    const { PutBucketPolicyCommand } = await import('@aws-sdk/client-s3');

    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'PublicReadGetObject',
          Effect: 'Allow',
          Principal: '*',
          Action: 's3:GetObject',
          Resource: `arn:aws:s3:::${bucket}/*`,
        },
      ],
    };

    try {
      await client.send(
        new PutBucketPolicyCommand({
          Bucket: bucket,
          Policy: JSON.stringify(policy),
        }),
      );
    } catch (error: any) {
      this.logger.error(
        `Error setting public policy for ${bucket}: ${error.message || error}`,
      );
      // No lanzamos error fatal, pero logueamos
    }
  }

  /**
   * Optimizar imagen: redimensionar + convertir a WebP con calidad configurable.
   * Retorna { buffer, contentType, extension } optimizados.
   */
  private async optimizeImage(
    buffer: Buffer,
    mimetype: string,
    folder: string,
  ): Promise<{ buffer: Buffer; contentType: string; extension: string }> {
    // Solo optimizar si es una imagen
    if (!IMAGE_MIMETYPES.test(mimetype)) {
      const ext = mimetype.split('/').pop() || 'bin';
      return { buffer, contentType: mimetype, extension: ext };
    }

    const profile = IMAGE_PROFILES[folder] || IMAGE_PROFILES['uploads'];
    const originalSize = buffer.length;

    try {
      const optimized = await sharp(buffer)
        .resize(profile.maxWidth, profile.maxHeight, {
          fit: 'inside', // Mantener aspecto, nunca estirar
          withoutEnlargement: true, // No agrandar imágenes pequeñas
        })
        .webp({ quality: profile.quality })
        .toBuffer();

      const savedPercent = Math.round(
        (1 - optimized.length / originalSize) * 100,
      );

      return {
        buffer: optimized,
        contentType: 'image/webp',
        extension: 'webp',
      };
    } catch (error) {
      this.logger.warn(
        `[IMAGE OPT] No se pudo optimizar (${mimetype}), subiendo original`,
        error,
      );
      const ext = mimetype.split('/').pop() || 'bin';
      return { buffer, contentType: mimetype, extension: ext };
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'uploads',
    isPrivate: boolean = false,
  ): Promise<UploadResult> {
    const isImage = IMAGE_MIMETYPES.test(file.mimetype);
    const optimized = isImage
      ? await this.optimizeImage(file.buffer, file.mimetype, folder)
      : null;

    const finalBuffer = optimized?.buffer ?? file.buffer;
    const finalContentType = optimized?.contentType ?? file.mimetype;
    const finalExtension =
      optimized?.extension ?? file.originalname.split('.').pop()?.toLowerCase();

    const fileName = `${randomUUID()}.${finalExtension}`;

    return this.saveToStorage(
      fileName,
      finalBuffer,
      finalContentType,
      folder,
      isPrivate,
    );
  }

  async uploadBuffer(
    buffer: Buffer,
    filename: string,
    contentType: string,
    folder: string = 'uploads',
    isPrivate: boolean = false,
  ): Promise<UploadResult> {
    const extension = filename.split('.').pop()?.toLowerCase() || 'bin';
    const fileName = `${randomUUID()}.${extension}`;

    return this.saveToStorage(fileName, buffer, contentType, folder, isPrivate);
  }

  private async saveToStorage(
    fileName: string,
    buffer: Buffer,
    contentType: string,
    folder: string,
    isPrivate: boolean,
  ): Promise<UploadResult> {
    const driver = this.configService.get('STORAGE_DRIVER', 's3');

    if (driver === 'local') {
      const tenantId = await this.getTenantId();
      const uploadDir = join(process.cwd(), 'uploads', tenantId, folder);

      try {
        await fs.mkdir(uploadDir, { recursive: true });
        await fs.writeFile(join(uploadDir, fileName), buffer);

        const key = `${folder}/${fileName}`;
        const url = `${this.publicUrl}/${tenantId}/${key}`;

        return { key, url, bucket: 'local' };
      } catch (error: any) {
        this.logger.error(`Local Upload Error: ${error.message || error}`);
        throw new BadRequestException('Error al subir el archivo localmente');
      }
    }

    const bucket = await this.getBucketName(isPrivate);
    await this.ensureBucketExists(bucket, isPrivate);

    const client = await this.getS3Client();
    const { PutObjectCommand } = await import('@aws-sdk/client-s3');

    const key = `${folder}/${fileName}`;

    try {
      await client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: buffer,
          ContentType: contentType,
        }),
      );

      const url = isPrivate ? `${key}` : `${this.publicUrl}/${bucket}/${key}`;

      return { key, url, bucket };
    } catch (error: any) {
      this.logger.error(`S3 Upload Error: ${error.message || error}`);
      throw new BadRequestException(
        'Error al subir el archivo al almacenamiento S3',
      );
    }
  }

  async deleteFile(key: string, isPrivate: boolean = false): Promise<void> {
    const driver = this.configService.get('STORAGE_DRIVER', 's3');

    if (driver === 'local') {
      const tenantId = await this.getTenantId();
      // key tiene formato "folder/filename.ext"
      const filePath = join(process.cwd(), 'uploads', tenantId, key);
      try {
        await fs.unlink(filePath);
      } catch (error: any) {
        // Ignoramos si no existe
        this.logger.warn(
          `Could not delete local file ${filePath}: ${error.message || error}`,
        );
      }
      return;
    }

    const bucket = await this.getBucketName(isPrivate);
    const client = await this.getS3Client();
    const { DeleteObjectCommand } = await import('@aws-sdk/client-s3');

    try {
      await client.send(
        new DeleteObjectCommand({
          Bucket: bucket,
          Key: key,
        }),
      );
    } catch (error) {
      throw new BadRequestException('Error al eliminar el archivo');
    }
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const bucket = await this.getBucketName(true); // Siempre asumimos privado para signed URLs
    const client = await this.getS3Client();
    const { GetObjectCommand } = await import('@aws-sdk/client-s3');
    const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner');

    try {
      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      return await getSignedUrl(client, command, { expiresIn });
    } catch (error) {
      throw new BadRequestException('Error al generar URL firmada');
    }
  }

  async getPresignedUrl(
    key: string,
    expiresIn: number = 86400,
  ): Promise<string> {
    return this.getSignedUrl(key, expiresIn);
  }

  async getPublicUrl(key: string): Promise<string> {
    const bucket = await this.getBucketName(false);
    return `${this.publicUrl}/${bucket}/${key}`;
  }

  /**
   * Sube un archivo HTML de landing directamente a la carpeta landings/ del bucket público.
   * Si el slug no es "home", intenta añadir el link a SystemSettings.customLinks.
   */
  async uploadLandingHtml(
    tenantSlug: string,
    pageSlug: string,
    buffer: Buffer,
    label?: string,
  ): Promise<UploadResult> {
    const bucket = resolveBucketName(tenantSlug, false);
    await this.ensureBucketExists(bucket, false);

    const client = await this.getS3Client();
    const { PutObjectCommand } = await import('@aws-sdk/client-s3');

    const key = `landings/${pageSlug}/body.html`;

    try {
      await client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: buffer,
          ContentType: 'text/html; charset=utf-8',
          CacheControl: 'public, max-age=3600',
        }),
      );

      // Si no es home o inicio, intentar registrar en menu.headerLinks para el Header dinamico
      const isHome = pageSlug === 'home' || pageSlug === 'inicio';
      if (!isHome) {
        await this.syncCustomLink(tenantSlug, pageSlug, label);
      }

      const url = `${this.publicUrl}/${bucket}/${key}`;
      return { key, url, bucket };
    } catch (error) {
      this.logger.error('Landing Upload Error:', error);
      throw new BadRequestException('Error al subir el HTML de la landing');
    }
  }

  private async syncCustomLink(
    tenantSlug: string,
    pageSlug: string,
    label?: string,
  ): Promise<void> {
    try {
      const resolvedLabel =
        label || pageSlug.charAt(0).toUpperCase() + pageSlug.slice(1);
      const targetHref = `/${pageSlug}`;
      this.logger.log(
        `[Landing Sync] Upsert link: "${resolvedLabel}" → ${targetHref} para ${tenantSlug}`,
      );

      // 1. Encontrar el tenantId por slug (usamos .raw para bypass de seguridad en acción de SuperAdmin)
      const tenant = await this.prisma.raw.tenant.findUnique({
        where: { slug: tenantSlug },
        select: { id: true },
      });

      if (!tenant) {
        this.logger.warn(`[Landing Sync] Tenant no encontrado: ${tenantSlug}`);
        return;
      }

      // 2. Buscar si ya existe la configuración de menú (clave 'menu')
      const setting = await this.prisma.raw.systemSetting.findFirst({
        where: {
          tenantId: tenant.id,
          key: 'menu',
        },
      });

      const menuData = (setting?.value as Record<string, any>) || {};
      const currentLinks: { label: string; href: string }[] = Array.isArray(
        menuData.headerLinks,
      )
        ? menuData.headerLinks
        : [];

      // 3. Upsert Semántico: actualizar label si href existe, push si es nuevo
      const existingIndex = currentLinks.findIndex(
        (l) => l.href === targetHref,
      );
      let updatedLinks: { label: string; href: string }[];

      if (existingIndex >= 0) {
        // ACTUALIZAR label existente
        updatedLinks = currentLinks.map((l, i) =>
          i === existingIndex ? { ...l, label: resolvedLabel } : l,
        );
        this.logger.log(
          `[Landing Sync] Label actualizado: "${currentLinks[existingIndex].label}" → "${resolvedLabel}"`,
        );
      } else {
        // PUSH nuevo enlace
        updatedLinks = [
          ...currentLinks,
          { label: resolvedLabel, href: targetHref },
        ];
        this.logger.log(
          `[Landing Sync] Enlace nuevo añadido: "${resolvedLabel}" (${targetHref})`,
        );
      }

      const updatedMenu = { ...menuData, headerLinks: updatedLinks };

      // 4. Upsert de la configuración de menú
      await this.prisma.raw.systemSetting.upsert({
        where: {
          tenantId_key: {
            tenantId: tenant.id,
            key: 'menu',
          },
        },
        update: {
          value: updatedMenu,
        },
        create: {
          tenantId: tenant.id,
          key: 'menu',
          value: updatedMenu,
          isPublic: true,
        },
      });
      this.logger.log(
        `[Landing Sync] menu.headerLinks sincronizado correctamente.`,
      );

      // 5. Disparar Revalidación Asíncrona (Avisa al SSR que limpie Caché)
      await this.triggerStorefrontRevalidation(tenantSlug);
    } catch (error) {
      this.logger.error(
        `[Landing Sync] No se pudo sincronizar el customLink:`,
        error,
      );
    }
  }

  /**
   * Dispara el Webhook de Revalidación en el Frontend Next.js
   * Evita CircularDependency con TenantService gestionándolo usando fetches nativos.
   */
  private async triggerStorefrontRevalidation(tenantId: string): Promise<void> {
    const nextjsRevalidationUrl =
      process.env.INTERNAL_STOREFRONT_URL ||
      (process.env.STOREFRONT_URL
        ? `${process.env.STOREFRONT_URL}/api/revalidate`
        : 'http://web:3000/api/revalidate');
    const secret =
      process.env.REVALIDATION_SECRET ||
      process.env.INTERNAL_API_KEY ||
      'default_dev_secret_key';

    try {
      const response = await fetch(nextjsRevalidationUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId, // Compatibilidad retro
          secret,
          path: '/', // Forzar recarga del Layout (SSOT Header)
        }),
        signal: AbortSignal.timeout(5000), // Timeout preventivo
      });

      if (!response.ok) {
        this.logger.error(
          `[Landing Sync] Revalidación fallida (${response.status}): ${await response.text()}`,
        );
      } else {
        this.logger.log(
          `[Landing Sync] Storefront Caché purgado para tenant ${tenantId}`,
        );
      }
    } catch (err: any) {
      this.logger.warn(
        `[Next.js ISR] Sin conexión con el Webhook en ${nextjsRevalidationUrl} (${err.message}). Se omite purga de caché.`,
      );
    }
  }

  /**
   * Obtiene la lista de landings publicadas leyendo los headerLinks desde DB
   * e inyectando siempre la vista principal (home).
   */
  async listLandings(tenantSlug: string) {
    const tenant = await this.prisma.raw.tenant.findUnique({
      where: { slug: tenantSlug },
      select: { id: true },
    });

    if (!tenant) throw new BadRequestException('Tenant no encontrado');

    const setting = await this.prisma.raw.systemSetting.findFirst({
      where: {
        tenantId: tenant.id,
        key: 'menu',
      },
    });

    const menuData = (setting?.value as Record<string, any>) || {};
    const headerLinks: { label: string; href: string }[] = Array.isArray(
      menuData.headerLinks,
    )
      ? menuData.headerLinks
      : [];

    const homeLink = { label: 'Inicio (Home)', href: '/home' };
    const filteredLinks = headerLinks.filter(
      (l) => l.href !== '/home' && l.href !== '/inicio',
    );

    const bucketName = `${tenantSlug}-public`;

    return [homeLink, ...filteredLinks].map((link) => {
      const slug = link.href.replace(/^\//, '');
      return {
        ...link,
        sourceUrl: `${this.publicUrl}/${bucketName}/landings/${slug}/body.html`,
      };
    });
  }
}
