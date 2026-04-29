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
exports.ComputersController = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const prisma_service_1 = require("../prisma/prisma.service");
const admin_guard_1 = require("../common/admin.guard");
const tok = () => (0, crypto_1.randomBytes)(24).toString('hex');
const yearFromNow = () => { const d = new Date(); d.setFullYear(d.getFullYear() + 1); return d; };
let ComputersController = class ComputersController {
    constructor(prisma) {
        this.prisma = prisma;
    }
    list() { return this.prisma.computer.findMany({ orderBy: { number: 'asc' } }); }
    async add() {
        const max = await this.prisma.computer.aggregate({ _max: { number: true } });
        return this.prisma.computer.create({
            data: { number: (max._max.number ?? 0) + 1, token: tok(), tokenExpiresAt: yearFromNow() },
        });
    }
    rotate(id) {
        return this.prisma.computer.update({ where: { id }, data: { token: tok(), tokenExpiresAt: yearFromNow() } });
    }
    update(id, body) {
        return this.prisma.computer.update({ where: { id }, data: body });
    }
    del(id) { return this.prisma.computer.delete({ where: { id } }); }
};
exports.ComputersController = ComputersController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ComputersController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ComputersController.prototype, "add", null);
__decorate([
    (0, common_1.Post)(':id/rotate'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ComputersController.prototype, "rotate", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ComputersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ComputersController.prototype, "del", null);
exports.ComputersController = ComputersController = __decorate([
    (0, common_1.Controller)('computers'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ComputersController);
