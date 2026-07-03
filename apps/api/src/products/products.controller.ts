import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

import { Public } from '@/auth/decorators/public.decorator';
import { Roles } from '@/auth/decorators/roles.decorator';
import { ProductsService } from './products.service';
import { ListProductsDto } from './dto/list-products.dto';
import { CreateProductDto, UpdateProductDto } from './dto/upsert-product.dto';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List products with filtering, search and pagination' })
  list(@Query() query: ListProductsDto) {
    return this.products.list(query);
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Get a product by slug (with variants and images)' })
  findBySlug(@Param('slug') slug: string) {
    return this.products.findBySlug(slug);
  }

  @Roles(UserRole.ADMIN)
  @Post()
  @ApiOperation({ summary: '[admin] Create a product' })
  create(@Body() dto: CreateProductDto) {
    return this.products.create(dto);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: '[admin] Update a product (and sync variants)' })
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.products.update(id, dto);
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: '[admin] Delete a product' })
  remove(@Param('id') id: string) {
    return this.products.remove(id);
  }
}
