import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

import { CurrentUser, AuthUser } from '@/auth/decorators/current-user.decorator';
import { Roles } from '@/auth/decorators/roles.decorator';
import { PromotionsService } from './promotions.service';
import { UpdatePromotionDto, UpsertPromotionDto } from './dto/promotions.dto';

@ApiTags('promotions')
@Controller('promotions')
export class PromotionsController {
  constructor(private readonly promotions: PromotionsService) {}

  @Get('cart-discount')
  @ApiOperation({ summary: 'Automatic promotion discount for the current cart' })
  cartDiscount(@CurrentUser() user: AuthUser) {
    return this.promotions.discountForCart(user.id);
  }

  @Roles(UserRole.ADMIN)
  @Get()
  @ApiOperation({ summary: '[admin] List promotions' })
  list() {
    return this.promotions.list();
  }

  @Roles(UserRole.ADMIN)
  @Post()
  @ApiOperation({ summary: '[admin] Create a promotion' })
  create(@Body() dto: UpsertPromotionDto) {
    return this.promotions.create(dto);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: '[admin] Update a promotion' })
  update(@Param('id') id: string, @Body() dto: UpdatePromotionDto) {
    return this.promotions.update(id, dto);
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: '[admin] Delete a promotion' })
  remove(@Param('id') id: string) {
    return this.promotions.remove(id);
  }
}
