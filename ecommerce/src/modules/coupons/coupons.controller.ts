import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CouponsService } from './coupons.service';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('coupons') @ApiBearerAuth('access-token') @Controller('coupons')
export class CouponsController {
  constructor(private readonly svc: CouponsService) {}
  @Roles('admin') @Get() findAll() { return this.svc.findAll(); }
  @Roles('admin') @Post() create(@Body() b: any) { return this.svc.create(b); }
  @Roles('admin') @Put(':id') update(@Param('id') id: string, @Body() b: any) { return this.svc.update(id, b); }
  @Roles('admin') @Delete(':id') remove(@Param('id') id: string) { return this.svc.remove(id); }
  @Post('validate') validate(@Body() b: { code: string; orderValue: number }) { return this.svc.validate(b.code, b.orderValue); }
}
