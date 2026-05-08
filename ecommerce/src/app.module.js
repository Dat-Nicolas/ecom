"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const schedule_1 = require("@nestjs/schedule");
const event_emitter_1 = require("@nestjs/event-emitter");
const cache_manager_1 = require("@nestjs/cache-manager");
const cache_manager_redis_yet_1 = require("cache-manager-redis-yet");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const products_module_1 = require("./modules/products/products.module");
const categories_module_1 = require("./modules/categories/categories.module");
const brands_module_1 = require("./modules/brands/brands.module");
const orders_module_1 = require("./modules/orders/orders.module");
const payments_module_1 = require("./modules/payments/payments.module");
const inventory_module_1 = require("./modules/inventory/inventory.module");
const shipments_module_1 = require("./modules/shipments/shipments.module");
const reviews_module_1 = require("./modules/reviews/reviews.module");
const coupons_module_1 = require("./modules/coupons/coupons.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const upload_module_1 = require("./modules/upload/upload.module");
const kafka_module_1 = require("./config/kafka/kafka.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
            throttler_1.ThrottlerModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (cfg) => ({
                    throttlers: [{ ttl: cfg.get('THROTTLE_TTL', 60), limit: cfg.get('THROTTLE_LIMIT', 100) }],
                }),
            }),
            cache_manager_1.CacheModule.registerAsync({
                isGlobal: true,
                inject: [config_1.ConfigService],
                useFactory: async (cfg) => ({
                    store: await (0, cache_manager_redis_yet_1.redisStore)({
                        socket: { host: cfg.get('REDIS_HOST', 'localhost'), port: cfg.get('REDIS_PORT', 6379) },
                        password: cfg.get('REDIS_PASSWORD') || undefined,
                        ttl: cfg.get('REDIS_TTL', 3600),
                    }),
                }),
            }),
            schedule_1.ScheduleModule.forRoot(),
            event_emitter_1.EventEmitterModule.forRoot(),
            prisma_module_1.PrismaModule,
            kafka_module_1.KafkaModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            products_module_1.ProductsModule,
            categories_module_1.CategoriesModule,
            brands_module_1.BrandsModule,
            orders_module_1.OrdersModule,
            payments_module_1.PaymentsModule,
            inventory_module_1.InventoryModule,
            shipments_module_1.ShipmentsModule,
            reviews_module_1.ReviewsModule,
            coupons_module_1.CouponsModule,
            notifications_module_1.NotificationsModule,
            upload_module_1.UploadModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map