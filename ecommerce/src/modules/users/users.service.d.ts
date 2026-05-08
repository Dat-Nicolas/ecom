import { PrismaService } from '../../prisma/prisma.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(query: PaginationDto): Promise<import("../../common/dto/pagination.dto").PaginatedResult<{
        role: {
            id: number;
            name: string;
            slug: string;
            permissions: import("@prisma/client/runtime/library").JsonValue;
            createdAt: Date;
            updatedAt: Date;
        };
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        roleId: number;
        phone: string | null;
        fullName: string;
        avatarUrl: string | null;
        status: import(".prisma/client").$Enums.UserStatus;
        emailVerifiedAt: Date | null;
        lastLoginAt: Date | null;
    }>>;
    findOne(id: string): Promise<{
        role: {
            id: number;
            name: string;
            slug: string;
            permissions: import("@prisma/client/runtime/library").JsonValue;
            createdAt: Date;
            updatedAt: Date;
        };
        addresses: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            phone: string;
            province: string;
            recipientName: string;
            district: string;
            ward: string | null;
            addressLine: string;
            isDefault: boolean;
            userId: string;
        }[];
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        roleId: number;
        phone: string | null;
        fullName: string;
        avatarUrl: string | null;
        status: import(".prisma/client").$Enums.UserStatus;
        emailVerifiedAt: Date | null;
        lastLoginAt: Date | null;
    }>;
    getProfile(id: string): Promise<{
        role: {
            id: number;
            name: string;
            slug: string;
            permissions: import("@prisma/client/runtime/library").JsonValue;
            createdAt: Date;
            updatedAt: Date;
        };
        addresses: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            phone: string;
            province: string;
            recipientName: string;
            district: string;
            ward: string | null;
            addressLine: string;
            isDefault: boolean;
            userId: string;
        }[];
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        roleId: number;
        phone: string | null;
        fullName: string;
        avatarUrl: string | null;
        status: import(".prisma/client").$Enums.UserStatus;
        emailVerifiedAt: Date | null;
        lastLoginAt: Date | null;
    }>;
    updateProfile(id: string, data: any): Promise<{
        role: {
            id: number;
            name: string;
            slug: string;
            permissions: import("@prisma/client/runtime/library").JsonValue;
            createdAt: Date;
            updatedAt: Date;
        };
        addresses: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            phone: string;
            province: string;
            recipientName: string;
            district: string;
            ward: string | null;
            addressLine: string;
            isDefault: boolean;
            userId: string;
        }[];
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        roleId: number;
        phone: string | null;
        fullName: string;
        avatarUrl: string | null;
        status: import(".prisma/client").$Enums.UserStatus;
        emailVerifiedAt: Date | null;
        lastLoginAt: Date | null;
    }>;
    addAddress(userId: string, data: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string;
        province: string;
        recipientName: string;
        district: string;
        ward: string | null;
        addressLine: string;
        isDefault: boolean;
        userId: string;
    }>;
    getAddresses(userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string;
        province: string;
        recipientName: string;
        district: string;
        ward: string | null;
        addressLine: string;
        isDefault: boolean;
        userId: string;
    }[]>;
    removeAddress(userId: string, id: string): Promise<{
        message: string;
    }>;
}
