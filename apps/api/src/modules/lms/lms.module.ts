import { Module } from '@nestjs/common';
import { LmsController, AdminLmsController } from './lms.controller';
import { LmsService } from './lms.service';
import { EvaluationService } from './evaluation.service';

@Module({
    controllers: [LmsController, AdminLmsController],
    providers: [LmsService, EvaluationService],
    exports: [LmsService, EvaluationService],
})
export class LmsModule { }

