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
exports.InventoryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const kafka_service_1 = require("../../config/kafka/kafka.service");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
let InventoryService = class InventoryService {
    constructor(prisma, kafkaService) {
        this.prisma = prisma;
        this.kafkaService = kafkaService;
    }
    async adjustStock(variantId, warehouseId, qtyChange, action, note, userId) {
        const inv = await this.prisma.inventory.findFirst({ where: { variantId, warehouseId } });
        if (!inv)
            throw new common_1.NotFoundException('Inventory record not found');
        if (qtyChange < 0 && inv.qtyAvailable + qtyChange < 0)
            throw new common_1.BadRequestException('Insufficient stock');
        const updated = await this.prisma.inventory.update({
            where: { id: inv.id },
            data: { qtyAvailable: { increment: qtyChange } },
        });
        await this.prisma.inventoryLog.create({
            data: {
                inventoryId: inv.id,
                action: action,
                qtyChange,
                qtyBefore: Number(inv.qtyAvailable),
                qtyAfter: Number(updated.qtyAvailable),
                note,
                createdBy: userId,
            },
        });
        if (updated.qtyAvailable <= updated.reorderPoint) {
            await this.kafkaService.emit(kafka_service_1.KafkaTopic.INVENTORY_LOW, {
                variantId,
                warehouseId,
                qtyAvailable: updated.qtyAvailable,
                reorderPoint: updated.reorderPoint,
            });
        }
        return updated;
    }
    async getInventory(query) {
        const { page = 1, limit = 20, warehouseId, lowStock } = query;
        const where = {};
        if (warehouseId)
            where.warehouseId = warehouseId;
        if (lowStock)
            where.qtyAvailable = { lte: this.prisma.inventory.fields.reorderPoint };
        const [data, total] = await Promise.all([
            this.prisma.inventory.findMany({
                where, skip: (page - 1) * limit, take: limit,
                include: { variant: { include: { product: { select: { name: true } } } }, warehouse: true },
            }),
            this.prisma.inventory.count({ where }),
        ]);
        return (0, pagination_dto_1.paginate)(data, total, page, limit);
    }
    async getLogs(inventoryId, query) {
        const { page = 1, limit = 20 } = query;
        const [data, total] = await Promise.all([
            this.prisma.inventoryLog.findMany({
                where: { inventoryId },
                skip: (page - 1) * limit, take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.inventoryLog.count({ where: { inventoryId } }),
        ]);
        return (0, pagination_dto_1.paginate)(data, total, page, limit);
    }
    async getWarehouses() {
        return this.prisma.warehouse.findMany({ where: { isActive: true } });
    }
    async createWarehouse(data) {
        return this.prisma.warehouse.create({ data });
    }
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, kafka_service_1.KafkaService])
], InventoryService);
//# sourceMappingURL=inventory.service.js.map