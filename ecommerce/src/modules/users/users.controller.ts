// src/modules/users/users.controller.ts
import { Controller, Get, Put, Post, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('users')
@ApiBearerAuth('access-token')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get my profile' })
  getProfile(@CurrentUser('id') id: string) { return this.usersService.getProfile(id); }

  @Put('me')
  @ApiOperation({ summary: 'Update my profile' })
  updateProfile(@CurrentUser('id') id: string, @Body() body: any) { return this.usersService.updateProfile(id, body); }

  @Get('me/addresses')
  @ApiOperation({ summary: 'Get my addresses' })
  getAddresses(@CurrentUser('id') id: string) { return this.usersService.getAddresses(id); }

  @Post('me/addresses')
  @ApiOperation({ summary: 'Add address' })
  addAddress(@CurrentUser('id') id: string, @Body() body: any) { return this.usersService.addAddress(id, body); }

  @Delete('me/addresses/:addrId')
  @ApiOperation({ summary: 'Delete address' })
  removeAddress(@CurrentUser('id') id: string, @Param('addrId') addrId: string) { return this.usersService.removeAddress(id, addrId); }

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'List all users [Admin]' })
  findAll(@Query() query: PaginationDto) { return this.usersService.findAll(query); }

  @Get(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Get user by ID [Admin]' })
  findOne(@Param('id') id: string) { return this.usersService.findOne(id); }
}
