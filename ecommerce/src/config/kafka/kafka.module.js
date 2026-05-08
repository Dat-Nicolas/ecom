"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KafkaModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const microservices_1 = require("@nestjs/microservices");
const kafka_constants_1 = require("./kafka.constants");
const kafka_service_1 = require("./kafka.service");
let KafkaModule = class KafkaModule {
};
exports.KafkaModule = KafkaModule;
exports.KafkaModule = KafkaModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            microservices_1.ClientsModule.registerAsync([
                {
                    name: kafka_constants_1.KAFKA_CLIENT,
                    inject: [config_1.ConfigService],
                    useFactory: (cfg) => ({
                        transport: microservices_1.Transport.KAFKA,
                        options: {
                            client: {
                                clientId: cfg.get('KAFKA_CLIENT_ID', 'ecommerce-api'),
                                brokers: cfg.get('KAFKA_BROKERS', 'localhost:9092').split(','),
                            },
                            consumer: {
                                groupId: cfg.get('KAFKA_GROUP_ID', 'ecommerce-group'),
                            },
                        },
                    }),
                },
            ]),
        ],
        providers: [kafka_service_1.KafkaService],
        exports: [kafka_service_1.KafkaService, microservices_1.ClientsModule],
    })
], KafkaModule);
//# sourceMappingURL=kafka.module.js.map