import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, seconds } from '@nestjs/throttler';
import { redisStore } from 'cache-manager-redis-yet';
import { KafkaModule } from './config/kafka/kafka.module';
import { AuthModule } from './modules/auth/auth.module';
import { BrandsModule } from './modules/brands/brands.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { CouponsModule } from './modules/coupons/coupons.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ProductsModule } from './modules/products/products.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { ShipmentsModule } from './modules/shipments/shipments.module';
import { UploadModule } from './modules/upload/upload.module';
import { UsersModule } from './modules/users/users.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),

    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => {
        const ttlSeconds = Number(cfg.get('THROTTLE_TTL', 60));
        const limit = Number(cfg.get('THROTTLE_LIMIT', 100));

        return {
          throttlers: [
            {
              ttl: seconds(Number.isFinite(ttlSeconds) ? ttlSeconds : 60),
              limit: Number.isFinite(limit) ? Math.max(1, Math.trunc(limit)) : 100,
            },
          ],
        };
      },
    }),

    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (cfg: ConfigService) => ({
        store: await redisStore({
          socket: {
            host: cfg.get('REDIS_HOST', 'localhost'),
            port: cfg.get('REDIS_PORT', 6379),
          },
          password: cfg.get('REDIS_PASSWORD') || undefined,
          ttl: cfg.get('REDIS_TTL', 3600),
        }),
      }),
    }),

    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),

    // PrismaModule,
    // KafkaModule,

    AuthModule,
    UsersModule,
    ProductsModule,
    CategoriesModule,
    BrandsModule,
    OrdersModule,
    PaymentsModule,
    InventoryModule,
    ShipmentsModule,
    ReviewsModule,
    CouponsModule,
    NotificationsModule,
    UploadModule,
  ],
})
export class AppModule {}
