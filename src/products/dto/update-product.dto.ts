// import { PartialType } from '@nestjs/mapped-types';  //! para agregar la documentacion
import { PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {}
