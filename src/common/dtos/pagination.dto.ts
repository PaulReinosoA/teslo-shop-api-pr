import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsPositive } from 'class-validator';

export class PaginationDto {
  @ApiProperty({
    default: 10,
    example: 10,
    description: 'Number of items to return',
  })
  @Type(() => Number)
  @IsPositive()
  @IsOptional()
  //tranform here
  limit?: number;

  @ApiProperty({
    default: 0,
    example: 0,
    description: 'Number of items to skip',
  })
  @Type(() => Number)
  @IsPositive()
  @IsOptional()
  ofset?: number;
}
