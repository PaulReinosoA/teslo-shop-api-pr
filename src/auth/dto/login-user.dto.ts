import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class LoginUserDto {
  @ApiProperty({
    example: 'test1@gmail.com',
    default: 'test1@gmail.com',
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
  @MaxLength(100)
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'The password must have a Uppercase, lowercase letter and a number',
  })
  password: string;
}
