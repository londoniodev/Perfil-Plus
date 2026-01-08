import {
    Controller,
    Post,
    Delete,
    Param,
    UseInterceptors,
    UploadedFile,
    ParseFilePipe,
    MaxFileSizeValidator,
    FileTypeValidator,
    Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from './storage.service';
import { Roles } from '../../common/decorators';
import { Role } from '@prisma/client';

@Controller('storage')
@Roles(Role.ADMIN)
export class StorageController {
    constructor(private readonly storageService: StorageService) { }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
                    new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif|webp|avif|pdf|mp4|webm)$/i }),
                ],
            }),
        )
        file: Express.Multer.File,
        @Query('folder') folder?: string,
    ) {
        return this.storageService.uploadFile(file, folder || 'uploads');
    }

    @Post('upload/image')
    @UseInterceptors(FileInterceptor('file'))
    async uploadImage(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
                    new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif|webp|avif)$/i }),
                ],
            }),
        )
        file: Express.Multer.File,
    ) {
        return this.storageService.uploadFile(file, 'images');
    }

    @Post('upload/video')
    @UseInterceptors(FileInterceptor('file'))
    async uploadVideo(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 500 * 1024 * 1024 }), // 500MB
                    new FileTypeValidator({ fileType: /(mp4|webm|mov)$/i }),
                ],
            }),
        )
        file: Express.Multer.File,
    ) {
        return this.storageService.uploadFile(file, 'videos');
    }

    @Post('upload/ebook')
    @UseInterceptors(FileInterceptor('file'))
    async uploadEbook(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 50 * 1024 * 1024 }), // 50MB
                    new FileTypeValidator({ fileType: /(pdf|epub)$/i }),
                ],
            }),
        )
        file: Express.Multer.File,
    ) {
        return this.storageService.uploadFile(file, 'ebooks', true);
    }

    @Delete(':key')
    async deleteFile(@Param('key') key: string) {
        await this.storageService.deleteFile(key);
        return { message: 'Archivo eliminado correctamente' };
    }
}
