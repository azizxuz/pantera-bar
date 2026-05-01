import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ArrayMinSize, IsArray, IsIn, IsInt, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PrismaService } from '../prisma/prisma.service';
import { AdminGuard } from '../common/admin.guard';
import { ComputerGuard } from '../common/computer.guard';
import { RealtimeGateway } from '../realtime/realtime.gateway';

class OrderItemDto { @IsString() productId!: string; @IsInt() @Min(1) quantity!: number; }
class CreateOrderDto {
  @IsArray() @ValidateNested({ each: true }) @Type(() => OrderItemDto) @ArrayMinSize(1)
  items!: OrderItemDto[];
}

@Controller('orders')
export class OrdersController {
  constructor(private prisma: PrismaService, private rt: RealtimeGateway) {}

  @Post()
  //  @UseGuards(ComputerGuard)

  async create(@Req() req: any, @Body() dto: CreateOrderDto) {
    const computer = req.computer;
    const products = await this.prisma.product.findMany({
      where: { id: { in: dto.items.map(i => i.productId) }, active: true },
    });
    const items = dto.items.map(i => {
      const p = products.find(pp => pp.id === i.productId);
      if (!p) throw new Error('Invalid product');
      return { productId: p.id, name: p.name, price: p.price, quantity: i.quantity };
    });
    const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const order = await this.prisma.order.create({
      data: {
        computerId: computer.id, computerNumber: computer.number,
        totalPrice: total, items: { create: items },
      },
      include: { items: true },
    });
    this.rt.emitNew(order);
    return order;
  }

  @Get() @UseGuards(AdminGuard)
  list() { return this.prisma.order.findMany({ include: { items: true }, orderBy: { createdAt: 'desc' }, take: 500 }); }

  @Patch(':id/status') @UseGuards(AdminGuard)
  async setStatus(@Param('id') id: string, @Body() body: { status: 'NEW'|'ACCEPTED'|'DELIVERED'|'CANCELED' }) {
    const order = await this.prisma.order.update({ where: { id }, data: { status: body.status }, include: { items: true } });
    this.rt.emitUpdate(order);
    return order;
  }
}
