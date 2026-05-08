import { PrismaService } from '../../prisma/prisma.service';
export declare class CouponsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        code: string;
        type: import(".prisma/client").$Enums.CouponType;
        value: import("@prisma/client/runtime/library").Decimal;
        maxDiscount: import("@prisma/client/runtime/library").Decimal | null;
        minOrderValue: import("@prisma/client/runtime/library").Decimal | null;
        usageLimit: number | null;
        usedCount: number;
        userLimit: number | null;
        applicableTo: import("@prisma/client/runtime/library").JsonValue | null;
        startsAt: Date | null;
        expiresAt: Date | null;
    }>;
    findAll(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        code: string;
        type: import(".prisma/client").$Enums.CouponType;
        value: import("@prisma/client/runtime/library").Decimal;
        maxDiscount: import("@prisma/client/runtime/library").Decimal | null;
        minOrderValue: import("@prisma/client/runtime/library").Decimal | null;
        usageLimit: number | null;
        usedCount: number;
        userLimit: number | null;
        applicableTo: import("@prisma/client/runtime/library").JsonValue | null;
        startsAt: Date | null;
        expiresAt: Date | null;
    }[]>;
    validate(code: string, orderValue: number): Promise<{
        coupon: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            code: string;
            type: import(".prisma/client").$Enums.CouponType;
            value: import("@prisma/client/runtime/library").Decimal;
            maxDiscount: import("@prisma/client/runtime/library").Decimal | null;
            minOrderValue: import("@prisma/client/runtime/library").Decimal | null;
            usageLimit: number | null;
            usedCount: number;
            userLimit: number | null;
            applicableTo: import("@prisma/client/runtime/library").JsonValue | null;
            startsAt: Date | null;
            expiresAt: Date | null;
        };
        discount: number;
        message: string;
    }>;
    update(id: string, data: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        code: string;
        type: import(".prisma/client").$Enums.CouponType;
        value: import("@prisma/client/runtime/library").Decimal;
        maxDiscount: import("@prisma/client/runtime/library").Decimal | null;
        minOrderValue: import("@prisma/client/runtime/library").Decimal | null;
        usageLimit: number | null;
        usedCount: number;
        userLimit: number | null;
        applicableTo: import("@prisma/client/runtime/library").JsonValue | null;
        startsAt: Date | null;
        expiresAt: Date | null;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
