import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ShipmentsService } from './shipments.service';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('shipments') @ApiBearerAuth('access-token') @Controller('shipments')
export class ShipmentsController {
  constructor(private readonly svc: ShipmentsService) {}
  @Roles('admin') @Post() create(@Body() b: any) { return this.svc.create(b); }
  @Roles('admin') @Put(':id/status') updateStatus(@Param('id') id: string, @Body() b: any) { return this.svc.updateStatus(id, b.status, b.trackingNo); }
  @Get('orders/:orderId') findByOrder(@Param('orderId') id: string) { return this.svc.findByOrder(id); }
}
