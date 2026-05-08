import { PaginationDto } from '../../../common/dto/pagination.dto';
export declare enum ProductStatusEnum {
    draft = "draft",
    active = "active",
    archived = "archived"
}
export declare class CreateProductDto {
    name: string;
    categoryId: number;
    brandId?: number;
    sku?: string;
    description?: string;
    price: number;
    salePrice?: number;
    weight?: number;
    dimensions?: object;
    attributes?: object;
    status?: ProductStatusEnum;
    isFeatured?: boolean;
}
declare const UpdateProductDto_base: import("@nestjs/common").Type<Partial<CreateProductDto>>;
export declare class UpdateProductDto extends UpdateProductDto_base {
}
export declare class ProductQueryDto extends PaginationDto {
    search?: string;
    categoryId?: number;
    brandId?: number;
    status?: ProductStatusEnum;
    isFeatured?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export declare class CreateVariantDto {
    name: string;
    sku: string;
    attributes?: object;
    price: number;
    salePrice?: number;
    barcode?: string;
    imageUrl?: string;
}
export {};
