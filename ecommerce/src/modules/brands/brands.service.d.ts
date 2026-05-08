import { PrismaService } from '../../prisma/prisma.service';
export declare class BrandsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: any): Promise<{
        id: number;
        name: string;
        slug: string;
        createdAt: Date;
        updatedAt: Date;
        logoUrl: string | null;
        country: string | null;
        isActive: boolean;
    }>;
    findAll(): Promise<{
        id: number;
        name: string;
        slug: string;
        createdAt: Date;
        updatedAt: Date;
        logoUrl: string | null;
        country: string | null;
        isActive: boolean;
    }[]>;
    findOne(id: number): Promise<{
        id: number;
        name: string;
        slug: string;
        createdAt: Date;
        updatedAt: Date;
        logoUrl: string | null;
        country: string | null;
        isActive: boolean;
    }>;
    update(id: number, data: any): Promise<{
        id: number;
        name: string;
        slug: string;
        createdAt: Date;
        updatedAt: Date;
        logoUrl: string | null;
        country: string | null;
        isActive: boolean;
    }>;
    remove(id: number): Promise<{
        id: number;
        name: string;
        slug: string;
        createdAt: Date;
        updatedAt: Date;
        logoUrl: string | null;
        country: string | null;
        isActive: boolean;
    }>;
}
