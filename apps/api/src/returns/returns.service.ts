import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, ReturnStatus } from '@prisma/client';

import { PrismaService } from '@/prisma/prisma.service';
import { MailService } from '@/mail/mail.service';
import { OrdersService } from '@/orders/orders.service';

// Solo se pueden devolver pedidos ya entregados (o enviados, por si llegó sin marcar).
const RETURNABLE: OrderStatus[] = [OrderStatus.SHIPPED, OrderStatus.DELIVERED];

@Injectable()
export class ReturnsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly orders: OrdersService,
    private readonly mail: MailService,
  ) {}

  /** El cliente solicita la devolución de su pedido. */
  async request(userId: string, orderId: string, reason: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { returnRequest: true, user: { select: { email: true } } },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.userId !== userId) throw new ForbiddenException('Not your order');
    if (!RETURNABLE.includes(order.status)) {
      throw new BadRequestException('Only shipped or delivered orders can be returned');
    }
    if (order.returnRequest) {
      throw new BadRequestException('A return was already requested for this order');
    }

    const created = await this.prisma.returnRequest.create({
      data: { orderId, userId, reason },
    });
    this.mail.sendOrderStatus(order.user.email, order, 'RETURN REQUESTED');
    return created;
  }

  /** Estado de la devolución de un pedido propio (envuelto para JSON estable). */
  async forOrder(orderId: string, userId: string) {
    const request = await this.prisma.returnRequest.findUnique({ where: { orderId } });
    if (!request) return { request: null };
    if (request.userId !== userId) throw new ForbiddenException('Not your order');
    return { request };
  }

  // ---------- admin ----------

  listAdmin(status?: ReturnStatus) {
    return this.prisma.returnRequest.findMany({
      where: status ? { status } : {},
      include: {
        order: { select: { number: true, total: true, status: true } },
        user: { select: { email: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Resuelve la solicitud. Aprobar dispara el reembolso del pedido
   * (transición a REFUNDED → repone stock + email, vía OrdersService).
   */
  async resolve(id: string, approve: boolean, adminNote?: string) {
    const request = await this.prisma.returnRequest.findUnique({
      where: { id },
      include: { order: true },
    });
    if (!request) throw new NotFoundException('Return request not found');
    if (request.status !== ReturnStatus.REQUESTED) {
      throw new BadRequestException('This request was already resolved');
    }

    const updated = await this.prisma.returnRequest.update({
      where: { id },
      data: {
        status: approve ? ReturnStatus.APPROVED : ReturnStatus.REJECTED,
        adminNote: adminNote ?? null,
      },
    });

    if (approve) {
      await this.orders.updateStatus(request.orderId, OrderStatus.REFUNDED);
    }
    return updated;
  }
}
