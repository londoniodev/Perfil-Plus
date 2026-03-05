import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { RecipesService } from './recipes.service';
import { InventoryCountsService } from './inventory-counts.service';
import { InventoryController } from './inventory.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [InventoryController],
  providers: [InventoryService, RecipesService, InventoryCountsService],
  exports: [InventoryService],
})
export class InventoryModule {}
