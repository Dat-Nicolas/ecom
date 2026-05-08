// payments.controller.ts
import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('payments') @ApiBearerAuth('access-token') @Controller('payments')
export class PaymentsController {
  constructor(private readonly svc: PaymentsService) {}

  @Post('orders/:orderId')
  @ApiOperation({ summary: 'Create payment for order' })
  create(@Param('orderId') orderId: string, @Body() body: any, @CurrentUser('id') uid: string) {
    return this.svc.createPayment(orderId, body.method, uid);
  }

  @Public()
  @Get('vnpay/callback')
  @ApiOperation({ summary: 'VNPay payment callback' })
  vnpayCallback(@Query() query: any) { return this.svc.handleVNPayCallback(query); }

  @Get('orders/:orderId')
  @ApiOperation({ summary: 'Get payments for order' })
  getOrderPayments(@Param('orderId') orderId: string) { return this.svc.getOrderPayments(orderId); }
}
