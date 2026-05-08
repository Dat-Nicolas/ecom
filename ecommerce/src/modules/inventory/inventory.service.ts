// inventory.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { KafkaService, KafkaTopic } from '../../config/kafka/kafka.service';
import { paginate, PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService, private kafkaService: KafkaService) {}

  async adjustStock(variantId: string, warehouseId: number, qtyChange: number, action: string, note: string, userId: string) {
    const inv = await this.prisma.inventory.findFirst({ where: { variantId, warehouseId } });
    if (!inv) throw new NotFoundException('Inventory record not found');

    if (qtyChange < 0 && inv.qtyAvailable + qtyChange < 0)
      throw new BadRequestException('Insufficient stock');

    const updated = await this.prisma.inventory.update({
      where: { id: inv.id },
      data: { qtyAvailable: { increment: qtyChange } },
    });

    await this.prisma.inventoryLog.create({
      data: {
        inventoryId: inv.id,
        action: action as any,
        qtyChange,
        qtyBefore: Number(inv.qtyAvailable),
        qtyAfter: Number(updated.qtyAvailable),
        note,
        createdBy: userId,
      },
    });

    if (updated.qtyAvailable <= updated.reorderPoint) {
      await this.kafkaService.emit(KafkaTopic.INVENTORY_LOW, {
        variantId,
        warehouseId,
        qtyAvailable: updated.qtyAvailable,
        reorderPoint: updated.reorderPoint,
      });
    }

    return updated;
  }

  async getInventory(query: PaginationDto & { warehouseId?: number; lowStock?: boolean }) {
    const { page = 1, limit = 20, warehouseId, lowStock } = query;
    const where: any = {};
    if (warehouseId) where.warehouseId = warehouseId;
    if (lowStock) where.qtyAvailable = { lte: this.prisma.inventory.fields.reorderPoint };

    const [data, total] = await Promise.all([
      this.prisma.inventory.findMany({
        where, skip: (page - 1) * limit, take: limit,
        include: { variant: { include: { product: { select: { name: true } } } }, warehouse: true },
      }),
      this.prisma.inventory.count({ where }),
    ]);
    return paginate(data, total, page, limit);
  }

  async getLogs(inventoryId: bigint, query: PaginationDto) {
    const { page = 1, limit = 20 } = query;
    const [data, total] = await Promise.all([
      this.prisma.inventoryLog.findMany({
        where: { inventoryId },
        skip: (page - 1) * limit, take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.inventoryLog.count({ where: { inventoryId } }),
    ]);
    return paginate(data, total, page, limit);
  }

  async getWarehouses() {
    return this.prisma.warehouse.findMany({ where: { isActive: true } });
  }

  async createWarehouse(data: any) {
    return this.prisma.warehouse.create({ data });
  }
}
