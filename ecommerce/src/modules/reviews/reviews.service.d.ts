import { PrismaService } from '../../prisma/prisma.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class ReviewsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, data: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.ReviewStatus;
        images: import("@prisma/client/runtime/library").JsonValue | null;
        productId: string;
        userId: string;
        orderItemId: string | null;
        rating: number;
        comment: string | null;
        helpfulCount: number;
    }>;
    findByProduct(productId: string, query: PaginationDto): Promise<import("../../common/dto/pagination.dto").PaginatedResult<{
        user: {
            fullName: string;
            avatarUrl: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.ReviewStatus;
        images: import("@prisma/client/runtime/library").JsonValue | null;
        productId: string;
        userId: string;
        orderItemId: string | null;
        rating: number;
        comment: string | null;
        helpfulCount: number;
    }>>;
    moderate(id: string, status: 'approved' | 'rejected'): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.ReviewStatus;
        images: import("@prisma/client/runtime/library").JsonValue | null;
        productId: string;
        userId: string;
        orderItemId: string | null;
        rating: number;
        comment: string | null;
        helpfulCount: number;
    }>;
    findPending(query: PaginationDto): Promise<import("../../common/dto/pagination.dto").PaginatedResult<{
        user: {
            fullName: string;
        };
        product: {
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.ReviewStatus;
        images: import("@prisma/client/runtime/library").JsonValue | null;
        productId: string;
        userId: string;
        orderItemId: string | null;
        rating: number;
        comment: string | null;
        helpfulCount: number;
    }>>;
}
