import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { KafkaService } from '../../config/kafka/kafka.service';
export declare class PaymentsService {
    private prisma;
    private kafkaService;
    private configService;
    private readonly logger;
    constructor(prisma: PrismaService, kafkaService: KafkaService, configService: ConfigService);
    createPayment(orderId: string, method: string, userId: string): Promise<{
        payment: {
            id: string;
            createdAt: Date;
            status: import(".prisma/client").$Enums.PaymentStatus;
            orderId: string;
            method: import(".prisma/client").$Enums.PaymentMethod;
            amount: import("@prisma/client/runtime/library").Decimal;
            currency: string;
            gatewayTxnId: string | null;
            gatewayResponse: import("@prisma/client/runtime/library").JsonValue | null;
            paidAt: Date | null;
        };
        redirectUrl: any;
        message: string;
    } | {
        payment: {
            id: string;
            createdAt: Date;
            status: import(".prisma/client").$Enums.PaymentStatus;
            orderId: string;
            method: import(".prisma/client").$Enums.PaymentMethod;
            amount: import("@prisma/client/runtime/library").Decimal;
            currency: string;
            gatewayTxnId: string | null;
            gatewayResponse: import("@prisma/client/runtime/library").JsonValue | null;
            paidAt: Date | null;
        };
        redirectUrl: string;
        message?: undefined;
    }>;
    handleVNPayCallback(query: Record<string, string>): Promise<{
        success: boolean;
        message: string;
    }>;
    getOrderPayments(orderId: string): Promise<{
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.PaymentStatus;
        orderId: string;
        method: import(".prisma/client").$Enums.PaymentMethod;
        amount: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        gatewayTxnId: string | null;
        gatewayResponse: import("@prisma/client/runtime/library").JsonValue | null;
        paidAt: Date | null;
    }[]>;
    private buildVNPayUrl;
}
