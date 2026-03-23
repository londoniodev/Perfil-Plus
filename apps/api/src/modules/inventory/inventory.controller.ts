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
  findAllWarehouses() {
    return this.inventoryService.findAllWarehouses();
  }

  @Post('warehouses')
  createWarehouse(@Body() dto: CreateWarehouseDto) {
    return this.inventoryService.createWarehouse(dto);
  }

  @Put('warehouses/:id')
  updateWarehouse(@Param('id') id: string, @Body() dto: CreateWarehouseDto) {
    return this.inventoryService.updateWarehouse(id, dto);
  }

  @Delete('warehouses/:id')
  deleteWarehouse(@Param('id') id: string) {
    return this.inventoryService.deleteWarehouse(id);
  }

  // ================================================================
  // INVENTORY ITEMS
  // ================================================================

  @Get('items')
  findAllItems(
    @Query('includeInactive') includeInactive?: string,
    @Query('take') take?: string,
    @Query('skip') skip?: string,
  ) {
    return this.inventoryService.findAllItems(
      includeInactive === 'true',
      take ? parseInt(take) : 100,
      skip ? parseInt(skip) : 0,
    );
  }

  @Get('items/:id')
  findOneItem(@Param('id') id: string) {
    return this.inventoryService.findOneItem(id);
  }

  @Post('items')
  createItem(@Body() dto: CreateInventoryItemDto) {
    return this.inventoryService.createItem(dto);
  }

  @Put('items/:id')
  updateItem(@Param('id') id: string, @Body() dto: UpdateInventoryItemDto) {
    return this.inventoryService.updateItem(id, dto);
  }

  @Delete('items/:id')
  deleteItem(@Param('id') id: string) {
    return this.inventoryService.deleteItem(id);
  }

  // ================================================================
  // STOCK MOVEMENTS
  // ================================================================

  @Post('stock/entry')
  addStockEntry(
    @CurrentUser('sub') userId: string,
    @Body() dto: StockEntryDto,
  ) {
    return this.inventoryService.addStockEntry(userId, dto);
  }

  @Post('stock/exit')
  addStockExit(
    @CurrentUser('sub') userId: string,
    @Body() dto: StockExitDto,
  ) {
    return this.inventoryService.addStockExit(userId, dto);
  }

  @Post('stock/transfer')
  transferStock(
    @CurrentUser('sub') userId: string,
    @Body() dto: StockTransferDto,
  ) {
    return this.inventoryService.transferStock(userId, dto);
  }

  // ================================================================
  // ALERTS
  // ================================================================

  @Get('alerts/low-stock')
  getLowStockItems() {
    return this.inventoryService.getLowStockItems();
  }

  // ================================================================
  // RECIPES
  // ================================================================

  @Get('recipes')
  findAllRecipes() {
    return this.recipesService.findAll();
  }

  @Get('recipes/products-without-recipe')
  getProductsWithoutRecipe() {
    return this.recipesService.getProductsWithoutRecipe();
  }

  @Get('recipes/:id')
  findOneRecipe(@Param('id') id: string) {
    return this.recipesService.findOne(id);
  }

  @Post('recipes')
  createRecipe(@Body() dto: CreateRecipeDto) {
    return this.recipesService.create(dto);
  }

  @Put('recipes/:id')
  updateRecipe(@Param('id') id: string, @Body() dto: UpdateRecipeDto) {
    return this.recipesService.update(id, dto);
  }

  @Delete('recipes/:id')
  deleteRecipe(@Param('id') id: string) {
    return this.recipesService.delete(id);
  }

  // ================================================================
  // COSTING
  // ================================================================

  @Get('costing/:productId')
  getRecipeCost(@Param('productId') productId: string) {
    return this.inventoryService.getRecipeCost(productId);
  }

  @Get('costing')
  getAllProductsCost() {
    // Single SQL query — no N+1, no JS loops
    return this.inventoryService.getAllProductsCostOptimized();
  }

  // ================================================================
  // DASHBOARD METRICS (all computed in Postgres)
  // ================================================================

  @Get('dashboard/metrics')
  getDashboardMetrics() {
    return this.inventoryService.getDashboardMetrics();
  }

  // ================================================================
  // INVENTORY COUNTS
  // ================================================================

  @Get('counts')
  findAllCounts() {
    return this.countsService.findAll();
  }

  @Get('counts/:id')
  findOneCount(@Param('id') id: string) {
    return this.countsService.findOne(id);
  }

  @Post('counts')
  createCount(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateInventoryCountDto,
  ) {
    return this.countsService.create(userId, dto);
  }

  @Patch('counts/:id/complete')
  completeCount(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: CompleteInventoryCountDto,
  ) {
    return this.countsService.complete(id, userId, dto);
  }

  @Delete('counts/:id')
  deleteCount(@Param('id') id: string) {
    return this.countsService.delete(id);
  }
}
