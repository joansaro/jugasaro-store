import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, MaxLength, MinLength, NotEquals } from 'class-validator';

export class AdjustStockDto {
  @ApiProperty()
  @IsString()
  variantId!: string;

  @ApiProperty({ description: 'Positive = restock · negative = correction' })
  @IsInt()
  @NotEquals(0)
  delta!: number;

  @ApiProperty({ example: 'Weekly recount — found 2 damaged units' })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  reason!: string;
}
