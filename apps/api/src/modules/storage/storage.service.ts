import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand,
    GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

export interface UploadResult {
    key: string;
    url: string;
    bucket: string;
}

@Injectable()
export class StorageService {
    private s3Client: S3Client;
    private publicBucket: string;
    private privateBucket: string;
    private endpoint: string;
    private publicUrl: string;

    constructor(private configService: ConfigService) {
        this.endpoint = this.configService.get('S3_ENDPOINT', 'http://localhost:9000');

        // Buckets
        this.publicBucket = this.configService.get('S3_BUCKET_PUBLIC', 'mauro-public');
        this.privateBucket = this.configService.get('S3_BUCKET_PRIVATE', 'mauro-private');

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

    async uploadFile(
        file: Express.Multer.File,
        folder: string = 'uploads',
        isPrivate: boolean = false,
    ): Promise<UploadResult> {
        const bucket = isPrivate ? this.privateBucket : this.publicBucket;
        const extension = file.originalname.split('.').pop()?.toLowerCase();
        const key = `${folder}/${uuidv4()}.${extension}`;

        try {
            await this.s3Client.send(
                new PutObjectCommand({
                    Bucket: bucket,
                    Key: key,
                    Body: file.buffer,
                    ContentType: file.mimetype,
                }),
            );

            // Si es privado, no devolvemos URL pública, sino una referencia o vacío
            const url = isPrivate
                ? `${key}` // Solo retornamos la key para archivos privados
                : `${this.publicUrl}/${bucket}/${key}`;

            return {
                key,
                url,
                bucket,
            };
        } catch (error) {
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
        const bucket = isPrivate ? this.privateBucket : this.publicBucket;
        const extension = filename.split('.').pop()?.toLowerCase();
        const key = `${folder}/${uuidv4()}.${extension}`;

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

            return {
                key,
                url,
                bucket,
            };
        } catch (error) {
            throw new BadRequestException('Error al subir el archivo');
        }
    }

    async deleteFile(key: string, isPrivate: boolean = false): Promise<void> {
        try {
            await this.s3Client.send(
                new DeleteObjectCommand({
                    Bucket: isPrivate ? this.privateBucket : this.publicBucket,
                    Key: key,
                }),
            );
        } catch (error) {
            throw new BadRequestException('Error al eliminar el archivo');
        }
    }

    async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
        try {
            // Asumimos que si piden signed URL es del bucket privado
            const command = new GetObjectCommand({
                Bucket: this.privateBucket,
                Key: key,
            });

            return await getSignedUrl(this.s3Client, command, { expiresIn });
        } catch (error) {
            throw new BadRequestException('Error al generar URL firmada');
        }
    }

    getPublicUrl(key: string): string {
        return `${this.publicUrl}/${this.publicBucket}/${key}`;
    }
}
