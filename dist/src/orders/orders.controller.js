"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersController = void 0;
const common_1 = require("@nestjs/common");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const prisma_service_1 = require("../prisma/prisma.service");
const admin_guard_1 = require("../common/admin.guard");
const computer_guard_1 = require("../common/computer.guard");
const realtime_gateway_1 = require("../realtime/realtime.gateway");
class OrderItemDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OrderItemDto.prototype, "productId", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], OrderItemDto.prototype, "quantity", void 0);
class CreateOrderDto {
}
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => OrderItemDto),
    (0, class_validator_1.ArrayMinSize)(1),
    __metadata("design:type", Array)
], CreateOrderDto.prototype, "items", void 0);
let OrdersController = class OrdersController {
    constructor(prisma, rt) {
        this.prisma = prisma;
        this.rt = rt;
    }
    async create(req, dto) {
        const computer = req.computer;
        const products = await this.prisma.product.findMany({
            where: { id: { in: dto.items.map(i => i.productId) }, active: true },
        });
        const items = dto.items.map(i => {
            const p = products.find(pp => pp.id === i.productId);
            if (!p)
                throw new Error('Invalid product');
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
    list() { return this.prisma.order.findMany({ include: { items: true }, orderBy: { createdAt: 'desc' }, take: 500 }); }
    async setStatus(id, body) {
        const order = await this.prisma.order.update({ where: { id }, data: { status: body.status }, include: { items: true } });
        this.rt.emitUpdate(order);
        return order;
    }
};
exports.OrdersController = OrdersController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(computer_guard_1.ComputerGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, CreateOrderDto]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "list", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "setStatus", null);
exports.OrdersController = OrdersController = __decorate([
    (0, common_1.Controller)('orders'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, realtime_gateway_1.RealtimeGateway])
], OrdersController);
