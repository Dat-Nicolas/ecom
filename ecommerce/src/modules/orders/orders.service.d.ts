import { PrismaService } from '../../prisma/prisma.service';
import { KafkaService } from '../../config/kafka/kafka.service';
import { CreateOrderDto, UpdateOrderStatusDto, OrderQueryDto } from './dto/order.dto';
export declare class OrdersService {
    private prisma;
    private kafkaService;
    private readonly logger;
    constructor(prisma: PrismaService, kafkaService: KafkaService);
    private generateOrderCode;
    create(userId: string, dto: CreateOrderDto): Promise<{
        items: {
            id: string;
            sku: string | null;
            variantId: string | null;
            quantity: number;
            productName: string;
            variantName: string | null;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            discountAmt: import("@prisma/client/runtime/library").Decimal;
            lineTotal: import("@prisma/client/runtime/library").Decimal;
            orderId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.OrderStatus;
        total: import("@prisma/client/runtime/library").Decimal;
        userId: string;
        addressId: string | null;
        note: string | null;
        orderCode: string;
        discountAmt: import("@prisma/client/runtime/library").Decimal;
        shippingAddressSnapshot: import("@prisma/client/runtime/library").JsonValue;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        shippingFee: import("@prisma/client/runtime/library").Decimal;
        orderedAt: Date;
        couponId: string | null;
    }>;
    findAll(query: OrderQueryDto): Promise<import("../../common/dto/pagination.dto").PaginatedResult<{
        user: {
            id: string;
            email: string;
            fullName: string;
        };
        items: {
            id: string;
            sku: string | null;
            variantId: string | null;
            quantity: number;
            productName: string;
            variantName: string | null;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            discountAmt: import("@prisma/client/runtime/library").Decimal;
            lineTotal: import("@prisma/client/runtime/library").Decimal;
            orderId: string;
        }[];
        _count: {
            payments: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.OrderStatus;
        total: import("@prisma/client/runtime/library").Decimal;
        userId: string;
        addressId: string | null;
        note: string | null;
        orderCode: string;
        discountAmt: import("@prisma/client/runtime/library").Decimal;
        shippingAddressSnapshot: import("@prisma/client/runtime/library").JsonValue;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        shippingFee: import("@prisma/client/runtime/library").Decimal;
        orderedAt: Date;
        couponId: string | null;
    }>>;
    findMyOrders(userId: string, query: OrderQueryDto): Promise<import("../../common/dto/pagination.dto").PaginatedResult<{
        user: {
            id: string;
            email: string;
            fullName: string;
        };
        items: {
            id: string;
            sku: string | null;
            variantId: string | null;
            quantity: number;
            productName: string;
            variantName: string | null;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            discountAmt: import("@prisma/client/runtime/library").Decimal;
            lineTotal: import("@prisma/client/runtime/library").Decimal;
            orderId: string;
        }[];
        _count: {
            payments: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.OrderStatus;
        total: import("@prisma/client/runtime/library").Decimal;
        userId: string;
        addressId: string | null;
        note: string | null;
        orderCode: string;
        discountAmt: import("@prisma/client/runtime/library").Decimal;
        shippingAddressSnapshot: import("@prisma/client/runtime/library").JsonValue;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        shippingFee: import("@prisma/client/runtime/library").Decimal;
        orderedAt: Date;
        couponId: string | null;
    }>>;
    findOne(id: string): Promise<{
        user: {
            id: string;
            email: string;
            phone: string;
            fullName: string;
        };
        shipments: {
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
        }[];
        coupon: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            code: string;
            type: import(".prisma/client").$Enums.CouponType;
            value: import("@prisma/client/runtime/library").Decimal;
            maxDiscount: import("@prisma/client/runtime/library").Decimal | null;
            minOrderValue: import("@prisma/client/runtime/library").Decimal | null;
            usageLimit: number | null;
            usedCount: number;
            userLimit: number | null;
            applicableTo: import("@prisma/client/runtime/library").JsonValue | null;
            startsAt: Date | null;
            expiresAt: Date | null;
        };
        payments: {
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
        }[];
        items: ({
            variant: {
                product: {
                    id: string;
                    name: string;
                    slug: string;
                    createdAt: Date;
                    updatedAt: Date;
                    status: import(".prisma/client").$Enums.ProductStatus;
                    description: string | null;
                    sku: string | null;
                    categoryId: number;
                    brandId: number | null;
                    price: import("@prisma/client/runtime/library").Decimal;
                    salePrice: import("@prisma/client/runtime/library").Decimal | null;
                    weight: import("@prisma/client/runtime/library").Decimal | null;
                    dimensions: import("@prisma/client/runtime/library").JsonValue | null;
                    attributes: import("@prisma/client/runtime/library").JsonValue | null;
                    isFeatured: boolean;
                    avgRating: import("@prisma/client/runtime/library").Decimal;
                    reviewCount: number;
                    soldCount: number;
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
            id: string;
            sku: string | null;
            variantId: string | null;
            quantity: number;
            productName: string;
            variantName: string | null;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            discountAmt: import("@prisma/client/runtime/library").Decimal;
            lineTotal: import("@prisma/client/runtime/library").Decimal;
            orderId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.OrderStatus;
        total: import("@prisma/client/runtime/library").Decimal;
        userId: string;
        addressId: string | null;
        note: string | null;
        orderCode: string;
        discountAmt: import("@prisma/client/runtime/library").Decimal;
        shippingAddressSnapshot: import("@prisma/client/runtime/library").JsonValue;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        shippingFee: import("@prisma/client/runtime/library").Decimal;
        orderedAt: Date;
        couponId: string | null;
    }>;
    updateStatus(id: string, dto: UpdateOrderStatusDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.OrderStatus;
        total: import("@prisma/client/runtime/library").Decimal;
        userId: string;
        addressId: string | null;
        note: string | null;
        orderCode: string;
        discountAmt: import("@prisma/client/runtime/library").Decimal;
        shippingAddressSnapshot: import("@prisma/client/runtime/library").JsonValue;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        shippingFee: import("@prisma/client/runtime/library").Decimal;
        orderedAt: Date;
        couponId: string | null;
    }>;
    cancelMyOrder(userId: string, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.OrderStatus;
        total: import("@prisma/client/runtime/library").Decimal;
        userId: string;
        addressId: string | null;
        note: string | null;
        orderCode: string;
        discountAmt: import("@prisma/client/runtime/library").Decimal;
        shippingAddressSnapshot: import("@prisma/client/runtime/library").JsonValue;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        shippingFee: import("@prisma/client/runtime/library").Decimal;
        orderedAt: Date;
        couponId: string | null;
    }>;
}
