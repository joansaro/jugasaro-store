import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

import { Public } from '@/auth/decorators/public.decorator';
import { Roles } from '@/auth/decorators/roles.decorator';
import { BrandsService } from './brands.service';
import { CreateBrandDto, UpdateBrandDto } from './dto/upsert-brand.dto';

@ApiTags('brands')
@Controller('brands')
export class BrandsController {
  constructor(private readonly brands: BrandsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List all brands' })
  list(@Query('withCount') withCount?: string) {
    return this.brands.list({ withCount: withCount === 'true' });
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Get a brand by slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.brands.findBySlug(slug);
  }

  @Roles(UserRole.ADMIN)
  @Post()
  @ApiOperation({ summary: '[admin] Create a brand' })
  create(@Body() dto: CreateBrandDto) {
    return this.brands.create(dto);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: '[admin] Update a brand' })
  update(@Param('id') id: string, @Body() dto: UpdateBrandDto) {
    return this.brands.update(id, dto);
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: '[admin] Delete a brand (only if it has no products)' })
  remove(@Param('id') id: string) {
    return this.brands.remove(id);
  }
}
