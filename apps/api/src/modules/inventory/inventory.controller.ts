import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { RecipesService } from './recipes.service';
import { InventoryCountsService } from './inventory-counts.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentTenant } from '../../common/decorators';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@alvarosky/database';
import {
  CreateInventoryItemDto,
  UpdateInventoryItemDto,
  CreateWarehouseDto,
  StockEntryDto,
  StockExitDto,
  StockTransferDto,
} from './dto/inventory.dto';
import { CreateRecipeDto, UpdateRecipeDto } from './dto/recipe.dto';
import {
  CreateInventoryCountDto,
  CompleteInventoryCountDto,
} from './dto/inventory-count.dto';

@Controller('admin/inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class InventoryController {
  constructor(
    private readonly inventoryService: InventoryService,
    private readonly recipesService: RecipesService,
    private readonly countsService: InventoryCountsService,
  ) {}

  // ================================================================
  // WAREHOUSES
  // ================================================================

  @Get('warehouses')
  findAllWarehouses(@CurrentTenant() tenantId: string) {
    return this.inventoryService.findAllWarehouses(tenantId);
  }

  @Post('warehouses')
  createWarehouse(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateWarehouseDto,
  ) {
    return this.inventoryService.createWarehouse(tenantId, dto);
  }

  @Put('warehouses/:id')
  updateWarehouse(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateWarehouseDto,
  ) {
    return this.inventoryService.updateWarehouse(id, tenantId, dto);
  }

  @Delete('warehouses/:id')
  deleteWarehouse(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.inventoryService.deleteWarehouse(id, tenantId);
  }

  // ================================================================
  // INVENTORY ITEMS
  // ================================================================

  @Get('items')
  findAllItems(
    @CurrentTenant() tenantId: string,
    @Query('includeInactive') includeInactive?: string,
    @Query('take') take?: string,
    @Query('skip') skip?: string,
  ) {
    return this.inventoryService.findAllItems(
      tenantId,
      includeInactive === 'true',
      take ? parseInt(take) : 100,
      skip ? parseInt(skip) : 0,
    );
  }

  @Get('items/:id')
  findOneItem(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.inventoryService.findOneItem(id, tenantId);
  }

  @Post('items')
  createItem(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateInventoryItemDto,
  ) {
    return this.inventoryService.createItem(tenantId, dto);
  }

  @Put('items/:id')
  updateItem(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @Body() dto: UpdateInventoryItemDto,
  ) {
    return this.inventoryService.updateItem(id, tenantId, dto);
  }

  @Delete('items/:id')
  deleteItem(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.inventoryService.deleteItem(id, tenantId);
  }

  // ================================================================
  // STOCK MOVEMENTS
  // ================================================================

  @Post('stock/entry')
  addStockEntry(
    @CurrentTenant() tenantId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: StockEntryDto,
  ) {
    return this.inventoryService.addStockEntry(tenantId, userId, dto);
  }

  @Post('stock/exit')
  addStockExit(
    @CurrentTenant() tenantId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: StockExitDto,
  ) {
    return this.inventoryService.addStockExit(tenantId, userId, dto);
  }

  @Post('stock/transfer')
  transferStock(
    @CurrentTenant() tenantId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: StockTransferDto,
  ) {
    return this.inventoryService.transferStock(tenantId, userId, dto);
  }

  // ================================================================
  // ALERTS
  // ================================================================

  @Get('alerts/low-stock')
  getLowStockItems(@CurrentTenant() tenantId: string) {
    return this.inventoryService.getLowStockItems(tenantId);
  }

  // ================================================================
  // RECIPES
  // ================================================================

  @Get('recipes')
  findAllRecipes(@CurrentTenant() tenantId: string) {
    return this.recipesService.findAll(tenantId);
  }

  @Get('recipes/products-without-recipe')
  getProductsWithoutRecipe(@CurrentTenant() tenantId: string) {
    return this.recipesService.getProductsWithoutRecipe(tenantId);
  }

  @Get('recipes/:id')
  findOneRecipe(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.recipesService.findOne(id, tenantId);
  }

  @Post('recipes')
  createRecipe(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateRecipeDto,
  ) {
    return this.recipesService.create(tenantId, dto);
  }

  @Put('recipes/:id')
  updateRecipe(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @Body() dto: UpdateRecipeDto,
  ) {
    return this.recipesService.update(id, tenantId, dto);
  }

  @Delete('recipes/:id')
  deleteRecipe(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.recipesService.delete(id, tenantId);
  }

  // ================================================================
  // COSTING
  // ================================================================

  @Get('costing/:productId')
  getRecipeCost(@Param('productId') productId: string) {
    return this.inventoryService.getRecipeCost(productId);
  }

  @Get('costing')
  getAllProductsCost(@CurrentTenant() tenantId: string) {
    // Single SQL query — no N+1, no JS loops
    return this.inventoryService.getAllProductsCostOptimized(tenantId);
  }

  // ================================================================
  // DASHBOARD METRICS (all computed in Postgres)
  // ================================================================

  @Get('dashboard/metrics')
  getDashboardMetrics(@CurrentTenant() tenantId: string) {
    return this.inventoryService.getDashboardMetrics(tenantId);
  }

  // ================================================================
  // INVENTORY COUNTS
  // ================================================================

  @Get('counts')
  findAllCounts(@CurrentTenant() tenantId: string) {
    return this.countsService.findAll(tenantId);
  }

  @Get('counts/:id')
  findOneCount(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.countsService.findOne(id, tenantId);
  }

  @Post('counts')
  createCount(
    @CurrentTenant() tenantId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateInventoryCountDto,
  ) {
    return this.countsService.create(tenantId, userId, dto);
  }

  @Patch('counts/:id/complete')
  completeCount(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: CompleteInventoryCountDto,
  ) {
    return this.countsService.complete(id, tenantId, userId, dto);
  }

  @Delete('counts/:id')
  deleteCount(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.countsService.delete(id, tenantId);
  }
}
