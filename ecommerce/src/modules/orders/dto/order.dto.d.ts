import { PaginationDto } from '../../../common/dto/pagination.dto';
export declare class CreateOrderItemDto {
    variantId: string;
    quantity: number;
}
export declare class CreateOrderDto {
    items: CreateOrderItemDto[];
    addressId: string;
    couponCode?: string;
    note?: string;
    paymentMethod?: string;
}
export declare class UpdateOrderStatusDto {
    status: string;
    note?: string;
}
export declare class OrderQueryDto extends PaginationDto {
    status?: string;
    userId?: string;
    orderCode?: string;
    from?: string;
    to?: string;
}
