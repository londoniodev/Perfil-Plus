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
    private bucket: string;
    private endpoint: string;
    private publicUrl: string;

    constructor(private configService: ConfigService) {
        this.endpoint = this.configService.get('S3_ENDPOINT', 'http://localhost:9000');
        this.bucket = this.configService.get('S3_BUCKET', 'mauro-web');
        this.publicUrl = this.configService.get('S3_PUBLIC_URL', this.endpoint);

        this.s3Client = new S3Client({
            endpoint: this.endpoint,
            region: this.configService.get('S3_REGION', 'us-east-1'),
            credentials: {
                accessKeyId: this.configService.get('S3_ACCESS_KEY', ''),
                secretAccessKey: this.configService.get('S3_SECRET_KEY', ''),
            },
            forcePathStyle: true, // Necesario para Minio
        });
    }

    async uploadFile(
        file: Express.Multer.File,
        folder: string = 'uploads',
    ): Promise<UploadResult> {
        const extension = file.originalname.split('.').pop()?.toLowerCase();
        const key = `${folder}/${uuidv4()}.${extension}`;

        try {
            await this.s3Client.send(
                new PutObjectCommand({
                    Bucket: this.bucket,
                    Key: key,
                    Body: file.buffer,
                    ContentType: file.mimetype,
                }),
            );

            return {
                key,
                url: `${this.publicUrl}/${this.bucket}/${key}`,
                bucket: this.bucket,
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
    ): Promise<UploadResult> {
        const extension = filename.split('.').pop()?.toLowerCase();
        const key = `${folder}/${uuidv4()}.${extension}`;

        try {
            await this.s3Client.send(
                new PutObjectCommand({
                    Bucket: this.bucket,
                    Key: key,
                    Body: buffer,
                    ContentType: contentType,
                }),
            );

            return {
                key,
                url: `${this.publicUrl}/${this.bucket}/${key}`,
                bucket: this.bucket,
            };
        } catch (error) {
            throw new BadRequestException('Error al subir el archivo');
        }
    }

    async deleteFile(key: string): Promise<void> {
        try {
            await this.s3Client.send(
                new DeleteObjectCommand({
                    Bucket: this.bucket,
                    Key: key,
                }),
            );
        } catch (error) {
            throw new BadRequestException('Error al eliminar el archivo');
        }
    }

    async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
        try {
            const command = new GetObjectCommand({
                Bucket: this.bucket,
                Key: key,
            });

            return await getSignedUrl(this.s3Client, command, { expiresIn });
        } catch (error) {
            throw new BadRequestException('Error al generar URL firmada');
        }
    }

    getPublicUrl(key: string): string {
        return `${this.publicUrl}/${this.bucket}/${key}`;
    }
}
