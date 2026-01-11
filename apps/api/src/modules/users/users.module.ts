import { Module, forwardRef } from '@nestjs/common';
import { UsersController, AdminUsersController } from './users.controller';
import { UsersService } from './users.service';
import { PaymentsModule } from '../payments/payments.module';

@Module({
    imports: [forwardRef(() => PaymentsModule)],
    controllers: [UsersController, AdminUsersController],
    providers: [UsersService],
    exports: [UsersService],
})
export class UsersModule { }
