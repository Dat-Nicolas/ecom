import { Injectable, Inject, OnModuleInit, Logger } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { KAFKA_CLIENT } from './kafka.constants';

export enum KafkaTopic {
  ORDER_CREATED = 'order.created',
  ORDER_CONFIRMED = 'order.confirmed',
  ORDER_CANCELLED = 'order.cancelled',
  PAYMENT_SUCCESS = 'payment.success',
  PAYMENT_FAILED = 'payment.failed',
  SHIPMENT_UPDATED = 'shipment.updated',
  INVENTORY_LOW = 'inventory.low',
  USER_REGISTERED = 'user.registered',
  REVIEW_CREATED = 'review.created',
}

@Injectable()
export class KafkaService implements OnModuleInit {
  private readonly logger = new Logger(KafkaService.name);

  constructor(@Inject(KAFKA_CLIENT) private readonly kafkaClient: ClientKafka) {}

  async onModuleInit() {
    // Subscribe to reply topics if needed
    await this.kafkaClient.connect();
    this.logger.log('✅ Kafka connected');
  }

  async emit(topic: KafkaTopic, message: Record<string, any>): Promise<void> {
    try {
      await this.kafkaClient.emit(topic, {
        key: message.id || String(Date.now()),
        value: JSON.stringify({ ...message, timestamp: new Date().toISOString() }),
        headers: { source: 'ecommerce-api', topic },
      });
      this.logger.debug(`📨 Kafka emit: ${topic}`);
    } catch (error) {
      this.logger.error(`Kafka emit failed [${topic}]: ${error.message}`);
    }
  }
}
