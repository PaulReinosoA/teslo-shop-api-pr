import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    example: 'T-Shirt',
    description: 'Product title',
    uniqueItems: true,
  })
  @IsString()
  @MinLength(1)
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 19.99,
    description: 'Product price',
  })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  price?: number;

  @ApiProperty({
    example: 'A cool T-Shirt',
    description: 'Product description',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: 'cool_t-shirt',
    description: 'Product slug - for SEO',
    uniqueItems: true,
  })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiProperty({
    example: 10,
    description: 'Product stock',
  })
  @IsInt()
  @IsPositive()
  @IsOptional()
  stock?: number;

  @ApiProperty({
    example: ['S', 'M', 'L', 'XL'],
    description: 'Available sizes',
  })
  @IsString({ each: true })
  @IsArray()
  sizes: string[];

  @ApiProperty({
    example: 'M',
    description: 'Product gender',
  })
  @IsIn(['men', 'women', 'kid', 'unisex'])
  gender: string;

  @ApiProperty({
    example: ['shirt', 't-shirt', 'clothing'],
    description: 'Product tags',
  })
  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @ApiProperty({
    example: ['http://example.com/image1.jpg', 'http://example.com/image2.jpg'],
    description: 'Product images',
  })
  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  images?: string[];
}
