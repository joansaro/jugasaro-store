import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

import { Public } from '@/auth/decorators/public.decorator';
import { Roles } from '@/auth/decorators/roles.decorator';
import { ShippingService } from './shipping.service';
import { UpdateShippingMethodDto, UpsertShippingMethodDto } from './dto/shipping.dto';

@ApiTags('shipping')
@Controller('shipping-methods')
export class ShippingController {
  constructor(private readonly shipping: ShippingService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Active shipping methods for checkout' })
  listActive() {
    return this.shipping.listActive();
  }

  @Roles(UserRole.ADMIN)
  @Get('all')
  @ApiOperation({ summary: '[admin] All shipping methods' })
  listAll() {
    return this.shipping.listAll();
  }

  @Roles(UserRole.ADMIN)
  @Post()
  @ApiOperation({ summary: '[admin] Create a shipping method' })
  create(@Body() dto: UpsertShippingMethodDto) {
    return this.shipping.create(dto);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: '[admin] Update a shipping method' })
  update(@Param('id') id: string, @Body() dto: UpdateShippingMethodDto) {
    return this.shipping.update(id, dto);
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: '[admin] Delete (or deactivate, if used by orders)' })
  remove(@Param('id') id: string) {
    return this.shipping.remove(id);
  }
}
