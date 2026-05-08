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
exports.ShipmentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const kafka_service_1 = require("../../config/kafka/kafka.service");
let ShipmentsService = class ShipmentsService {
    constructor(prisma, kafkaService) {
        this.prisma = prisma;
        this.kafkaService = kafkaService;
    }
    async create(data) {
        const order = await this.prisma.order.findUnique({ where: { id: data.orderId } });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        const shipment = await this.prisma.shipment.create({ data });
        await this.prisma.order.update({ where: { id: data.orderId }, data: { status: 'shipped' } });
        return shipment;
    }
    async updateStatus(id, status, trackingNo) {
        const s = await this.prisma.shipment.findUnique({ where: { id } });
        if (!s)
            throw new common_1.NotFoundException('Shipment not found');
        const updated = await this.prisma.shipment.update({
            where: { id },
            data: {
                status: status,
                trackingNo: trackingNo ?? s.trackingNo,
                shippedAt: status === 'picked_up' ? new Date() : s.shippedAt,
                deliveredAt: status === 'delivered' ? new Date() : s.deliveredAt,
            },
        });
        await this.kafkaService.emit(kafka_service_1.KafkaTopic.SHIPMENT_UPDATED, { shipmentId: id, orderId: s.orderId, status });
        if (status === 'delivered') {
            await this.prisma.order.update({ where: { id: s.orderId }, data: { status: 'delivered' } });
        }
        return updated;
    }
    async findByOrder(orderId) {
        return this.prisma.shipment.findMany({ where: { orderId }, orderBy: { createdAt: 'desc' } });
    }
};
exports.ShipmentsService = ShipmentsService;
exports.ShipmentsService = ShipmentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, kafka_service_1.KafkaService])
], ShipmentsService);
//# sourceMappingURL=shipments.service.js.map