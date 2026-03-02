import { Injectable, BadRequestException, Scope, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import * as fs from 'fs/promises';
import { join } from 'path';

export interface UploadResult {
    key: string;
    url: string;
    bucket: string;
}

@Injectable({ scope: Scope.REQUEST })
export class StorageService {
    private s3Client: any = null;
    private endpoint: string;
    private publicUrl: string;

    // Cache estático para no verificar existencia del bucket en cada request
    private static verifiedBuckets = new Set<string>();

    constructor(
        @Inject(REQUEST) private request: Request,
        private configService: ConfigService
    ) {
        this.endpoint = this.configService.get('S3_ENDPOINT', 'http://localhost:9000');
        // Si es local, la URL pública base es diferente
        if (this.configService.get('STORAGE_DRIVER') === 'local') {
            const apiUrl = this.configService.get('API_URL') || `http://localhost:${this.configService.get('PORT') || 3001}`;
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
        });

        return this.s3Client;
    }

    private getTenantId(): string {
        // Prioridad 1: header x-tenant-id (contiene el SLUG legible, ej: "cocinasiete")
        // El frontend lo envía desde NEXT_PUBLIC_TENANT_ID
        const headerTenantId = this.request.headers['x-tenant-id'];
        if (headerTenantId) {
            return (headerTenantId as string).toLowerCase().replace(/[^a-z0-9-]/g, '');
        }

        // Prioridad 2: tenantId del JWT (contiene el CUID, ej: "cm7mm6m7p000108js6k7p98w2")
        // Fallback para requests autenticados que no envían el header
        const user = (this.request as any).user;
        if (user?.tenantId) {
            return (user.tenantId as string).toLowerCase().replace(/[^a-z0-9-]/g, '');
        }

        return 'default';
    }

    private getBucketName(isPrivate: boolean): string {
        const tenantId = this.getTenantId();
        const suffix = isPrivate ? 'private' : 'public';
        return `${tenantId}-${suffix}`;
    }

    private async ensureBucketExists(bucket: string, isPrivate: boolean): Promise<void> {
        if (StorageService.verifiedBuckets.has(bucket)) return;

        const client = await this.getS3Client();
        const { HeadBucketCommand, CreateBucketCommand } = await import('@aws-sdk/client-s3');

        try {
            await client.send(new HeadBucketCommand({ Bucket: bucket }));
            StorageService.verifiedBuckets.add(bucket);
        } catch (error) {
            // Si error es 404 (NotFound), creamos el bucket
            // AWS SDK v3 lanza error normal, chequeamos si es NotFound
            try {
                console.log(`Bucket ${bucket} not found. Creating...`);
                await client.send(new CreateBucketCommand({ Bucket: bucket }));

                if (!isPrivate) {
                    await this.setPublicPolicy(bucket);
                }

                StorageService.verifiedBuckets.add(bucket);
                console.log(`Bucket ${bucket} created successfully.`);
            } catch (createError) {
                console.error(`Failed to create bucket ${bucket}:`, createError);
                throw new BadRequestException(`No se pudo crear el almacenamiento para ${bucket}`);
            }
        }
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
                })
            );
        } catch (error) {
            console.error(`Error setting public policy for ${bucket}`, error);
            // No lanzamos error fatal, pero logueamos
        }
    }

    async uploadFile(
        file: Express.Multer.File,
        folder: string = 'uploads',
        isPrivate: boolean = false,
    ): Promise<UploadResult> {
        const driver = this.configService.get('STORAGE_DRIVER', 's3');

        if (driver === 'local') {
            const tenantId = this.getTenantId();
            const extension = file.originalname.split('.').pop()?.toLowerCase();
            const fileName = `${randomUUID()}.${extension}`;

            // Estructura: uploads/<tenantId>/<folder>
            // Nota: isPrivate no impide acceso directo en local simple, pero podríamos moverlo a carpeta fuera de public
            const uploadDir = join(process.cwd(), 'uploads', tenantId, folder);

            try {
                await fs.mkdir(uploadDir, { recursive: true });
                await fs.writeFile(join(uploadDir, fileName), file.buffer);

                const key = `${folder}/${fileName}`;
                // URL: http://localhost:3001/uploads/<tenantId>/<folder>/<fileName>
                const url = `${this.publicUrl}/${tenantId}/${key}`;

                return { key, url, bucket: 'local' };
            } catch (error) {
                console.error('Local Upload Error:', error);
                throw new BadRequestException('Error al subir el archivo localmente');
            }
        }

        const bucket = this.getBucketName(isPrivate);
        await this.ensureBucketExists(bucket, isPrivate);

        const client = await this.getS3Client();
        const { PutObjectCommand } = await import('@aws-sdk/client-s3');

        const extension = file.originalname.split('.').pop()?.toLowerCase();
        const key = `${folder}/${randomUUID()}.${extension}`;

        try {
            await client.send(
                new PutObjectCommand({
                    Bucket: bucket,
                    Key: key,
                    Body: file.buffer,
                    ContentType: file.mimetype,
                }),
            );

            const url = isPrivate
                ? `${key}`
                : `${this.publicUrl}/${bucket}/${key}`;

            return { key, url, bucket };
        } catch (error) {
            console.error('S3 Upload Error:', error);
            throw new BadRequestException('Error al subir el archivo');
        }
    }

    async uploadBuffer(
        buffer: Buffer,
        filename: string,
        contentType: string,
        folder: string = 'uploads',
        isPrivate: boolean = false,
    ): Promise<UploadResult> {
        const driver = this.configService.get('STORAGE_DRIVER', 's3');

        if (driver === 'local') {
            const tenantId = this.getTenantId();
            const extension = filename.split('.').pop()?.toLowerCase();
            const fileName = `${randomUUID()}.${extension}`;

            const uploadDir = join(process.cwd(), 'uploads', tenantId, folder);

            try {
                await fs.mkdir(uploadDir, { recursive: true });
                await fs.writeFile(join(uploadDir, fileName), buffer);

                const key = `${folder}/${fileName}`;
                const url = `${this.publicUrl}/${tenantId}/${key}`;

                return { key, url, bucket: 'local' };
            } catch (error) {
                console.error('Local Upload Buffer Error:', error);
                throw new BadRequestException('Error al subir el archivo localmente');
            }
        }

        const bucket = this.getBucketName(isPrivate);
        await this.ensureBucketExists(bucket, isPrivate);

        const client = await this.getS3Client();
        const { PutObjectCommand } = await import('@aws-sdk/client-s3');

        const extension = filename.split('.').pop()?.toLowerCase();
        const key = `${folder}/${randomUUID()}.${extension}`;

        try {
            await client.send(
                new PutObjectCommand({
                    Bucket: bucket,
                    Key: key,
                    Body: buffer,
                    ContentType: contentType,
                }),
            );

            const url = isPrivate
                ? `${key}`
                : `${this.publicUrl}/${bucket}/${key}`;

            return { key, url, bucket };
        } catch (error) {
            console.error('S3 Upload Buffer Error:', error);
            throw new BadRequestException('Error al subir el archivo');
        }
    }

    async deleteFile(key: string, isPrivate: boolean = false): Promise<void> {
        const driver = this.configService.get('STORAGE_DRIVER', 's3');

        if (driver === 'local') {
            const tenantId = this.getTenantId();
            // key tiene formato "folder/filename.ext"
            const filePath = join(process.cwd(), 'uploads', tenantId, key);
            try {
                await fs.unlink(filePath);
            } catch (error) {
                // Ignoramos si no existe
                console.warn(`Could not delete local file ${filePath}`, error);
            }
            return;
        }

        const bucket = this.getBucketName(isPrivate);
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
        const bucket = this.getBucketName(true); // Siempre asumimos privado para signed URLs
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

    async getPresignedUrl(key: string, expiresIn: number = 86400): Promise<string> {
        return this.getSignedUrl(key, expiresIn);
    }

    getPublicUrl(key: string): string {
        const bucket = this.getBucketName(false);
        return `${this.publicUrl}/${bucket}/${key}`;
    }
}

