// src/modules/payments/payments.service.ts
import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { KafkaService, KafkaTopic } from '../../config/kafka/kafka.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private prisma: PrismaService,
    // private kafkaService: KafkaService,
    private configService: ConfigService,
  ) {}

  async createPayment(orderId: string, method: string, userId: string) {
    const order = await this.prisma.order.findFirst({ where: { id: orderId, userId } });
    if (!order) throw new NotFoundException('Order not found');
    if (order.status !== 'pending') throw new BadRequestException('Order is not payable');

    const payment = await this.prisma.payment.create({
      data: { orderId, method: method as any, status: 'pending', amount: order.total, currency: 'VND' },
    });

    if (method === 'cod') {
      await this.prisma.payment.update({ where: { id: payment.id }, data: { status: 'pending' } });
      await this.prisma.order.update({ where: { id: orderId }, data: { status: 'confirmed' } });
      await this.kafkaService.emit(KafkaTopic.PAYMENT_SUCCESS, { orderId, paymentId: payment.id, method });
      return { payment, redirectUrl: null, message: 'COD order confirmed' };
    }

    if (method === 'vnpay') {
      const redirectUrl = this.buildVNPayUrl(order, payment.id);
      return { payment, redirectUrl };
    }

    return { payment, redirectUrl: null };
  }

  async handleVNPayCallback(query: Record<string, string>) {
    const { vnp_TxnRef, vnp_ResponseCode, vnp_SecureHash, ...rest } = query;
    // Verify hash
    const secret = this.configService.get('VNPAY_HASH_SECRET');
    const sortedParams = Object.keys(rest).sort().reduce((acc, k) => ({ ...acc, [k]: rest[k] }), {});
    const signData = new URLSearchParams(sortedParams as any).toString();
    const hmac = createHmac('sha512', secret).update(signData).digest('hex');

    if (hmac !== vnp_SecureHash) throw new BadRequestException('Invalid signature');

    const payment = await this.prisma.payment.findFirst({ where: { id: vnp_TxnRef } });
    if (!payment) throw new NotFoundException('Payment not found');

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

    // if (success) {
    //   await this.prisma.order.update({ where: { id: payment.orderId }, data: { status: 'confirmed' } });
    //   await this.kafkaService.emit(KafkaTopic.PAYMENT_SUCCESS, { orderId: payment.orderId, paymentId: payment.id });
    // } else {
    //   await this.kafkaService.emit(KafkaTopic.PAYMENT_FAILED, { orderId: payment.orderId, paymentId: payment.id });
    // }

    return { success, message: success ? 'Payment successful' : 'Payment failed' };
  }

  async getOrderPayments(orderId: string) {
    return this.prisma.payment.findMany({ where: { orderId }, orderBy: { createdAt: 'desc' } });
  }

  private buildVNPayUrl(order: any, paymentId: string): string {
    const tmnCode = this.configService.get('VNPAY_TMN_CODE');
    const hashSecret = this.configService.get('VNPAY_HASH_SECRET');
    const vnpUrl = this.configService.get('VNPAY_URL');
    const returnUrl = this.configService.get('VNPAY_RETURN_URL');

    const date = new Date();
    const createDate = date.toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
    const params: Record<string, string> = {
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
    const signData = new URLSearchParams(sorted as any).toString();
    const hmac = createHmac('sha512', hashSecret).update(signData).digest('hex');

    return `${vnpUrl}?${signData}&vnp_SecureHash=${hmac}`;
  }
}
