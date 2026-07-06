import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, Prisma, UserRole } from '@prisma/client';

import { PrismaService } from '@/prisma/prisma.service';
import { AuthUser } from '@/auth/decorators/current-user.decorator';
import { CouponsService } from '@/coupons/coupons.service';
import { ShippingService } from '@/shipping/shipping.service';
import { SettingsService } from '@/settings/settings.service';
import { MailService } from '@/mail/mail.service';
import {
  CreateOrderDto,
  ListOrdersDto,
  ShippingAddressDto,
} from './dto/orders.dto';

const ORDER_INCLUDE = {
  items: { orderBy: { productName: 'asc' as const } },
  shippingAddress: true,
  user: { select: { email: true, name: true } },
} satisfies Prisma.OrderInclude;

type OrderWithRelations = Prisma.OrderGetPayload<{ include: typeof ORDER_INCLUDE }>;

// Statuses where stock was taken and the user can still self-cancel.
const USER_CANCELLABLE: OrderStatus[] = [OrderStatus.PENDING, OrderStatus.PAID];
// Entering one of these returns stock to inventory.
const RESTOCK_STATUSES: OrderStatus[] = [OrderStatus.CANCELLED, OrderStatus.REFUNDED];

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly coupons: CouponsService,
    private readonly shipping: ShippingService,
    private readonly settings: SettingsService,
    private readonly mail: MailService,
  ) {}

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

    // Coupon (optional): validated against subtotal and usage limits
    let couponId: string | null = null;
    let couponCode: string | null = null;
    let discount = 0;
    if (dto.couponCode) {
      const result = await this.coupons.validateForUser(dto.couponCode, userId, subtotal);
      couponId = result.coupon.id;
      couponCode = result.coupon.code;
      discount = result.discount;
    }

    // Shipping method (chosen or fallback) with free-above rule
    const method = await this.shipping.resolveForCheckout(dto.shippingMethodId);
    const shipping = this.shipping.priceFor(method, subtotal);

    // Tax over the discounted goods (not over shipping), from store settings
    const taxRateBps = await this.settings.taxRateBps();
    const tax = Math.round(((subtotal - discount) * taxRateBps) / 10_000);

    const total = subtotal - discount + shipping + tax;

    const order = await this.prisma.$transaction(async (tx) => {
      const address = await tx.address.create({
        data: this.snapshotAddress(userId, dto.shippingAddress),
      });

      const number = await this.nextOrderNumber(tx);

      const created = await tx.order.create({
        data: {
          number,
          userId,
          status: OrderStatus.PAID, // simulated payment — this is a showcase system
          subtotal,
          discount,
          shipping,
          tax,
          total,
          couponId,
          couponCode,
          shippingMethodId: method.id,
          shippingMethodName: method.name,
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

      // Record the coupon redemption (enforces the audit trail)
      if (couponId) {
        await tx.couponRedemption.create({
          data: { couponId, userId, orderId: created.id },
        });
      }

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

    this.mail.sendOrderConfirmation(order.user.email, {
      number: order.number,
      total: order.total,
      items: order.items,
    });

    return this.toResponse(order);
  }

  // ---------- lifecycle ----------

  /** Customer self-cancel while the order hasn't started fulfillment. */
  async cancelOwn(orderId: string, user: AuthUser) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');
    if (order.userId !== user.id) throw new ForbiddenException('Not your order');
    if (!USER_CANCELLABLE.includes(order.status)) {
      throw new BadRequestException(
        'This order is already being processed and can no longer be cancelled',
      );
    }
    return this.transition(orderId, OrderStatus.CANCELLED);
  }

  /** Admin status change; also accepts a tracking number (e.g. when shipping). */
  async updateStatus(orderId: string, status: OrderStatus, trackingNumber?: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');
    return this.transition(orderId, status, trackingNumber);
  }

  /**
   * Applies a status change. When the order enters CANCELLED/REFUNDED the
   * variant stock is returned exactly once (guarded by `stockRestored`).
   */
  private async transition(orderId: string, status: OrderStatus, trackingNumber?: string) {
    const updated = await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUniqueOrThrow({
        where: { id: orderId },
        include: { items: true },
      });

      const shouldRestock = RESTOCK_STATUSES.includes(status) && !order.stockRestored;
      if (shouldRestock) {
        for (const item of order.items) {
          if (item.variantId) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: { stock: { increment: item.quantity } },
            });
          }
        }
      }

      return tx.order.update({
        where: { id: orderId },
        data: {
          status,
          ...(trackingNumber !== undefined ? { trackingNumber: trackingNumber || null } : {}),
          ...(shouldRestock ? { stockRestored: true } : {}),
        },
        include: ORDER_INCLUDE,
      });
    });

    // Notify the customer about meaningful transitions
    if (
      status === OrderStatus.SHIPPED ||
      status === OrderStatus.DELIVERED ||
      status === OrderStatus.CANCELLED ||
      status === OrderStatus.REFUNDED
    ) {
      this.mail.sendOrderStatus(updated.user.email, updated, status);
    }

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
      discount: order.discount,
      couponCode: order.couponCode,
      shipping: order.shipping,
      shippingMethodName: order.shippingMethodName,
      trackingNumber: order.trackingNumber,
      tax: order.tax,
      total: order.total,
      customerEmail: order.user?.email,
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
