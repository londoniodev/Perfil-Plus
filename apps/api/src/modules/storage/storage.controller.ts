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
  constructor(private readonly storageService: StorageService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 50 * 1024 * 1024 }), // 50MB
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
    @Query('folder') folder?: string,
  ) {
    console.log('Upload File Request Received:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      folder,
    });
    return this.storageService.uploadFile(file, folder || 'uploads');
  }

  @Post('upload/image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // Aumentado a 10MB temporalmente
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
    @Query('folder') folder?: string,
  ) {
    console.log('Upload Image Request Received:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      folder,
    });

    // Validación manual de tipo si es necesario
    if (!file.mimetype.match(/(jpg|jpeg|png|gif|webp|avif)$/i)) {
      console.warn('Invalid mimetype detected:', file.mimetype);
    }

    // Respetamos folder o pasamos default 'images', para poder tener /branding/logo.png, etc.
    return this.storageService.uploadFile(file, folder || 'images');
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
