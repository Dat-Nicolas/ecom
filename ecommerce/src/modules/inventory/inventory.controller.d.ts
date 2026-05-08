import { InventoryService } from './inventory.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class InventoryController {
    private readonly svc;
    constructor(svc: InventoryService);
    getInventory(q: any): Promise<import("../../common/dto/pagination.dto").PaginatedResult<{
        warehouse: {
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            code: string;
            address: string | null;
            province: string | null;
            managerId: string | null;
        };
        variant: {
            product: {
                name: string;
            };
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            imageUrl: string | null;
            sku: string;
            price: import("@prisma/client/runtime/library").Decimal;
            salePrice: import("@prisma/client/runtime/library").Decimal | null;
            attributes: import("@prisma/client/runtime/library").JsonValue | null;
            productId: string;
            barcode: string | null;
        };
    } & {
        id: bigint;
        updatedAt: Date;
        variantId: string;
        warehouseId: number;
        qtyAvailable: number;
        qtyReserved: number;
        reorderPoint: number;
    }>>;
    adjust(b: any, uid: string): Promise<{
        id: bigint;
        updatedAt: Date;
        variantId: string;
        warehouseId: number;
        qtyAvailable: number;
        qtyReserved: number;
        reorderPoint: number;
    }>;
    getLogs(id: string, q: PaginationDto): Promise<import("../../common/dto/pagination.dto").PaginatedResult<{
        id: bigint;
        createdAt: Date;
        note: string | null;
        action: import(".prisma/client").$Enums.InventoryAction;
        qtyChange: number;
        qtyBefore: number;
        qtyAfter: number;
        referenceType: string | null;
        referenceId: string | null;
        createdBy: string | null;
        inventoryId: bigint;
    }>>;
    getWarehouses(): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        code: string;
        address: string | null;
        province: string | null;
        managerId: string | null;
    }[]>;
    createWarehouse(b: any): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        code: string;
        address: string | null;
        province: string | null;
        managerId: string | null;
    }>;
}
