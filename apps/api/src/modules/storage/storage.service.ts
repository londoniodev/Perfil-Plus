import { Injectable, BadRequestException, Scope, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand,
    GetObjectCommand,
    CreateBucketCommand,
    HeadBucketCommand,
    PutBucketPolicyCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';

export interface UploadResult {
    key: string;
    url: string;
    bucket: string;
}

@Injectable({ scope: Scope.REQUEST })
export class StorageService {
    private s3Client: S3Client;
    private endpoint: string;
    private publicUrl: string;

    // Cache estático para no verificar existencia del bucket en cada request
    private static verifiedBuckets = new Set<string>();

    constructor(
        @Inject(REQUEST) private request: Request,
        private configService: ConfigService
    ) {
        this.endpoint = this.configService.get('S3_ENDPOINT', 'http://localhost:9000');
        this.publicUrl = this.configService.get('S3_PUBLIC_URL', this.endpoint);

        this.s3Client = new S3Client({
            endpoint: this.endpoint,
            region: this.configService.get('S3_REGION', 'us-east-1'),
            credentials: {
                accessKeyId: this.configService.get('S3_ACCESS_KEY', ''),
                secretAccessKey: this.configService.get('S3_SECRET_KEY', ''),
            },
            forcePathStyle: true,
        });
    }

    private getTenantId(): string {
        const tenantId = this.request.headers['x-tenant-id'];
        if (!tenantId) return 'default'; // Fallback seguro, aunque debería venir del guard
        // Sanitizar para que sea válido en S3 (solo minúsculas, números y guiones)
        return (tenantId as string).toLowerCase().replace(/[^a-z0-9-]/g, '');
    }

    private getBucketName(isPrivate: boolean): string {
        const tenantId = this.getTenantId();
        const suffix = isPrivate ? 'private' : 'public';
        return `${tenantId}-${suffix}`;
    }

    private async ensureBucketExists(bucket: string, isPrivate: boolean): Promise<void> {
        if (StorageService.verifiedBuckets.has(bucket)) return;

        try {
            await this.s3Client.send(new HeadBucketCommand({ Bucket: bucket }));
            StorageService.verifiedBuckets.add(bucket);
        } catch (error) {
            // Si error es 404 (NotFound), creamos el bucket
            // AWS SDK v3 lanza error normal, chequeamos si es NotFound
            try {
                console.log(`Bucket ${bucket} not found. Creating...`);
                await this.s3Client.send(new CreateBucketCommand({ Bucket: bucket }));

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
            await this.s3Client.send(
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
        const bucket = this.getBucketName(isPrivate);
        await this.ensureBucketExists(bucket, isPrivate);

        const extension = file.originalname.split('.').pop()?.toLowerCase();
        const key = `${folder}/${randomUUID()}.${extension}`;

        try {
            await this.s3Client.send(
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
        const bucket = this.getBucketName(isPrivate);
        await this.ensureBucketExists(bucket, isPrivate);

        const extension = filename.split('.').pop()?.toLowerCase();
        const key = `${folder}/${randomUUID()}.${extension}`;

        try {
            await this.s3Client.send(
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
        const bucket = this.getBucketName(isPrivate);

        try {
            await this.s3Client.send(
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

        try {
            const command = new GetObjectCommand({
                Bucket: bucket,
                Key: key,
            });

            return await getSignedUrl(this.s3Client, command, { expiresIn });
        } catch (error) {
            throw new BadRequestException('Error al generar URL firmada');
        }
    }

    getPublicUrl(key: string): string {
        const bucket = this.getBucketName(false);
        return `${this.publicUrl}/${bucket}/${key}`;
    }
}

