import { BrandsService } from './brands.service';
export declare class BrandsController {
    private readonly svc;
    constructor(svc: BrandsService);
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
    findOne(id: string): Promise<{
        id: number;
        name: string;
        slug: string;
        createdAt: Date;
        updatedAt: Date;
        logoUrl: string | null;
        country: string | null;
        isActive: boolean;
    }>;
    create(b: any): Promise<{
        id: number;
        name: string;
        slug: string;
        createdAt: Date;
        updatedAt: Date;
        logoUrl: string | null;
        country: string | null;
        isActive: boolean;
    }>;
    update(id: string, b: any): Promise<{
        id: number;
        name: string;
        slug: string;
        createdAt: Date;
        updatedAt: Date;
        logoUrl: string | null;
        country: string | null;
        isActive: boolean;
    }>;
    remove(id: string): Promise<{
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
