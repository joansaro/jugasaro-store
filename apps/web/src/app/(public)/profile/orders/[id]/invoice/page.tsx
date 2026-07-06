import { notFound } from 'next/navigation';
import type { Order, StoreSettings } from '@jugasaro/shared';

import { apiServer, ApiError } from '@/lib/api';
import { formatPrice } from '@/lib/format';
import { PrintButton } from '@/components/profile/print-button';

export const dynamic = 'force-dynamic';

interface InvoiceProps {
  params: Promise<{ id: string }>;
}

/** Factura/recibo imprimible — "Download PDF" = imprimir → guardar como PDF. */
export default async function InvoicePage({ params }: InvoiceProps) {
  const { id } = await params;

  let order: Order;
  let settings: StoreSettings;
  try {
    [order, settings] = await Promise.all([
      apiServer.get<Order>(`/orders/${id}`),
      apiServer.get<StoreSettings>('/settings'),
    ]);
  } catch (err) {
    if (err instanceof ApiError && (err.status === 404 || err.status === 403)) notFound();
    throw err;
  }

  return (
    <main className="py-10 print:py-0">
      <div className="mx-auto max-w-2xl px-6">
        <div className="mb-6 flex justify-end gap-2 print:hidden">
          <PrintButton />
        </div>

        <div className="rounded-2xl border border-(--color-border) bg-white text-neutral-900 p-8 print:border-0 print:p-0">
          {/* Encabezado */}
          <div className="flex items-start justify-between gap-4 border-b border-neutral-200 pb-6 mb-6">
            <div>
              <p className="text-xl font-semibold tracking-tight">{settings.storeName}</p>
              <p className="text-xs text-neutral-500">Demo store — simulated payment receipt</p>
            </div>
            <div className="text-right text-sm">
              <p className="font-mono font-semibold">{order.number}</p>
              <p className="text-neutral-500">
                {new Date(order.createdAt).toLocaleDateString('en-US', { dateStyle: 'long' })}
              </p>
              <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 mt-1">
                {order.status}
              </p>
            </div>
          </div>

          {/* Cliente / envío */}
          <div className="grid grid-cols-2 gap-6 text-sm mb-6">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-1">
                Billed to
              </p>
              <p>{order.shippingAddress?.fullName ?? order.customerEmail}</p>
              {order.customerEmail && <p className="text-neutral-500">{order.customerEmail}</p>}
            </div>
            {order.shippingAddress && (
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-1">
                  Ship to
                </p>
                <p className="text-neutral-600">
                  {order.shippingAddress.line1}
                  {order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ''}
                </p>
                <p className="text-neutral-600">
                  {order.shippingAddress.city}, {order.shippingAddress.postalCode} ·{' '}
                  {order.shippingAddress.country}
                </p>
              </div>
            )}
          </div>

          {/* Líneas */}
          <table className="w-full text-sm mb-6">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-[10px] font-mono uppercase tracking-widest text-neutral-400">
                <th className="py-2 font-normal">Item</th>
                <th className="py-2 font-normal text-center">Qty</th>
                <th className="py-2 font-normal text-right">Unit</th>
                <th className="py-2 font-normal text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td className="py-2.5">
                    {item.productName}
                    {item.variantSku && (
                      <span className="block font-mono text-[10px] text-neutral-400">
                        {item.variantSku}
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 text-center">{item.quantity}</td>
                  <td className="py-2.5 text-right font-mono">{formatPrice(item.unitPrice)}</td>
                  <td className="py-2.5 text-right font-mono">{formatPrice(item.totalPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totales */}
          <div className="ml-auto max-w-xs space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-500">Subtotal</span>
              <span className="font-mono">{formatPrice(order.subtotal)}</span>
            </div>
            {order.promoDiscount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Promotions</span>
                <span className="font-mono">−{formatPrice(order.promoDiscount)}</span>
              </div>
            )}
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Coupon{order.couponCode ? ` (${order.couponCode})` : ''}</span>
                <span className="font-mono">−{formatPrice(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-neutral-500">
                Shipping{order.shippingMethodName ? ` — ${order.shippingMethodName}` : ''}
              </span>
              <span className="font-mono">
                {order.shipping === 0 ? 'Free' : formatPrice(order.shipping)}
              </span>
            </div>
            {order.tax > 0 && (
              <div className="flex justify-between">
                <span className="text-neutral-500">Tax</span>
                <span className="font-mono">{formatPrice(order.tax)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-neutral-200 pt-2 text-base font-semibold">
              <span>Total</span>
              <span className="font-mono">{formatPrice(order.total)}</span>
            </div>
          </div>

          <p className="mt-8 text-center text-[10px] text-neutral-400">
            Thank you for shopping at {settings.storeName}. This is a demo receipt — no real
            payment was processed.
          </p>
        </div>
      </div>
    </main>
  );
}
