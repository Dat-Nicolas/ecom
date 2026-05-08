import { PrismaService } from '../../prisma/prisma.service';
export declare class CategoriesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: any): Promise<{
        id: number;
        name: string;
        slug: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        parentId: number | null;
        description: string | null;
        imageUrl: string | null;
        sortOrder: number;
        metaTitle: string | null;
        metaDesc: string | null;
    }>;
    findAll(): Promise<({
        children: {
            id: number;
            name: string;
            slug: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            parentId: number | null;
            description: string | null;
            imageUrl: string | null;
            sortOrder: number;
            metaTitle: string | null;
            metaDesc: string | null;
        }[];
        _count: {
            products: number;
        };
    } & {
        id: number;
        name: string;
        slug: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        parentId: number | null;
        description: string | null;
        imageUrl: string | null;
        sortOrder: number;
        metaTitle: string | null;
        metaDesc: string | null;
    })[]>;
    findOne(id: number): Promise<{
        parent: {
            id: number;
            name: string;
            slug: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            parentId: number | null;
            description: string | null;
            imageUrl: string | null;
            sortOrder: number;
            metaTitle: string | null;
            metaDesc: string | null;
        };
        children: {
            id: number;
            name: string;
            slug: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            parentId: number | null;
            description: string | null;
            imageUrl: string | null;
            sortOrder: number;
            metaTitle: string | null;
            metaDesc: string | null;
        }[];
    } & {
        id: number;
        name: string;
        slug: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        parentId: number | null;
        description: string | null;
        imageUrl: string | null;
        sortOrder: number;
        metaTitle: string | null;
        metaDesc: string | null;
    }>;
    update(id: number, data: any): Promise<{
        id: number;
        name: string;
        slug: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        parentId: number | null;
        description: string | null;
        imageUrl: string | null;
        sortOrder: number;
        metaTitle: string | null;
        metaDesc: string | null;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
