import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ReviewStatus, UserRole } from '@prisma/client';

import { Public } from '@/auth/decorators/public.decorator';
import { CurrentUser, AuthUser } from '@/auth/decorators/current-user.decorator';
import { Roles } from '@/auth/decorators/roles.decorator';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto, ModerateReviewDto } from './dto/reviews.dto';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviews: ReviewsService) {}

  @Public()
  @Get('product/:productId')
  @ApiOperation({ summary: 'Approved reviews + rating stats for a product' })
  listForProduct(@Param('productId') productId: string) {
    return this.reviews.listForProduct(productId);
  }

  @Post()
  @ApiOperation({ summary: 'Write a review (goes to moderation)' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateReviewDto) {
    return this.reviews.create(user.id, dto);
  }

  @Roles(UserRole.ADMIN)
  @Get()
  @ApiOperation({ summary: '[admin] List reviews, optionally by status' })
  listAdmin(@Query('status') status?: ReviewStatus) {
    return this.reviews.listAdmin(status);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id/status')
  @ApiOperation({ summary: '[admin] Approve or reject a review' })
  moderate(@Param('id') id: string, @Body() dto: ModerateReviewDto) {
    return this.reviews.moderate(id, dto.status);
  }
}
