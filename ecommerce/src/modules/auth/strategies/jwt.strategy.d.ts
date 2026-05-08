import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../prisma/prisma.service';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private configService;
    private prisma;
    constructor(configService: ConfigService, prisma: PrismaService);
    validate(payload: {
        sub: string;
        email: string;
    }): Promise<{
        role: {
            id: number;
            name: string;
            slug: string;
            permissions: import("@prisma/client/runtime/library").JsonValue;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        roleId: number;
        phone: string | null;
        passwordHash: string;
        fullName: string;
        avatarUrl: string | null;
        status: import(".prisma/client").$Enums.UserStatus;
        emailVerifiedAt: Date | null;
        lastLoginAt: Date | null;
    }>;
}
export {};
