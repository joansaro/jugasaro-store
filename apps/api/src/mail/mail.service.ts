import { Injectable, Logger } from '@nestjs/common';

/**
 * Demo mailer: this is a showcase system, so no real SMTP is wired.
 * Emails are logged and kept in an in-memory outbox that the admin can
 * inspect at /admin (Email outbox). Swapping this for nodemailer/Resend
 * later only means replacing `deliver()`.
 */
export interface OutboxEmail {
  id: number;
  to: string;
  subject: string;
  body: string;
  sentAt: string;
}

const OUTBOX_LIMIT = 50;

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private outbox: OutboxEmail[] = [];
  private seq = 0;

  private deliver(to: string, subject: string, body: string) {
    const email: OutboxEmail = {
      id: ++this.seq,
      to,
      subject,
      body,
      sentAt: new Date().toISOString(),
    };
    this.outbox.unshift(email);
    if (this.outbox.length > OUTBOX_LIMIT) this.outbox.pop();
    this.logger.log(`📧 [${to}] ${subject}`);
    return email;
  }

  list(): OutboxEmail[] {
    return this.outbox;
  }

  // ---------- transactional emails ----------

  sendOrderConfirmation(to: string, order: { number: string; total: number; items: { productName: string; quantity: number }[] }) {
    const lines = order.items.map((i) => `  • ${i.quantity}× ${i.productName}`).join('\n');
    this.deliver(
      to,
      `Order ${order.number} confirmed`,
      `Thanks for your purchase!\n\nOrder ${order.number}\n${lines}\n\nTotal: $${(order.total / 100).toFixed(2)}\n\nWe'll email you when it ships.`,
    );
  }

  sendOrderStatus(
    to: string,
    order: { number: string; trackingNumber?: string | null },
    status: string,
  ) {
    const tracking = order.trackingNumber
      ? `\nTracking number: ${order.trackingNumber}`
      : '';
    this.deliver(
      to,
      `Order ${order.number} ${status.toLowerCase()}`,
      `Your order ${order.number} is now ${status}.${tracking}`,
    );
  }

  sendPasswordReset(to: string, resetUrl: string) {
    this.deliver(
      to,
      'Reset your password',
      `Someone requested a password reset for this account.\n\nReset link (valid for 1 hour):\n${resetUrl}\n\nIf it wasn't you, ignore this email.`,
    );
  }
}
