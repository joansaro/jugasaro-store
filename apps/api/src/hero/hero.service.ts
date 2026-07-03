import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '@/prisma/prisma.service';
import { CreateHeroSlideDto, UpdateHeroSlideDto } from './dto/upsert-hero-slide.dto';

@Injectable()
export class HeroService {
  constructor(private readonly prisma: PrismaService) {}

  /** Public: active slides in display order. */
  listActive() {
    return this.prisma.heroSlide.findMany({
      where: { active: true },
      orderBy: { position: 'asc' },
    });
  }

  /** Admin: every slide, including inactive ones. */
  listAll() {
    return this.prisma.heroSlide.findMany({ orderBy: { position: 'asc' } });
  }

  async findOne(id: string) {
    const slide = await this.prisma.heroSlide.findUnique({ where: { id } });
    if (!slide) throw new NotFoundException('Slide not found');
    return slide;
  }

  create(dto: CreateHeroSlideDto) {
    return this.prisma.heroSlide.create({
      data: {
        title: dto.title,
        subtitle: dto.subtitle ?? null,
        ctaLabel: dto.ctaLabel ?? null,
        ctaHref: dto.ctaHref ?? null,
        imageUrl: dto.imageUrl,
        position: dto.position ?? 0,
        active: dto.active ?? true,
      },
    });
  }

  async update(id: string, dto: UpdateHeroSlideDto) {
    await this.findOne(id);
    return this.prisma.heroSlide.update({
      where: { id },
      data: {
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.subtitle !== undefined ? { subtitle: dto.subtitle } : {}),
        ...(dto.ctaLabel !== undefined ? { ctaLabel: dto.ctaLabel } : {}),
        ...(dto.ctaHref !== undefined ? { ctaHref: dto.ctaHref } : {}),
        ...(dto.imageUrl !== undefined ? { imageUrl: dto.imageUrl } : {}),
        ...(dto.position !== undefined ? { position: dto.position } : {}),
        ...(dto.active !== undefined ? { active: dto.active } : {}),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.heroSlide.delete({ where: { id } });
    return { ok: true };
  }
}
