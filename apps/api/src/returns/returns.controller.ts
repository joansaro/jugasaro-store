import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ReturnStatus, UserRole } from '@prisma/client';
import { IsBoolean, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { CurrentUser, AuthUser } from '@/auth/decorators/current-user.decorator';
import { Roles } from '@/auth/decorators/roles.decorator';
import { ReturnsService } from './returns.service';

class RequestReturnDto {
  @ApiProperty()
  @IsString()
  orderId!: string;

  @ApiProperty({ example: 'Wrong size — I need a smaller one' })
  @IsString()
  @MinLength(5)
  @MaxLength(500)
  reason!: string;
}

class ResolveReturnDto {
  @ApiProperty({ description: 'true approves (refunds the order), false rejects' })
  @IsBoolean()
  approve!: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  adminNote?: string;
}

@ApiTags('returns')
@Controller('returns')
export class ReturnsController {
  constructor(private readonly returns: ReturnsService) {}

  @Post()
  @ApiOperation({ summary: 'Request a return for a shipped/delivered order' })
  request(@CurrentUser() user: AuthUser, @Body() dto: RequestReturnDto) {
    return this.returns.request(user.id, dto.orderId, dto.reason);
  }

  @Get('order/:orderId')
  @ApiOperation({ summary: 'Return status of one of your orders (null if none)' })
  forOrder(@CurrentUser() user: AuthUser, @Param('orderId') orderId: string) {
    return this.returns.forOrder(orderId, user.id);
  }

  @Roles(UserRole.ADMIN)
  @Get()
  @ApiOperation({ summary: '[admin] List return requests' })
  list(@Query('status') status?: ReturnStatus) {
    return this.returns.listAdmin(status);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id/resolve')
  @ApiOperation({ summary: '[admin] Approve (refund) or reject a return' })
  resolve(@Param('id') id: string, @Body() dto: ResolveReturnDto) {
    return this.returns.resolve(id, dto.approve, dto.adminNote);
  }
}
