import { UsersService } from './users.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
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
    updateProfile(id: string, body: any): Promise<{
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
    getAddresses(id: string): Promise<{
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
    addAddress(id: string, body: any): Promise<{
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
    removeAddress(id: string, addrId: string): Promise<{
        message: string;
    }>;
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
}
