import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { RealtimeModule } from '../realtime/realtime.module';
@Module({ imports: [RealtimeModule], controllers: [OrdersController] })
export class OrdersModule {}
