// coupons.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CouponsService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) { return this.prisma.coupon.create({ data: { ...data, code: data.code.toUpperCase() } }); }

  async findAll() { return this.prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } }); }

  async validate(code: string, orderValue: number) {
    const coupon = await this.prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
    if (!coupon || !coupon.isActive) throw new NotFoundException('Coupon not found or inactive');
    if (coupon.expiresAt && coupon.expiresAt < new Date()) throw new BadRequestException('Coupon expired');
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) throw new BadRequestException('Coupon usage limit reached');
    if (coupon.minOrderValue && orderValue < Number(coupon.minOrderValue)) throw new BadRequestException(`Minimum order value is ${coupon.minOrderValue}`);

    const discount = coupon.type === 'percent'
      ? Math.min(orderValue * Number(coupon.value) / 100, Number(coupon.maxDiscount ?? Infinity))
      : Math.min(Number(coupon.value), orderValue);

    return { coupon, discount, message: 'Coupon valid' };
  }

  async update(id: string, data: any) {
    const c = await this.prisma.coupon.findUnique({ where: { id } });
    if (!c) throw new NotFoundException('Coupon not found');
    return this.prisma.coupon.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.prisma.coupon.update({ where: { id }, data: { isActive: false } });
    return { message: 'Coupon deactivated' };
  }
}
