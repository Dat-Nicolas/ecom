import { PrismaService } from '../../prisma/prisma.service';
// import { KafkaService } from '../../config/kafka/kafka.service';
export declare class ShipmentsService {
    private prisma;
    private kafkaService;
    constructor(prisma: PrismaService,
        //  kafkaService: KafkaService
        );
    create(data: any): Promise<{
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
    updateStatus(id: string, status: string, trackingNo?: string): Promise<{
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
    findByOrder(orderId: string): Promise<{
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
