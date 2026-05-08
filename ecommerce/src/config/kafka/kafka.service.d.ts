import { OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
export declare enum KafkaTopic {
    ORDER_CREATED = "order.created",
    ORDER_CONFIRMED = "order.confirmed",
    ORDER_CANCELLED = "order.cancelled",
    PAYMENT_SUCCESS = "payment.success",
    PAYMENT_FAILED = "payment.failed",
    SHIPMENT_UPDATED = "shipment.updated",
    INVENTORY_LOW = "inventory.low",
    USER_REGISTERED = "user.registered",
    REVIEW_CREATED = "review.created"
}
export declare class KafkaService implements OnModuleInit {
    private readonly kafkaClient;
    private readonly logger;
    constructor(kafkaClient: ClientKafka);
    onModuleInit(): Promise<void>;
    emit(topic: KafkaTopic, message: Record<string, any>): Promise<void>;
}
