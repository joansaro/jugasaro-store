import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';

import { PrismaService } from '@/prisma/prisma.service';
import { slugify } from '@/common/slugify';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/upsert-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(opts: { withCount?: boolean } = {}) {
    const cats = await this.prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: opts.withCount ? { _count: { select: { products: true } } } : undefined,
    });

    return cats.map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      description: c.description,
      imageUrl: c.imageUrl,
      parentId: c.parentId,
      productCount:
        '_count' in c && (c as { _count: { products: number } })._count
          ? (c as { _count: { products: number } })._count.products
          : undefined,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));
  }

  async findBySlug(slug: string) {
    const cat = await this.prisma.category.findUnique({
      where: { slug },
      include: { _count: { select: { products: true } } },
    });
    if (!cat) throw new NotFoundException(`Category "${slug}" not found`);

    return {
      id: cat.id,
      slug: cat.slug,
      name: cat.name,
      description: cat.description,
      imageUrl: cat.imageUrl,
      parentId: cat.parentId,
      productCount: cat._count.products,
      createdAt: cat.createdAt,
      updatedAt: cat.updatedAt,
    };
  }

  async create(dto: CreateCategoryDto) {
    const slug = dto.slug ?? slugify(dto.name);
    const existing = await this.prisma.category.findUnique({ where: { slug } });
    if (existing) throw new ConflictException(`Category with slug "${slug}" already exists`);

    return this.prisma.category.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description ?? null,
        imageUrl: dto.imageUrl ?? null,
        parentId: dto.parentId ?? null,
      },
    });
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const cat = await this.prisma.category.findUnique({ where: { id } });
    if (!cat) throw new NotFoundException('Category not found');

    const slug = dto.slug ?? (dto.name ? slugify(dto.name) : cat.slug);
    if (slug !== cat.slug) {
      const existing = await this.prisma.category.findUnique({ where: { slug } });
      if (existing) throw new ConflictException(`Category with slug "${slug}" already exists`);
    }

    return this.prisma.category.update({
      where: { id },
      data: {
        name: dto.name ?? cat.name,
        slug,
        description: dto.description ?? cat.description,
        imageUrl: dto.imageUrl ?? cat.imageUrl,
        parentId: dto.parentId === undefined ? cat.parentId : dto.parentId,
      },
    });
  }

  async remove(id: string) {
    const cat = await this.prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true, children: true } } },
    });
    if (!cat) throw new NotFoundException('Category not found');
    if (cat._count.products > 0) {
      throw new ConflictException(
        `Cannot delete category with ${cat._count.products} products. Reassign or delete products first.`,
      );
    }
    if (cat._count.children > 0) {
      throw new ConflictException(`Cannot delete category with ${cat._count.children} sub-categories.`);
    }
    await this.prisma.category.delete({ where: { id } });
    return { ok: true };
  }
}
