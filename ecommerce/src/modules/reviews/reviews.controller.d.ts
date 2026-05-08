import { ReviewsService } from './reviews.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class ReviewsController {
    private readonly svc;
    constructor(svc: ReviewsService);
    create(uid: string, b: any): Promise<{
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
    findByProduct(pid: string, q: PaginationDto): Promise<import("../../common/dto/pagination.dto").PaginatedResult<{
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
    findPending(q: PaginationDto): Promise<import("../../common/dto/pagination.dto").PaginatedResult<{
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
    moderate(id: string, b: any): Promise<{
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
}
