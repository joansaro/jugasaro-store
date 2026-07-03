import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

import { CurrentUser, AuthUser } from '@/auth/decorators/current-user.decorator';
import { Roles } from '@/auth/decorators/roles.decorator';
import { OrdersService } from './orders.service';
import {
  CreateOrderDto,
  ListOrdersDto,
  UpdateOrderStatusDto,
} from './dto/orders.dto';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Get()
  @ApiOperation({ summary: 'List the current user orders' })
  list(@CurrentUser() user: AuthUser, @Query() query: ListOrdersDto) {
    return this.orders.listForUser(user.id, query);
  }

  @Post()
  @ApiOperation({ summary: 'Checkout — creates an order from the current cart (simulated payment)' })
  checkout(@CurrentUser() user: AuthUser, @Body() dto: CreateOrderDto) {
    return this.orders.checkout(user.id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single order (own order, or any if admin)' })
  findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.orders.findOne(id, user);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id/status')
  @ApiOperation({ summary: '[admin] Update the status of an order' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.orders.updateStatus(id, dto.status);
  }
}
