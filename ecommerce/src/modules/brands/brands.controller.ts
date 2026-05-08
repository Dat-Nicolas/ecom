import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { BrandsService } from './brands.service';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('brands') @ApiBearerAuth('access-token') @Controller('brands')
export class BrandsController {
  constructor(private readonly svc: BrandsService) {}
  @Public() @Get() findAll() { return this.svc.findAll(); }
  @Public() @Get(':id') findOne(@Param('id') id: string) { return this.svc.findOne(+id); }
  @Roles('admin') @Post() create(@Body() b: any) { return this.svc.create(b); }
  @Roles('admin') @Put(':id') update(@Param('id') id: string, @Body() b: any) { return this.svc.update(+id, b); }
  @Roles('admin') @Delete(':id') remove(@Param('id') id: string) { return this.svc.remove(+id); }
}
