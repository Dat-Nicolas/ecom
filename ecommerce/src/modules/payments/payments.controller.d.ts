import { PaymentsService } from './payments.service';
export declare class PaymentsController {
    private readonly svc;
    constructor(svc: PaymentsService);
    create(orderId: string, body: any, uid: string): Promise<{
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
    vnpayCallback(query: any): Promise<{
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
}
