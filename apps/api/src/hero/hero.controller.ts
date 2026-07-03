import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

import { Public } from '@/auth/decorators/public.decorator';
import { Roles } from '@/auth/decorators/roles.decorator';
import { HeroService } from './hero.service';
import { CreateHeroSlideDto, UpdateHeroSlideDto } from './dto/upsert-hero-slide.dto';

@ApiTags('hero')
@Controller('hero-slides')
export class HeroController {
  constructor(private readonly hero: HeroService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Active hero slides in display order (public)' })
  listActive() {
    return this.hero.listActive();
  }

  @Roles(UserRole.ADMIN)
  @Get('all')
  @ApiOperation({ summary: '[admin] All hero slides, including inactive' })
  listAll() {
    return this.hero.listAll();
  }

  @Roles(UserRole.ADMIN)
  @Get(':id')
  @ApiOperation({ summary: '[admin] Get a slide by id' })
  findOne(@Param('id') id: string) {
    return this.hero.findOne(id);
  }

  @Roles(UserRole.ADMIN)
  @Post()
  @ApiOperation({ summary: '[admin] Create a hero slide' })
  create(@Body() dto: CreateHeroSlideDto) {
    return this.hero.create(dto);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: '[admin] Update a hero slide' })
  update(@Param('id') id: string, @Body() dto: UpdateHeroSlideDto) {
    return this.hero.update(id, dto);
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: '[admin] Delete a hero slide' })
  remove(@Param('id') id: string) {
    return this.hero.remove(id);
  }
}
