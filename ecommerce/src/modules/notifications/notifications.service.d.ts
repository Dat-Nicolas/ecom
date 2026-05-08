import { PrismaService } from '../../prisma/prisma.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class NotificationsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, data: {
        type: string;
        title: string;
        body?: string;
        channel?: string;
        metadata?: any;
    }): Promise<{
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
    }>;
    getMyNotifications(userId: string, query: PaginationDto): Promise<import("../../common/dto/pagination.dto").PaginatedResult<{
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
    markRead(userId: string, id: bigint): Promise<import(".prisma/client").Prisma.BatchPayload>;
    markAllRead(userId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    getUnreadCount(userId: string): Promise<{
        count: number;
    }>;
}
