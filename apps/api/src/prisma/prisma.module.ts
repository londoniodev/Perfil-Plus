import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PrismaContext } from './prisma-context.service';

@Global()
@Module({
    providers: [PrismaService, PrismaContext],
    exports: [PrismaService, PrismaContext],
})
export class PrismaModule { }

