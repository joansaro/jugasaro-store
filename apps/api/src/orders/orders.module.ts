import { Module } from '@nestjs/common';

import { CouponsModule } from '@/coupons/coupons.module';
import { PromotionsModule } from '@/promotions/promotions.module';
import { ShippingModule } from '@/shipping/shipping.module';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [CouponsModule, PromotionsModule, ShippingModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
