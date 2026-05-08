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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var KafkaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.KafkaService = exports.KafkaTopic = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const kafka_constants_1 = require("./kafka.constants");
var KafkaTopic;
(function (KafkaTopic) {
    KafkaTopic["ORDER_CREATED"] = "order.created";
    KafkaTopic["ORDER_CONFIRMED"] = "order.confirmed";
    KafkaTopic["ORDER_CANCELLED"] = "order.cancelled";
    KafkaTopic["PAYMENT_SUCCESS"] = "payment.success";
    KafkaTopic["PAYMENT_FAILED"] = "payment.failed";
    KafkaTopic["SHIPMENT_UPDATED"] = "shipment.updated";
    KafkaTopic["INVENTORY_LOW"] = "inventory.low";
    KafkaTopic["USER_REGISTERED"] = "user.registered";
    KafkaTopic["REVIEW_CREATED"] = "review.created";
})(KafkaTopic || (exports.KafkaTopic = KafkaTopic = {}));
let KafkaService = KafkaService_1 = class KafkaService {
    constructor(kafkaClient) {
        this.kafkaClient = kafkaClient;
        this.logger = new common_1.Logger(KafkaService_1.name);
    }
    async onModuleInit() {
        await this.kafkaClient.connect();
        this.logger.log('✅ Kafka connected');
    }
    async emit(topic, message) {
        try {
            await this.kafkaClient.emit(topic, {
                key: message.id || String(Date.now()),
                value: JSON.stringify({ ...message, timestamp: new Date().toISOString() }),
                headers: { source: 'ecommerce-api', topic },
            });
            this.logger.debug(`📨 Kafka emit: ${topic}`);
        }
        catch (error) {
            this.logger.error(`Kafka emit failed [${topic}]: ${error.message}`);
        }
    }
};
exports.KafkaService = KafkaService;
exports.KafkaService = KafkaService = KafkaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(kafka_constants_1.KAFKA_CLIENT)),
    __metadata("design:paramtypes", [microservices_1.ClientKafka])
], KafkaService);
//# sourceMappingURL=kafka.service.js.map