import { Module } from '@nestjs/common';
import { EbooksController, AdminEbooksController } from './ebooks.controller';
import { EbooksService } from './ebooks.service';
import { StorageModule } from '../storage/storage.module';

@Module({
    imports: [StorageModule],
    controllers: [EbooksController, AdminEbooksController],
    providers: [EbooksService],
    exports: [EbooksService],
})
export class EbooksModule { }

