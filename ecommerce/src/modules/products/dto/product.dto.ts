// src/modules/products/dto/product.dto.ts
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsString, IsNumber, IsOptional, IsBoolean, IsEnum, IsObject, Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export enum ProductStatusEnum {
  draft = 'draft',
  active = 'active',
  archived = 'archived',
}

export class CreateProductDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty() @IsNumber() @Type(() => Number) categoryId: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Type(() => Number) brandId?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() sku?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiProperty() @IsNumber() @Type(() => Number) @Min(0) price: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Type(() => Number) salePrice?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() weight?: number;
  @ApiPropertyOptional() @IsOptional() @IsObject() dimensions?: object;
  @ApiPropertyOptional() @IsOptional() @IsObject() attributes?: object;
  @ApiPropertyOptional({ enum: ProductStatusEnum }) @IsOptional() @IsEnum(ProductStatusEnum) status?: ProductStatusEnum;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isFeatured?: boolean;
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}

export class ProductQueryDto extends PaginationDto {
  @ApiPropertyOptional() @IsOptional() @IsString() search?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() categoryId?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() brandId?: number;
  @ApiPropertyOptional({ enum: ProductStatusEnum }) @IsOptional() @IsEnum(ProductStatusEnum) status?: ProductStatusEnum;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() @Type(() => Boolean) isFeatured?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() sortBy?: string;
  @ApiPropertyOptional({ enum: ['asc', 'desc'] }) @IsOptional() @IsEnum(['asc', 'desc']) sortOrder?: 'asc' | 'desc';
}

export class CreateVariantDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty() @IsString() sku: string;
  @ApiPropertyOptional() @IsOptional() @IsObject() attributes?: object;
  @ApiProperty() @IsNumber() @Type(() => Number) @Min(0) price: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() salePrice?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() barcode?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() imageUrl?: string;
}
