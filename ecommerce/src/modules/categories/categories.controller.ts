// src/modules/categories/categories.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('categories')
@ApiBearerAuth('access-token')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly svc: CategoriesService) {}
  @Public() @Get() findAll() { return this.svc.findAll(); }
  @Public() @Get(':id') findOne(@Param('id') id: string) { return this.svc.findOne(+id); }
  @Roles('admin') @Post() create(@Body() body: any) { return this.svc.create(body); }
  @Roles('admin') @Put(':id') update(@Param('id') id: string, @Body() body: any) { return this.svc.update(+id, body); }
  @Roles('admin') @Delete(':id') remove(@Param('id') id: string) { return this.svc.remove(+id); }
}
