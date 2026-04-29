import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ComputersModule } from './computers/computers.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { RealtimeModule } from './realtime/realtime.module';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET ?? 'dev-secret',
      signOptions: { expiresIn: '7d' },
    }),
    PrismaModule, AuthModule, ComputersModule, ProductsModule, OrdersModule, RealtimeModule,
  ],
})
export class AppModule {}
