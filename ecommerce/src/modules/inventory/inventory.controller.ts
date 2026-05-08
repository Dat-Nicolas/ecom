import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('inventory') @ApiBearerAuth('access-token') @Controller('inventory')
export class InventoryController {
  constructor(private readonly svc: InventoryService) {}

  @Roles('admin') @Get() getInventory(@Query() q: any) { return this.svc.getInventory(q); }
  @Roles('admin') @Post('adjust') adjust(@Body() b: any, @CurrentUser('id') uid: string) {
    return this.svc.adjustStock(b.variantId, b.warehouseId, b.qtyChange, b.action, b.note, uid);
  }
  @Roles('admin') @Get(':id/logs') getLogs(@Param('id') id: string, @Query() q: PaginationDto) {
    return this.svc.getLogs(BigInt(id), q);
  }
  @Roles('admin') @Get('warehouses') getWarehouses() { return this.svc.getWarehouses(); }
  @Roles('admin') @Post('warehouses') createWarehouse(@Body() b: any) { return this.svc.createWarehouse(b); }
}
