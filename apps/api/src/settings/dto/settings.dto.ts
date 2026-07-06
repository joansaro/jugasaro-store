import { ApiProperty } from '@nestjs/swagger';
import { IsObject } from 'class-validator';

export class UpdateSettingsDto {
  @ApiProperty({
    description: 'Partial key-value map of settings to upsert',
    example: { tax_rate_bps: '800', store_name: 'Jugasaro Store' },
  })
  @IsObject()
  entries!: Record<string, string>;
}
