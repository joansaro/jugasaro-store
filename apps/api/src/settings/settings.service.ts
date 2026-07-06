import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/prisma/prisma.service';

/**
 * Key-value store settings with an in-memory cache.
 * Known keys: store_name, currency, tax_rate_bps, low_stock_threshold, email_from.
 */
@Injectable()
export class SettingsService {
  private cache = new Map<string, string>();
  private loaded = false;

  constructor(private readonly prisma: PrismaService) {}

  private async ensureLoaded() {
    if (this.loaded) return;
    const rows = await this.prisma.setting.findMany();
    this.cache = new Map(rows.map((r) => [r.key, r.value]));
    this.loaded = true;
  }

  async get(key: string, fallback = ''): Promise<string> {
    await this.ensureLoaded();
    return this.cache.get(key) ?? fallback;
  }

  async getInt(key: string, fallback: number): Promise<number> {
    const raw = await this.get(key, String(fallback));
    const parsed = Number.parseInt(raw, 10);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  /** Tax rate in basis points (800 = 8.00%). */
  taxRateBps() {
    return this.getInt('tax_rate_bps', 0);
  }

  lowStockThreshold() {
    return this.getInt('low_stock_threshold', 5);
  }

  async all(): Promise<Record<string, string>> {
    await this.ensureLoaded();
    return Object.fromEntries(this.cache);
  }

  /** Public subset shown to the storefront. */
  async publicSettings() {
    await this.ensureLoaded();
    return {
      storeName: this.cache.get('store_name') ?? 'Jugasaro Store',
      currency: this.cache.get('currency') ?? 'USD',
      taxRateBps: await this.taxRateBps(),
    };
  }

  async update(entries: Record<string, string>) {
    await this.prisma.$transaction(
      Object.entries(entries).map(([key, value]) =>
        this.prisma.setting.upsert({
          where: { key },
          create: { key, value },
          update: { value },
        }),
      ),
    );
    this.loaded = false; // invalidate cache
    return this.all();
  }
}
