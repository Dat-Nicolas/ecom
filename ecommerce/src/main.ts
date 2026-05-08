import { NestFactory } from "@nestjs/core";
import { ValidationPipe, VersioningType } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { ConfigService } from "@nestjs/config";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { TransformInterceptor } from "./common/interceptors/transform.interceptor";
import { LoggingInterceptor } from "./common/interceptors/logging.interceptor";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ["log", "error", "warn", "debug"],
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>("PORT", 8080);
  const nodeEnv = configService.get<string>("NODE_ENV", "development");

  // Global prefix
  app.setGlobalPrefix("api");

  // Versioning
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: "1" });

  // CORS
  app.enableCors({
    origin: nodeEnv === "production" ? configService.get("APP_URL") : "*",
    credentials: true,
  });

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Global filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global interceptors
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  // Swagger
  if (nodeEnv !== "production") {
    const swaggerConfig = new DocumentBuilder()
      .setTitle("E-Commerce API")
      .setDescription("NestJS E-Commerce Backend API Documentation")
      .setVersion("1.0")
      .addBearerAuth(
        { type: "http", scheme: "bearer", bearerFormat: "JWT" },
        "access-token",
      )
      .addTag("auth", "Authentication")
      .addTag("users", "User management")
      .addTag("products", "Product catalog")
      .addTag("categories", "Category management")
      .addTag("brands", "Brand management")
      .addTag("orders", "Order management")
      .addTag("payments", "Payment processing")
      .addTag("inventory", "Inventory management")
      .addTag("coupons", "Coupon management")
      .addTag("reviews", "Product reviews")
      .addTag("notifications", "Notifications")
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup("api/docs", app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
  }

  await app.listen(port);
  const baseUrl =
    nodeEnv === "production"
      ? configService.get("APP_URL")
      : `http://localhost:${port}`;

  console.log(`🚀 Server running on ${baseUrl}/api/v1`);
  console.log(`📚 Swagger docs: ${baseUrl}/api/docs`);
}

bootstrap();
