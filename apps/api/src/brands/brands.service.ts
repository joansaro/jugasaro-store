import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';

import { PrismaService } from '@/prisma/prisma.service';
import { slugify } from '@/common/slugify';
import { CreateBrandDto, UpdateBrandDto } from './dto/upsert-brand.dto';

@Injectable()
export class BrandsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(opts: { withCount?: boolean } = {}) {
    const brands = await this.prisma.brand.findMany({
      orderBy: { name: 'asc' },
      include: opts.withCount ? { _count: { select: { products: true } } } : undefined,
    });

    return brands.map((b) => ({
      id: b.id,
      slug: b.slug,
      name: b.name,
      description: b.description,
      logoUrl: b.logoUrl,
      productCount:
        '_count' in b && (b as { _count: { products: number } })._count
          ? (b as { _count: { products: number } })._count.products
          : undefined,
      createdAt: b.createdAt,
      updatedAt: b.updatedAt,
    }));
  }

  async findBySlug(slug: string) {
    const brand = await this.prisma.brand.findUnique({
      where: { slug },
      include: { _count: { select: { products: true } } },
    });
    if (!brand) throw new NotFoundException(`Brand "${slug}" not found`);

    return {
      id: brand.id,
      slug: brand.slug,
      name: brand.name,
      description: brand.description,
      logoUrl: brand.logoUrl,
      productCount: brand._count.products,
      createdAt: brand.createdAt,
      updatedAt: brand.updatedAt,
    };
  }

  async create(dto: CreateBrandDto) {
    const slug = dto.slug ?? slugify(dto.name);
    const existing = await this.prisma.brand.findUnique({ where: { slug } });
    if (existing) throw new ConflictException(`Brand with slug "${slug}" already exists`);

    return this.prisma.brand.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description ?? null,
        logoUrl: dto.logoUrl ?? null,
      },
    });
  }

  async update(id: string, dto: UpdateBrandDto) {
    const brand = await this.prisma.brand.findUnique({ where: { id } });
    if (!brand) throw new NotFoundException('Brand not found');

    const slug = dto.slug ?? (dto.name ? slugify(dto.name) : brand.slug);
    if (slug !== brand.slug) {
      const existing = await this.prisma.brand.findUnique({ where: { slug } });
      if (existing) throw new ConflictException(`Brand with slug "${slug}" already exists`);
    }

    return this.prisma.brand.update({
      where: { id },
      data: {
        name: dto.name ?? brand.name,
        slug,
        description: dto.description ?? brand.description,
        logoUrl: dto.logoUrl ?? brand.logoUrl,
      },
    });
  }

  async remove(id: string) {
    const brand = await this.prisma.brand.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });
    if (!brand) throw new NotFoundException('Brand not found');
    if (brand._count.products > 0) {
      throw new ConflictException(
        `Cannot delete brand with ${brand._count.products} products. Reassign or delete products first.`,
      );
    }
    await this.prisma.brand.delete({ where: { id } });
    return { ok: true };
  }
}
