import { NotificationsService } from './notifications.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class NotificationsController {
    private readonly svc;
    constructor(svc: NotificationsService);
    getMyNotifications(uid: string, q: PaginationDto): Promise<import("../../common/dto/pagination.dto").PaginatedResult<{
        id: bigint;
        createdAt: Date;
        type: string;
        title: string;
        data: import("@prisma/client/runtime/library").JsonValue | null;
        userId: string;
        body: string | null;
        channel: import(".prisma/client").$Enums.NotificationChannel;
        isRead: boolean;
        readAt: Date | null;
    }>>;
    getUnreadCount(uid: string): Promise<{
        count: number;
    }>;
    markRead(uid: string, id: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    markAllRead(uid: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
