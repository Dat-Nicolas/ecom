import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('reviews') @ApiBearerAuth('access-token') @Controller('reviews')
export class ReviewsController {
  constructor(private readonly svc: ReviewsService) {}
  @Post() create(@CurrentUser('id') uid: string, @Body() b: any) { return this.svc.create(uid, b); }
  @Public() @Get('products/:productId') findByProduct(@Param('productId') pid: string, @Query() q: PaginationDto) { return this.svc.findByProduct(pid, q); }
  @Roles('admin') @Get('pending') findPending(@Query() q: PaginationDto) { return this.svc.findPending(q); }
  @Roles('admin') @Put(':id/moderate') moderate(@Param('id') id: string, @Body() b: any) { return this.svc.moderate(id, b.status); }
}
