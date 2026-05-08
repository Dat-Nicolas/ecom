import {
  Injectable, NotFoundException, BadRequestException, Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { KafkaService, KafkaTopic } from '../../config/kafka/kafka.service';
import { paginate } from '../../common/dto/pagination.dto';
import { CreateOrderDto, UpdateOrderStatusDto, OrderQueryDto } from './dto/order.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(private prisma: PrismaService, private kafkaService: KafkaService) {}

  private generateOrderCode(): string {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(Math.random() * 99999).toString().padStart(5, '0');
    return `ORD-${date}-${rand}`;
  }

  async create(userId: string, dto: CreateOrderDto) {
    // Validate address
    const address = await this.prisma.userAddress.findFirst({
      where: { id: dto.addressId, userId },
    });
    if (!address) throw new NotFoundException('Address not found');

    // Validate & price items
    const variantIds = dto.items.map((i) => i.variantId);
    const variants = await this.prisma.productVariant.findMany({
      where: { id: { in: variantIds }, isActive: true },
      include: {
        product: true,
        inventories: { where: { warehouse: { isActive: true } } },
      },
    });

    if (variants.length !== variantIds.length)
      throw new NotFoundException('One or more variants not found or inactive');

    // Stock check
    for (const item of dto.items) {
      const variant = variants.find((v) => v.id === item.variantId);
      const totalQty = variant.inventories.reduce((s, i) => s + i.qtyAvailable, 0);
      if (totalQty < item.quantity)
        throw new BadRequestException(`Insufficient stock for: ${variant.name}`);
    }

    // Build order items
    const orderItems = dto.items.map((item) => {
      const variant = variants.find((v) => v.id === item.variantId);
      const unitPrice = Number(variant.salePrice ?? variant.price);
      return {
        variantId: item.variantId,
        productName: variant.product.name,
        variantName: variant.name,
        sku: variant.sku,
        quantity: item.quantity,
        unitPrice,
        discountAmt: 0,
        lineTotal: unitPrice * item.quantity,
      };
    });

    const subtotal = orderItems.reduce((s, i) => s + i.lineTotal, 0);
    let discountAmt = 0;

    // Apply coupon
    if (dto.couponCode) {
      const coupon = await this.prisma.coupon.findUnique({
        where: { code: dto.couponCode.toUpperCase() },
      });
      if (coupon && coupon.isActive) {
        if (!coupon.minOrderValue || subtotal >= Number(coupon.minOrderValue)) {
          if (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit) {
            discountAmt = coupon.type === 'percent'
              ? Math.min(subtotal * (Number(coupon.value) / 100), Number(coupon.maxDiscount ?? Infinity))
              : Math.min(Number(coupon.value), subtotal);
          }
        }
      }
    }

    const shippingFee = subtotal - discountAmt >= 500000 ? 0 : 30000;
    const total = subtotal - discountAmt + shippingFee;

    const order = await this.prisma.$transaction(async (tx) => {
      // Get coupon id
      let couponId: string | null = null;
      if (dto.couponCode && discountAmt > 0) {
        const coupon = await tx.coupon.findUnique({ where: { code: dto.couponCode.toUpperCase() } });
        if (coupon) {
          couponId = coupon.id;
          await tx.coupon.update({ where: { id: coupon.id }, data: { usedCount: { increment: 1 } } });
        }
      }

      // Create order
      const created = await tx.order.create({
        data: {
          orderCode: this.generateOrderCode(),
          userId,
          addressId: dto.addressId,
          couponId,
          shippingAddressSnapshot: {
            recipientName: address.recipientName,
            phone: address.phone,
            province: address.province,
            district: address.district,
            ward: address.ward,
            addressLine: address.addressLine,
          },
          subtotal,
          discountAmt,
          shippingFee,
          total,
          note: dto.note,
          items: { create: orderItems },
        },
        include: { items: true },
      });

      // Reserve inventory
      for (const item of dto.items) {
        const variant = variants.find((v) => v.id === item.variantId);
        const inv = variant.inventories[0];
        if (inv) {
          await tx.inventory.update({
            where: { id: inv.id },
            data: {
              qtyAvailable: { decrement: item.quantity },
              qtyReserved: { increment: item.quantity },
            },
          });
        }
      }

      return created;
    });

    await this.kafkaService.emit(KafkaTopic.ORDER_CREATED, {
      id: order.id,
      orderCode: order.orderCode,
      userId,
      total,
    });

    return order;
  }

  async findAll(query: OrderQueryDto) {
    const { page = 1, limit = 20, status, userId, orderCode, from, to } = query;
    const skip = (page - 1) * limit;
    const where: any = {};
    if (status) where.status = status;
    if (userId) where.userId = userId;
    if (orderCode) where.orderCode = { contains: orderCode, mode: 'insensitive' };
    if (from || to) {
      where.orderedAt = {};
      if (from) where.orderedAt.gte = new Date(from);
      if (to) where.orderedAt.lte = new Date(to);
    }

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where, skip, take: limit,
        orderBy: { orderedAt: 'desc' },
        include: { user: { select: { id: true, email: true, fullName: true } }, items: true, _count: { select: { payments: true } } },
      }),
      this.prisma.order.count({ where }),
    ]);
    return paginate(data, total, page, limit);
  }

  async findMyOrders(userId: string, query: OrderQueryDto) {
    return this.findAll({ ...query, userId });
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, fullName: true, phone: true } },
        items: { include: { variant: { include: { product: true } } } },
        payments: true,
        shipments: true,
        coupon: true,
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto) {
    const order = await this.findOne(id);

    const validTransitions: Record<string, string[]> = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['processing', 'cancelled'],
      processing: ['shipped', 'cancelled'],
      shipped: ['delivered', 'returned'],
      delivered: ['refunded'],
    };

    if (!validTransitions[order.status]?.includes(dto.status))
      throw new BadRequestException(`Cannot transition from ${order.status} to ${dto.status}`);

    const updated = await this.prisma.order.update({
      where: { id },
      data: { status: dto.status as any },
    });

    if (dto.status === 'cancelled') {
      await this.kafkaService.emit(KafkaTopic.ORDER_CANCELLED, { id, orderCode: order.orderCode });
    } else if (dto.status === 'confirmed') {
      await this.kafkaService.emit(KafkaTopic.ORDER_CONFIRMED, { id, orderCode: order.orderCode });
    }

    return updated;
  }

  async cancelMyOrder(userId: string, id: string) {
    const order = await this.findOne(id);
    if (order.userId !== userId) throw new NotFoundException('Order not found');
    if (!['pending'].includes(order.status))
      throw new BadRequestException('Can only cancel pending orders');
    return this.updateStatus(id, { status: 'cancelled' });
  }
}
