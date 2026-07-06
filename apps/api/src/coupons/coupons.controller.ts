import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

import { CurrentUser, AuthUser } from '@/auth/decorators/current-user.decorator';
import { Roles } from '@/auth/decorators/roles.decorator';
import { CouponsService } from './coupons.service';
import { CreateCouponDto, UpdateCouponDto, ValidateCouponDto } from './dto/coupons.dto';

@ApiTags('coupons')
@Controller('coupons')
export class CouponsController {
  constructor(private readonly coupons: CouponsService) {}

  @Post('validate')
  @ApiOperation({ summary: 'Validate a coupon code against the current cart' })
  validate(@CurrentUser() user: AuthUser, @Body() dto: ValidateCouponDto) {
    return this.coupons.validateAgainstCart(dto.code, user.id);
  }

  @Roles(UserRole.ADMIN)
  @Get()
  @ApiOperation({ summary: '[admin] List coupons with usage and revenue' })
  list() {
    return this.coupons.list();
  }

  @Roles(UserRole.ADMIN)
  @Post()
  @ApiOperation({ summary: '[admin] Create a coupon' })
  create(@Body() dto: CreateCouponDto) {
    return this.coupons.create(dto);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: '[admin] Update a coupon' })
  update(@Param('id') id: string, @Body() dto: UpdateCouponDto) {
    return this.coupons.update(id, dto);
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: '[admin] Delete a coupon (only if never used)' })
  remove(@Param('id') id: string) {
    return this.coupons.remove(id);
  }
}
