// src/modules/shipments/shipments.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { KafkaService, KafkaTopic } from '../../config/kafka/kafka.service';

@Injectable()
export class ShipmentsService {
  constructor(private prisma: PrismaService, private kafkaService: KafkaService) {}

  async create(data: any) {
    const order = await this.prisma.order.findUnique({ where: { id: data.orderId } });
    if (!order) throw new NotFoundException('Order not found');
    const shipment = await this.prisma.shipment.create({ data });
    await this.prisma.order.update({ where: { id: data.orderId }, data: { status: 'shipped' } });
    return shipment;
  }

  async updateStatus(id: string, status: string, trackingNo?: string) {
    const s = await this.prisma.shipment.findUnique({ where: { id } });
    if (!s) throw new NotFoundException('Shipment not found');
    const updated = await this.prisma.shipment.update({
      where: { id },
      data: {
        status: status as any,
        trackingNo: trackingNo ?? s.trackingNo,
        shippedAt: status === 'picked_up' ? new Date() : s.shippedAt,
        deliveredAt: status === 'delivered' ? new Date() : s.deliveredAt,
      },
    });
    await this.kafkaService.emit(KafkaTopic.SHIPMENT_UPDATED, { shipmentId: id, orderId: s.orderId, status });
    if (status === 'delivered') {
      await this.prisma.order.update({ where: { id: s.orderId }, data: { status: 'delivered' } });
    }
    return updated;
  }

  async findByOrder(orderId: string) {
    return this.prisma.shipment.findMany({ where: { orderId }, orderBy: { createdAt: 'desc' } });
  }
}
