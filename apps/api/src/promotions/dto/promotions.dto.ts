import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class UpsertPromotionDto {
  @ApiProperty({ example: 'Fashion sale' })
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name!: string;

  @ApiProperty({ description: 'Percent off, 1-100', example: 15 })
  @IsInt()
  @Min(1)
  @Max(100)
  value!: number;

  @ApiPropertyOptional({ description: 'Scope to a category (mutually exclusive with brandId)' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Scope to a brand (mutually exclusive with categoryId)' })
  @IsOptional()
  @IsString()
  brandId?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endsAt?: string;
}

export class UpdatePromotionDto extends PartialType(UpsertPromotionDto) {}
