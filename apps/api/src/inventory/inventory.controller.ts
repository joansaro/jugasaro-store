import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

import { CurrentUser, AuthUser } from '@/auth/decorators/current-user.decorator';
import { Roles } from '@/auth/decorators/roles.decorator';
import { InventoryService } from './inventory.service';
import { AdjustStockDto } from './dto/inventory.dto';

@ApiTags('admin')
@Roles(UserRole.ADMIN)
@Controller('admin/inventory')
export class InventoryController {
  constructor(private readonly inventory: InventoryService) {}

  @Get()
  @ApiOperation({ summary: '[admin] Variants with stock (lowStockOnly=true filters)' })
  list(@Query('lowStockOnly') lowStockOnly?: string) {
    return this.inventory.list(lowStockOnly === 'true');
  }

  @Post('adjust')
  @ApiOperation({ summary: '[admin] Manual stock adjustment with audit trail' })
  adjust(@CurrentUser() user: AuthUser, @Body() dto: AdjustStockDto) {
    return this.inventory.adjust(user.id, dto);
  }

  @Get('history')
  @ApiOperation({ summary: '[admin] Stock adjustment history' })
  history(@Query('variantId') variantId?: string) {
    return this.inventory.history(variantId || undefined);
  }
}
