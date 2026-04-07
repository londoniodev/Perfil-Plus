import { Module } from '@nestjs/common';
import { BranchesController } from './branches.controller';
import { StoreBranchesController } from './store-branches.controller';
import { BranchesService } from './branches.service';

@Module({
  controllers: [BranchesController, StoreBranchesController],
  providers: [BranchesService],
  exports: [BranchesService],
})
export class BranchesModule {}
