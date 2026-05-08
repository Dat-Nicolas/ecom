import { PrismaService } from '../../prisma/prisma.service';
import { KafkaService } from '../../config/kafka/kafka.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class InventoryService {
    private prisma;
    private kafkaService;
    constructor(prisma: PrismaService, kafkaService: KafkaService);
    adjustStock(variantId: string, warehouseId: number, qtyChange: number, action: string, note: string, userId: string): Promise<{
        id: bigint;
        updatedAt: Date;
        variantId: string;
        warehouseId: number;
        qtyAvailable: number;
        qtyReserved: number;
        reorderPoint: number;
    }>;
    getInventory(query: PaginationDto & {
        warehouseId?: number;
        lowStock?: boolean;
    }): Promise<import("../../common/dto/pagination.dto").PaginatedResult<{
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
    getLogs(inventoryId: bigint, query: PaginationDto): Promise<import("../../common/dto/pagination.dto").PaginatedResult<{
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
    createWarehouse(data: any): Promise<{
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
