import { Controller, Get, Put, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('notifications') @ApiBearerAuth('access-token') @Controller('notifications')
export class NotificationsController {
  constructor(private readonly svc: NotificationsService) {}
  @Get() getMyNotifications(@CurrentUser('id') uid: string, @Query() q: PaginationDto) { return this.svc.getMyNotifications(uid, q); }
  @Get('unread-count') getUnreadCount(@CurrentUser('id') uid: string) { return this.svc.getUnreadCount(uid); }
  @Put(':id/read') markRead(@CurrentUser('id') uid: string, @Param('id') id: string) { return this.svc.markRead(uid, BigInt(id)); }
  @Put('read-all') markAllRead(@CurrentUser('id') uid: string) { return this.svc.markAllRead(uid); }
}
