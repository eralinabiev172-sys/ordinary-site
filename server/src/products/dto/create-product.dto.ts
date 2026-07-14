import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import {
  ProductStatus,
  ProductUnit,
} from '../../generated/prisma/client';

export class CreateProductDto {
  @IsString()
  name!: string;

  @IsString()
  slug!: string;

  @IsString()
  sku!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  oldPrice?: number;

  @IsInt()
  @Min(0)
  quantity!: number;

  @IsEnum(ProductUnit)
  unit!: ProductUnit;

  @IsEnum(ProductStatus)
  status!: ProductStatus;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsString()
  categoryId!: string;
}