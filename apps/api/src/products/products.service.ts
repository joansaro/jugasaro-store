import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Product } from '@prisma/client';

import { PrismaService } from '@/prisma/prisma.service';
import { slugify } from '@/common/slugify';
import { ListProductsDto } from './dto/list-products.dto';
import { CreateProductDto, UpdateProductDto } from './dto/upsert-product.dto';

const PRODUCT_LIST_INCLUDE = {
  brand: { select: { id: true, slug: true, name: true } },
  category: { select: { id: true, slug: true, name: true } },
  images: { orderBy: { position: 'asc' as const }, take: 1 },
} satisfies Prisma.ProductInclude;

const PRODUCT_FULL_INCLUDE = {
  brand: { select: { id: true, slug: true, name: true } },
  category: { select: { id: true, slug: true, name: true } },
  images: { orderBy: { position: 'asc' as const } },
  variants: { orderBy: { createdAt: 'asc' as const } },
} satisfies Prisma.ProductInclude;

type ProductWithListRelations = Prisma.ProductGetPayload<{
  include: typeof PRODUCT_LIST_INCLUDE;
}>;

type ProductWithFullRelations = Prisma.ProductGetPayload<{
  include: typeof PRODUCT_FULL_INCLUDE;
}>;

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  // ---------- queries ----------

  async list(query: ListProductsDto) {
    const where: Prisma.ProductWhereInput = { published: true };

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.brandSlug) where.brand = { slug: query.brandSlug };
    if (query.categorySlug) where.category = { slug: query.categorySlug };
    if (query.tag) where.tag = query.tag;
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.price = {
        ...(query.minPrice !== undefined && { gte: query.minPrice }),
        ...(query.maxPrice !== undefined && { lte: query.maxPrice }),
      };
    }

    const orderBy: Prisma.ProductOrderByWithRelationInput =
      query.sort === 'price-asc'
        ? { price: 'asc' }
        : query.sort === 'price-desc'
          ? { price: 'desc' }
          : query.sort === 'popular'
            ? { orderItems: { _count: 'desc' } }
            : { createdAt: 'desc' };

    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 24;
    const skip = (page - 1) * pageSize;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        include: PRODUCT_LIST_INCLUDE,
        orderBy,
        skip,
        take: pageSize,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      items: items.map((p) => this.toListItem(p)),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: PRODUCT_FULL_INCLUDE,
    });
    if (!product) throw new NotFoundException(`Product "${slug}" not found`);
    return this.toFull(product);
  }

  async findById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: PRODUCT_FULL_INCLUDE,
    });
    if (!product) throw new NotFoundException('Product not found');
    return this.toFull(product);
  }

  // ---------- mutations ----------

  async create(dto: CreateProductDto) {
    const slug = await this.uniqueSlug(dto.slug ?? slugify(dto.name));

    await this.assertBrandAndCategoryExist(dto.brandId, dto.categoryId);

    const product = await this.prisma.product.create({
      data: {
        slug,
        name: dto.name,
        description: dto.description ?? null,
        price: dto.price,
        compareAtPrice: dto.compareAtPrice ?? null,
        tag: dto.tag ?? null,
        outOfStock: dto.outOfStock ?? false,
        published: dto.published ?? true,
        brandId: dto.brandId,
        categoryId: dto.categoryId,
        images: dto.images?.length
          ? {
              create: dto.images.map((img, i) => ({
                url: img.url,
                alt: img.alt ?? dto.name,
                position: img.position ?? i,
              })),
            }
          : undefined,
        variants: dto.variants?.length
          ? {
              create: dto.variants.map((v, i) => ({
                sku: v.sku ?? `${slug}-${i + 1}`,
                color: v.color ?? null,
                size: v.size ?? null,
                stock: v.stock ?? 0,
                priceOverride: v.priceOverride ?? null,
              })),
            }
          : {
              create: [
                {
                  sku: `${slug}-default`,
                  stock: 0,
                },
              ],
            },
      },
      include: PRODUCT_FULL_INCLUDE,
    });

    return this.toFull(product);
  }

  async update(id: string, dto: UpdateProductDto) {
    const existing = await this.prisma.product.findUnique({
      where: { id },
      include: { variants: true },
    });
    if (!existing) throw new NotFoundException('Product not found');

    if (dto.brandId || dto.categoryId) {
      await this.assertBrandAndCategoryExist(
        dto.brandId ?? existing.brandId,
        dto.categoryId ?? existing.categoryId,
      );
    }

    const newSlug = dto.slug ?? (dto.name ? slugify(dto.name) : existing.slug);
    const slug =
      newSlug === existing.slug ? existing.slug : await this.uniqueSlug(newSlug, id);

    await this.prisma.product.update({
      where: { id },
      data: {
        slug,
        name: dto.name ?? existing.name,
        description: dto.description === undefined ? existing.description : dto.description,
        price: dto.price ?? existing.price,
        compareAtPrice:
          dto.compareAtPrice === undefined ? existing.compareAtPrice : dto.compareAtPrice,
        tag: dto.tag === undefined ? existing.tag : dto.tag,
        outOfStock: dto.outOfStock ?? existing.outOfStock,
        published: dto.published ?? existing.published,
        brandId: dto.brandId ?? existing.brandId,
        categoryId: dto.categoryId ?? existing.categoryId,
      },
    });

    if (dto.variants) {
      await this.syncVariants(id, slug, dto.variants);
    }

    if (dto.images) {
      await this.syncImages(id, dto.name ?? existing.name, dto.images);
    }

    return this.findById(id);
  }

  private async syncImages(
    productId: string,
    productName: string,
    images: NonNullable<UpdateProductDto['images']>,
  ) {
    // Replace the full image set (simple + predictable for the admin).
    await this.prisma.productImage.deleteMany({ where: { productId } });
    if (images.length) {
      await this.prisma.productImage.createMany({
        data: images.map((img, i) => ({
          productId,
          url: img.url,
          alt: img.alt ?? productName,
          position: img.position ?? i,
        })),
      });
    }
  }

  async remove(id: string) {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Product not found');
    await this.prisma.product.delete({ where: { id } });
    return { ok: true };
  }

  // ---------- helpers ----------

  private async syncVariants(
    productId: string,
    productSlug: string,
    variants: NonNullable<UpdateProductDto['variants']>,
  ) {
    const incomingIds = variants.filter((v) => v.id).map((v) => v.id!);

    // Remove variants that are no longer in the payload
    await this.prisma.productVariant.deleteMany({
      where: { productId, id: { notIn: incomingIds.length ? incomingIds : ['__none__'] } },
    });

    let i = 0;
    for (const v of variants) {
      i += 1;
      if (v.id) {
        await this.prisma.productVariant.update({
          where: { id: v.id },
          data: {
            sku: v.sku,
            color: v.color ?? null,
            size: v.size ?? null,
            stock: v.stock ?? 0,
            priceOverride: v.priceOverride ?? null,
          },
        });
      } else {
        await this.prisma.productVariant.create({
          data: {
            productId,
            sku: v.sku ?? `${productSlug}-${i}`,
            color: v.color ?? null,
            size: v.size ?? null,
            stock: v.stock ?? 0,
            priceOverride: v.priceOverride ?? null,
          },
        });
      }
    }
  }

  private async uniqueSlug(base: string, excludeId?: string): Promise<string> {
    let slug = base;
    let counter = 2;
    while (true) {
      const existing = await this.prisma.product.findUnique({ where: { slug } });
      if (!existing || existing.id === excludeId) return slug;
      slug = `${base}-${counter}`;
      counter += 1;
      if (counter > 50) throw new ConflictException('Could not generate unique slug');
    }
  }

  private async assertBrandAndCategoryExist(brandId: string, categoryId: string) {
    const [brand, category] = await Promise.all([
      this.prisma.brand.findUnique({ where: { id: brandId } }),
      this.prisma.category.findUnique({ where: { id: categoryId } }),
    ]);
    if (!brand) throw new NotFoundException(`Brand ${brandId} not found`);
    if (!category) throw new NotFoundException(`Category ${categoryId} not found`);
  }

  private toListItem(p: ProductWithListRelations) {
    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      price: p.price,
      compareAtPrice: p.compareAtPrice,
      tag: p.tag,
      outOfStock: p.outOfStock,
      brand: p.brand,
      category: p.category,
      thumbnailUrl: p.images[0]?.url ?? null,
    };
  }

  private toFull(p: ProductWithFullRelations) {
    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      description: p.description,
      price: p.price,
      compareAtPrice: p.compareAtPrice,
      tag: p.tag,
      outOfStock: p.outOfStock,
      published: p.published,
      brand: p.brand,
      category: p.category,
      images: p.images.map((img) => ({
        id: img.id,
        url: img.url,
        alt: img.alt,
        position: img.position,
      })),
      variants: p.variants.map((v) => ({
        id: v.id,
        sku: v.sku,
        color: v.color,
        size: v.size,
        stock: v.stock,
        priceOverride: v.priceOverride,
      })),
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    };
  }
}
