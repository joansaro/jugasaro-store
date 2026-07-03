import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { UserRole } from '@prisma/client';

import { Roles } from '@/auth/decorators/roles.decorator';
import { CurrentUser, AuthUser } from '@/auth/decorators/current-user.decorator';
import { OrdersService } from '@/orders/orders.service';
import { ListOrdersDto } from '@/orders/dto/orders.dto';
import { AdminService } from './admin.service';

class UpdateUserRoleDto {
  @IsEnum(UserRole)
  role!: UserRole;
}

class ListUsersDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 20;
}

@ApiTags('admin')
@Roles(UserRole.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(
    private readonly admin: AdminService,
    private readonly orders: OrdersService,
  ) {}

  @Get('dashboard')
  @ApiOperation({ summary: '[admin] Dashboard KPIs (last 30 days vs previous 30 days)' })
  dashboard() {
    return this.admin.dashboard();
  }

  @Get('users')
  @ApiOperation({ summary: '[admin] Paginated list of all users' })
  listUsers(@Query() query: ListUsersDto) {
    return this.admin.listUsers(query);
  }

  @Patch('users/:id/role')
  @ApiOperation({ summary: '[admin] Promote or demote a user (USER / ADMIN)' })
  updateUserRole(
    @Param('id') id: string,
    @Body() dto: UpdateUserRoleDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.admin.updateUserRole(id, dto.role, user.id);
  }

  @Get('orders')
  @ApiOperation({ summary: '[admin] Paginated list of all orders' })
  listOrders(@Query() query: ListOrdersDto) {
    return this.orders.listAll(query);
  }
}
