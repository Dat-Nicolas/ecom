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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CouponsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let CouponsService = class CouponsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) { return this.prisma.coupon.create({ data: { ...data, code: data.code.toUpperCase() } }); }
    async findAll() { return this.prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } }); }
    async validate(code, orderValue) {
        const coupon = await this.prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
        if (!coupon || !coupon.isActive)
            throw new common_1.NotFoundException('Coupon not found or inactive');
        if (coupon.expiresAt && coupon.expiresAt < new Date())
            throw new common_1.BadRequestException('Coupon expired');
        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit)
            throw new common_1.BadRequestException('Coupon usage limit reached');
        if (coupon.minOrderValue && orderValue < Number(coupon.minOrderValue))
            throw new common_1.BadRequestException(`Minimum order value is ${coupon.minOrderValue}`);
        const discount = coupon.type === 'percent'
            ? Math.min(orderValue * Number(coupon.value) / 100, Number(coupon.maxDiscount ?? Infinity))
            : Math.min(Number(coupon.value), orderValue);
        return { coupon, discount, message: 'Coupon valid' };
    }
    async update(id, data) {
        const c = await this.prisma.coupon.findUnique({ where: { id } });
        if (!c)
            throw new common_1.NotFoundException('Coupon not found');
        return this.prisma.coupon.update({ where: { id }, data });
    }
    async remove(id) {
        await this.prisma.coupon.update({ where: { id }, data: { isActive: false } });
        return { message: 'Coupon deactivated' };
    }
};
exports.CouponsService = CouponsService;
exports.CouponsService = CouponsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CouponsService);
//# sourceMappingURL=coupons.service.js.map