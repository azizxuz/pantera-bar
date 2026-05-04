// src/orders/orders.controller.ts
import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { PrismaService } from "../prisma/prisma.service";
import { AdminGuard } from "../common/admin.guard";
import { RealtimeGateway } from "../realtime/realtime.gateway";

// ─── DTOs ────────────────────────────────────────────────────────────────────

class OrderItemDto {
  @IsOptional()
  @IsString()
  productId?: string;

  @IsInt()
  @Min(1)
  quantity!: number;
}

class CreateOrderDto {
  @IsInt()
  computerNumber!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  @ArrayMinSize(1)
  items!: OrderItemDto[];
}

class SetStatusDto {
  @IsIn(["NEW", "ACCEPTED", "DELIVERED", "CANCELED"])
  status!: "NEW" | "ACCEPTED" | "DELIVERED" | "CANCELED";
}

// ─── Controller ──────────────────────────────────────────────────────────────

@Controller("orders")
export class OrdersController {
  constructor(private prisma: PrismaService, private rt: RealtimeGateway) {}

  // ✅ Mijoz buyurtma yuboradi (token shart emas — public endpoint)
  @Post()
  async create(@Body() dto: CreateOrderDto) {
    // 1. Kompyuterni topamiz
    const computer = await this.prisma.computer.findUnique({
      where: { number: dto.computerNumber },
    });

    if (!computer) {
      throw new HttpException(
        `Computer #${dto.computerNumber} topilmadi`,
        HttpStatus.NOT_FOUND
      );
    }

    if (!computer.enabled) {
      throw new HttpException(
        `Computer #${dto.computerNumber} yoqilmagan`,
        HttpStatus.FORBIDDEN
      );
    }

    // 2. Mahsulotlarni bazadan olamiz (narxni frontenddan olmaymiz — xavfsiz)
    const productIds = dto.items
      .map((i) => i.productId)
      .filter((id): id is string => Boolean(id));

    const products = await this.prisma.product.findMany({
      where: {
        id: { in: productIds },
        active: true,
      },
    });

    // 3. Har bir item ni validatsiya qilamiz va narxni bazadan olamiz
    const items = dto.items.map((i) => {
      const p = products.find((pp) => pp.id === i.productId);
      if (!p) {
        throw new HttpException(
          `Mahsulot topilmadi yoki faol emas: ${i.productId}`,
          HttpStatus.BAD_REQUEST
        );
      }
      return {
        productId: p.id,
        name: p.name,
        price: p.price, // ← narxni bazadan olamiz
        quantity: i.quantity,
      };
    });

    // 4. Jami summani hisoblaymiz
    const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

    // 5. Buyurtmani saqlaymiz
    const order = await this.prisma.order.create({
      data: {
        computerId: computer.id,
        computerNumber: computer.number,
        totalPrice: total,
        status: "NEW",
        items: { create: items },
      },
      include: { items: true },
    });

    // 6. ✅ Admin panelga real-time xabar yuboramiz
    this.rt.emitNew(order);

    return order;
  }

  // ✅ Admin barcha buyurtmalarni ko'radi
  @Get()
  @UseGuards(AdminGuard)
  list() {
    return this.prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: "desc" },
      take: 500,
    });
  }

  // ✅ TUZATILDI: /orders/:id/status — to'g'ri endpoint
  @Patch(":id/status")
  @UseGuards(AdminGuard)
  async setStatus(@Param("id") id: string, @Body() body: SetStatusDto) {
    const order = await this.prisma.order.update({
      where: { id },
      data: { status: body.status },
      include: { items: true },
    });

    // ✅ Mijoz ham o'z buyurtmasining statusini real-time ko'radi
    this.rt.emitUpdate(order);

    return order;
  }
}
