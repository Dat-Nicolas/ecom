import { CategoriesService } from './categories.service';
export declare class CategoriesController {
    private readonly svc;
    constructor(svc: CategoriesService);
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
    findOne(id: string): Promise<{
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
    create(body: any): Promise<{
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
    update(id: string, body: any): Promise<{
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
    remove(id: string): Promise<{
        message: string;
    }>;
}
