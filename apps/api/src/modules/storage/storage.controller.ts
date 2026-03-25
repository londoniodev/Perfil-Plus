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
  Body,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from './storage.service';
import { Roles } from '../../common/decorators';
import { Role } from '@alvarosky/database';

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

  @Post('upload/attachment')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAttachment(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 50 * 1024 * 1024 }), // 50MB
          new FileTypeValidator({ fileType: /(pdf|epub|docx|zip|rar)$/i }), // Más flexible para adjuntos
        ],
      }),
    )
    file: Express.Multer.File,
    @Body('fileIntent') fileIntent?: string, // <-- NUEVO
  ) {
    // Lógica de Enrutamiento Dinámica
    const isPrivate = fileIntent === 'PRIVATE_ASSET';
    const folder = isPrivate ? 'ebooks' : 'attachments';

    return this.storageService.uploadFile(file, folder, isPrivate);
  }

  @Post('landing')
  @UseInterceptors(FileInterceptor('file'))
  async uploadLanding(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
          new FileTypeValidator({ fileType: 'text/html' }),
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
    @Body('tenantSlug') tenantSlug: string,
    @Body('pageSlug') pageSlug: string,
    @Body('label') label?: string,
  ) {
    if (!tenantSlug || !pageSlug) {
      throw new BadRequestException('tenantSlug and pageSlug are required');
    }
    return this.storageService.uploadLandingHtml(tenantSlug, pageSlug, file.buffer, label);
  }

  @Delete(':key')
  async deleteFile(@Param('key') key: string) {
    await this.storageService.deleteFile(key);
    return { message: 'Archivo eliminado correctamente' };
  }
}

