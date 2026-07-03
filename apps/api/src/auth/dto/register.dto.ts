import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'user@jugasaro.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ minLength: 8, example: 'Demo1234!' })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;

  @ApiProperty({ required: false, example: 'Ana Demo' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  name?: string;
}
