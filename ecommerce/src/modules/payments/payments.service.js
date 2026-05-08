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
var PaymentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const crypto_1 = require("crypto");
const prisma_service_1 = require("../../prisma/prisma.service");
const kafka_service_1 = require("../../config/kafka/kafka.service");
let PaymentsService = PaymentsService_1 = class PaymentsService {
    constructor(prisma, kafkaService, configService) {
        this.prisma = prisma;
        this.kafkaService = kafkaService;
        this.configService = configService;
        this.logger = new common_1.Logger(PaymentsService_1.name);
    }
    async createPayment(orderId, method, userId) {
        const order = await this.prisma.order.findFirst({ where: { id: orderId, userId } });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        if (order.status !== 'pending')
            throw new common_1.BadRequestException('Order is not payable');
        const payment = await this.prisma.payment.create({
            data: { orderId, method: method, status: 'pending', amount: order.total, currency: 'VND' },
        });
        if (method === 'cod') {
            await this.prisma.payment.update({ where: { id: payment.id }, data: { status: 'pending' } });
            await this.prisma.order.update({ where: { id: orderId }, data: { status: 'confirmed' } });
            await this.kafkaService.emit(kafka_service_1.KafkaTopic.PAYMENT_SUCCESS, { orderId, paymentId: payment.id, method });
            return { payment, redirectUrl: null, message: 'COD order confirmed' };
        }
        if (method === 'vnpay') {
            const redirectUrl = this.buildVNPayUrl(order, payment.id);
            return { payment, redirectUrl };
        }
        return { payment, redirectUrl: null };
    }
    async handleVNPayCallback(query) {
        const { vnp_TxnRef, vnp_ResponseCode, vnp_SecureHash, ...rest } = query;
        const secret = this.configService.get('VNPAY_HASH_SECRET');
        const sortedParams = Object.keys(rest).sort().reduce((acc, k) => ({ ...acc, [k]: rest[k] }), {});
        const signData = new URLSearchParams(sortedParams).toString();
        const hmac = (0, crypto_1.createHmac)('sha512', secret).update(signData).digest('hex');
        if (hmac !== vnp_SecureHash)
            throw new common_1.BadRequestException('Invalid signature');
        const payment = await this.prisma.payment.findFirst({ where: { id: vnp_TxnRef } });
        if (!payment)
            throw new common_1.NotFoundException('Payment not found');
        const success = vnp_ResponseCode === '00';
        await this.prisma.payment.update({
            where: { id: payment.id },
            data: {
                status: success ? 'success' : 'failed',
                gatewayTxnId: query.vnp_TransactionNo,
                gatewayResponse: query,
                paidAt: success ? new Date() : null,
            },
        });
        if (success) {
            await this.prisma.order.update({ where: { id: payment.orderId }, data: { status: 'confirmed' } });
            await this.kafkaService.emit(kafka_service_1.KafkaTopic.PAYMENT_SUCCESS, { orderId: payment.orderId, paymentId: payment.id });
        }
        else {
            await this.kafkaService.emit(kafka_service_1.KafkaTopic.PAYMENT_FAILED, { orderId: payment.orderId, paymentId: payment.id });
        }
        return { success, message: success ? 'Payment successful' : 'Payment failed' };
    }
    async getOrderPayments(orderId) {
        return this.prisma.payment.findMany({ where: { orderId }, orderBy: { createdAt: 'desc' } });
    }
    buildVNPayUrl(order, paymentId) {
        const tmnCode = this.configService.get('VNPAY_TMN_CODE');
        const hashSecret = this.configService.get('VNPAY_HASH_SECRET');
        const vnpUrl = this.configService.get('VNPAY_URL');
        const returnUrl = this.configService.get('VNPAY_RETURN_URL');
        const date = new Date();
        const createDate = date.toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
        const params = {
            vnp_Version: '2.1.0',
            vnp_Command: 'pay',
            vnp_TmnCode: tmnCode,
            vnp_Amount: String(Number(order.total) * 100),
            vnp_CurrCode: 'VND',
            vnp_TxnRef: paymentId,
            vnp_OrderInfo: `Thanh toan don hang ${order.orderCode}`,
            vnp_OrderType: 'other',
            vnp_Locale: 'vn',
            vnp_ReturnUrl: returnUrl,
            vnp_IpAddr: '127.0.0.1',
            vnp_CreateDate: createDate,
        };
        const sorted = Object.keys(params).sort().reduce((acc, k) => ({ ...acc, [k]: params[k] }), {});
        const signData = new URLSearchParams(sorted).toString();
        const hmac = (0, crypto_1.createHmac)('sha512', hashSecret).update(signData).digest('hex');
        return `${vnpUrl}?${signData}&vnp_SecureHash=${hmac}`;
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = PaymentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        kafka_service_1.KafkaService,
        config_1.ConfigService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map