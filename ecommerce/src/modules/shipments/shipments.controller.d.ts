import { ShipmentsService } from './shipments.service';
export declare class ShipmentsController {
    private readonly svc;
    constructor(svc: ShipmentsService);
    create(b: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.ShipmentStatus;
        warehouseId: number | null;
        shippingFee: import("@prisma/client/runtime/library").Decimal | null;
        orderId: string;
        carrier: string | null;
        trackingNo: string | null;
        carrierService: string | null;
        estimatedDate: Date | null;
        shippedAt: Date | null;
        deliveredAt: Date | null;
        events: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    updateStatus(id: string, b: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.ShipmentStatus;
        warehouseId: number | null;
        shippingFee: import("@prisma/client/runtime/library").Decimal | null;
        orderId: string;
        carrier: string | null;
        trackingNo: string | null;
        carrierService: string | null;
        estimatedDate: Date | null;
        shippedAt: Date | null;
        deliveredAt: Date | null;
        events: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    findByOrder(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.ShipmentStatus;
        warehouseId: number | null;
        shippingFee: import("@prisma/client/runtime/library").Decimal | null;
        orderId: string;
        carrier: string | null;
        trackingNo: string | null;
        carrierService: string | null;
        estimatedDate: Date | null;
        shippedAt: Date | null;
        deliveredAt: Date | null;
        events: import("@prisma/client/runtime/library").JsonValue | null;
    }[]>;
}
