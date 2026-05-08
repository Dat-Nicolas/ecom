// src/modules/orders/orders.controller.ts
import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto, OrderQueryDto } from './dto/order.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('orders')
@ApiBearerAuth('access-token')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Place new order' })
  create(@CurrentUser('id') userId: string, @Body() dto: CreateOrderDto) {
    return this.ordersService.create(userId, dto);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get my orders' })
  myOrders(@CurrentUser('id') userId: string, @Query() query: OrderQueryDto) {
    return this.ordersService.findMyOrders(userId, query);
  }

  @Get('my/:id')
  @ApiOperation({ summary: 'Get my order detail' })
  myOrder(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Put('my/:id/cancel')
  @ApiOperation({ summary: 'Cancel my pending order' })
  cancelMy(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.ordersService.cancelMyOrder(userId, id);
  }

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'List all orders [Admin]' })
  findAll(@Query() query: OrderQueryDto) {
    return this.ordersService.findAll(query);
  }

  @Get(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Get order detail [Admin]' })
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Put(':id/status')
  @Roles('admin')
  @ApiOperation({ summary: 'Update order status [Admin]' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(id, dto);
  }
}
