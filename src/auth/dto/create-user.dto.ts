import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'test3@gmail.com',
    default: 'test3@gmail.com',
  })
  @IsString()
  @MinLength(1)
  email: string;

  @ApiProperty({
    example: 'Abc12343456',
    default: 'Abc12343456',
    description:
      'The password must have a Uppercase, lowercase letter and a number',
  })
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'The password must have a Uppercase, lowercase letter and a number',
  })
  password: string;

  @ApiProperty({
    example: 'test user',
  })
  @IsString()
  @MinLength(1)
  fullName: string;
}
