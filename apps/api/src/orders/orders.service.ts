import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, Prisma, UserRole } from '@prisma/client';

import { PrismaService } from '@/prisma/prisma.service';
import { AuthUser } from '@/auth/decorators/current-user.decorator';
import {
  CreateOrderDto,
  ListOrdersDto,
  ShippingAddressDto,
} from './dto/orders.dto';

const ORDER_INCLUDE = {
  items: { orderBy: { productName: 'asc' as const } },
  shippingAddress: true,
} satisfies Prisma.OrderInclude;

type OrderWithRelations = Prisma.OrderGetPayload<{ include: typeof ORDER_INCLUDE }>;

const FREE_SHIPPING_THRESHOLD_CENTS = 7500; // $75.00 — matches the mockup banner

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  // ---------- queries ----------

  async listForUser(userId: string, query: ListOrdersDto) {
    return this.listInternal({ userId, ...query });
  }

  async listAll(query: ListOrdersDto) {
    return this.listInternal({ ...query });
  }

  private async listInternal(args: ListOrdersDto & { userId?: string }) {
    const where: Prisma.OrderWhereInput = {};
    if (args.userId) where.userId = args.userId;
    if (args.status) where.status = args.status;

    const page = args.page ?? 1;
    const pageSize = args.pageSize ?? 20;
    const skip = (page - 1) * pageSize;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        include: ORDER_INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      items: items.map((o) => this.toResponse(o)),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findOne(orderId: string, user: AuthUser) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: ORDER_INCLUDE,
    });
    if (!order) throw new NotFoundException('Order not found');
    if (user.role !== UserRole.ADMIN && order.userId !== user.id) {
      throw new ForbiddenException('Not your order');
    }
    return this.toResponse(order);
  }

  // ---------- checkout ----------

  async checkout(userId: string, dto: CreateOrderDto) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { product: true, variant: true },
        },
      },
    });
    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // Reload products to ensure we have current prices and stock
    const items = cart.items;
    for (const item of items) {
      if (!item.product.published) {
        throw new BadRequestException(`"${item.product.name}" is no longer available`);
      }
      if (item.product.outOfStock) {
        throw new BadRequestException(`"${item.product.name}" is out of stock`);
      }
      if (item.variant && item.variant.stock < item.quantity) {
        throw new BadRequestException(
          `Not enough stock for "${item.product.name}" (have ${item.variant.stock}, need ${item.quantity})`,
        );
      }
    }

    const subtotal = items.reduce((sum, item) => {
      const price = item.variant?.priceOverride ?? item.product.price;
      return sum + price * item.quantity;
    }, 0);
    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : 999; // $9.99 default
    const tax = 0; // TODO: tax handling
    const total = subtotal + shipping + tax;

    const order = await this.prisma.$transaction(async (tx) => {
      const address = await tx.address.create({
        data: this.snapshotAddress(userId, dto.shippingAddress),
      });

      const number = await this.nextOrderNumber(tx);

      const created = await tx.order.create({
        data: {
          number,
          userId,
          status: OrderStatus.PAID, // simulated payment — Fase 5/7 wire up real gateway
          subtotal,
          shipping,
          tax,
          total,
          shippingAddressId: address.id,
          items: {
            create: items.map((item) => {
              const unit = item.variant?.priceOverride ?? item.product.price;
              return {
                productId: item.product.id,
                variantId: item.variant?.id ?? null,
                productName: item.product.name,
                variantSku: item.variant?.sku ?? null,
                unitPrice: unit,
                quantity: item.quantity,
                totalPrice: unit * item.quantity,
              };
            }),
          },
        },
        include: ORDER_INCLUDE,
      });

      // Decrement variant stock
      for (const item of items) {
        if (item.variant) {
          await tx.productVariant.update({
            where: { id: item.variant.id },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }

      // Empty the cart
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return created;
    });

    return this.toResponse(order);
  }

  // ---------- admin ----------

  async updateStatus(orderId: string, status: OrderStatus) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: ORDER_INCLUDE,
    });
    return this.toResponse(updated);
  }

  // ---------- helpers ----------

  private snapshotAddress(userId: string, dto: ShippingAddressDto) {
    return {
      userId,
      fullName: dto.fullName,
      line1: dto.line1,
      line2: dto.line2 ?? null,
      city: dto.city,
      state: dto.state ?? null,
      postalCode: dto.postalCode,
      country: dto.country ?? 'AR',
      phone: dto.phone ?? null,
    };
  }

  private async nextOrderNumber(tx: Prisma.TransactionClient): Promise<string> {
    const count = await tx.order.count();
    return `JG-${String(count + 1).padStart(6, '0')}`;
  }

  private toResponse(order: OrderWithRelations) {
    return {
      id: order.id,
      number: order.number,
      status: order.status,
      subtotal: order.subtotal,
      shipping: order.shipping,
      tax: order.tax,
      total: order.total,
      items: order.items.map((it) => ({
        id: it.id,
        productId: it.productId,
        productName: it.productName,
        variantSku: it.variantSku,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        totalPrice: it.totalPrice,
      })),
      shippingAddress: order.shippingAddress
        ? {
            id: order.shippingAddress.id,
            fullName: order.shippingAddress.fullName,
            line1: order.shippingAddress.line1,
            line2: order.shippingAddress.line2,
            city: order.shippingAddress.city,
            state: order.shippingAddress.state,
            postalCode: order.shippingAddress.postalCode,
            country: order.shippingAddress.country,
            phone: order.shippingAddress.phone,
          }
        : null,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}
