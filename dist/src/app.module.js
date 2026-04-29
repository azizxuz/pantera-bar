"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const computers_module_1 = require("./computers/computers.module");
const products_module_1 = require("./products/products.module");
const orders_module_1 = require("./orders/orders.module");
const realtime_module_1 = require("./realtime/realtime.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            jwt_1.JwtModule.register({
                global: true,
                secret: process.env.JWT_SECRET ?? 'dev-secret',
                signOptions: { expiresIn: '7d' },
            }),
            prisma_module_1.PrismaModule, auth_module_1.AuthModule, computers_module_1.ComputersModule, products_module_1.ProductsModule, orders_module_1.OrdersModule, realtime_module_1.RealtimeModule,
        ],
    })
], AppModule);
