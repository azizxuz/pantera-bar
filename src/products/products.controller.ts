import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { IsBoolean, IsInt, IsOptional, IsString, Min } from "class-validator";
import { PrismaService } from "../prisma/prisma.service";
import { AdminGuard } from "../common/admin.guard";
import { ProductCategory } from "@prisma/client";

class CreateProductDto {
  @IsString() name!: string;
  @IsInt() @Min(0) price!: number;
  @IsOptional() @IsBoolean() active?: boolean;
  @IsOptional() @IsString() emoji?: string;
  @IsOptional() @IsString() imageUrl?: string;
  @IsOptional() @IsString() category?: string;
}

function toCategory(c?: string): ProductCategory {
  return (c?.toUpperCase() as ProductCategory) ?? ProductCategory.OTHER;
}

@Controller("products")
export class ProductsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  list() {
    return this.prisma.product.findMany({
      where: { active: true },
      orderBy: { createdAt: "desc" },
    });
  }

  @Get("all")
  @UseGuards(AdminGuard)
  all() {
    return this.prisma.product.findMany({ orderBy: { createdAt: "desc" } });
  }

  @Post()
  @UseGuards(AdminGuard)
  create(@Body() dto: CreateProductDto) {
    return this.prisma.product.create({
      data: { ...dto, category: toCategory(dto.category) },
    });
  }

  @Patch(":id")
  @UseGuards(AdminGuard)
  update(@Param("id") id: string, @Body() dto: Partial<CreateProductDto>) {
    const { category, ...rest } = dto;
    return this.prisma.product.update({
      where: { id },
      data: {
        ...rest,
        ...(category !== undefined && { category: toCategory(category) }),
      } as any,
    });
  }

  @Delete(":id")
  @UseGuards(AdminGuard)
  del(@Param("id") id: string) {
    return this.prisma.product.delete({ where: { id } });
  }
}
