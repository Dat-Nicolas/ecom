# 🛒 E-Commerce Backend API

NestJS · Prisma · PostgreSQL · Kafka · Redis — chuẩn enterprise production.

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | NestJS 10 + TypeScript |
| ORM | Prisma 5 |
| Database | PostgreSQL 16 |
| Cache | Redis 7 |
| Message Broker | Apache Kafka |
| Auth | JWT (Access + Refresh Token) |
| Docs | Swagger / OpenAPI |

---

## 🗂 Cấu trúc dự án

```
src/
├── common/
│   ├── decorators/        # @CurrentUser, @Roles, @Public
│   ├── filters/           # HttpExceptionFilter
│   ├── guards/            # JwtAuthGuard, RolesGuard
│   ├── interceptors/      # TransformInterceptor, LoggingInterceptor
│   └── dto/               # PaginationDto
├── config/
│   └── kafka/             # KafkaModule, KafkaService
├── prisma/                # PrismaService, PrismaModule
└── modules/
    ├── auth/              # Register, Login, Refresh Token
    ├── users/             # Profile, Addresses
    ├── products/          # CRUD, Variants, Featured
    ├── categories/        # Tree structure (đa cấp)
    ├── brands/            # Brand management
    ├── orders/            # Place order, status flow
    ├── payments/          # COD, VNPay integration
    ├── inventory/         # Stock management, Warehouses
    ├── shipments/         # Tracking, Delivery
    ├── reviews/           # Rating, Moderation
    ├── coupons/           # Discount codes
    ├── notifications/     # In-app notifications
    └── upload/            # Image upload
```

---

## 🚀 Cài đặt & chạy

### 1. Yêu cầu
- Node.js >= 20
- Docker & Docker Compose

### 2. Clone & setup env
```bash
cp .env.example .env
# Chỉnh sửa .env theo môi trường của bạn
```

### 3. Chạy bằng Docker (khuyến nghị)
```bash
# Khởi động tất cả services (PostgreSQL, Redis, Kafka, API)
docker-compose up -d

# Xem logs
docker-compose logs -f api
```

### 4. Chạy local (dev)
```bash
# Cài dependencies
npm install

# Khởi động infrastructure
docker-compose up -d postgres redis kafka zookeeper

# Generate Prisma client
npm run prisma:generate

# Chạy migrations
npm run prisma:migrate

# Seed data mẫu
npm run prisma:seed

# Start server
npm run start:dev
```

---

## 🌐 API Endpoints

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/v1/auth/register` | Đăng ký |
| POST | `/api/v1/auth/login` | Đăng nhập |
| POST | `/api/v1/auth/refresh` | Refresh token |
| GET | `/api/v1/products` | Danh sách sản phẩm |
| GET | `/api/v1/products/featured` | Sản phẩm nổi bật |
| GET | `/api/v1/products/slug/:slug` | Sản phẩm theo slug |
| GET | `/api/v1/categories` | Danh mục |
| POST | `/api/v1/orders` | Đặt hàng |
| GET | `/api/v1/orders/my` | Đơn hàng của tôi |
| POST | `/api/v1/payments/orders/:id` | Thanh toán |
| POST | `/api/v1/coupons/validate` | Kiểm tra mã giảm giá |
| POST | `/api/v1/reviews` | Đánh giá sản phẩm |
| GET | `/api/v1/notifications` | Thông báo |

📚 **Swagger UI:** `http://localhost:8080/api/docs`

---

## 📬 Kafka Topics

| Topic | Trigger |
|-------|---------|
| `order.created` | Đơn hàng được tạo |
| `order.confirmed` | Đơn hàng xác nhận |
| `order.cancelled` | Đơn hàng hủy |
| `payment.success` | Thanh toán thành công |
| `payment.failed` | Thanh toán thất bại |
| `shipment.updated` | Cập nhật vận chuyển |
| `inventory.low` | Tồn kho thấp |
| `user.registered` | Người dùng đăng ký |

🖥 **Kafka UI:** `http://localhost:8888`

---

## 🔐 Authentication

```bash
# Login
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ecommerce.com","password":"Admin@123456"}'

# Dùng access token
curl http://localhost:8080/api/v1/users/me \
  -H "Authorization: Bearer <access_token>"
```

**Tài khoản mẫu:**
- Admin: `admin@ecommerce.com` / `Admin@123456`
- Customer: `customer@ecommerce.com` / `Customer@123`

---

## 🔒 Phân quyền

| Role | Quyền |
|------|-------|
| `admin` | Toàn quyền (`*`) |
| `customer` | orders.view, reviews.create, profile.edit |

---

## 📊 Database Schema

22 bảng, 8 module:
- **User & Auth:** users, user_addresses, roles
- **Product Catalog:** products, product_variants, categories, brands, product_images
- **Order:** carts, cart_items, orders, order_items
- **Payment:** payments (COD, VNPay, Momo, ZaloPay...)
- **Inventory:** warehouses, inventory, inventory_logs
- **Shipping:** shipments
- **Reviews:** reviews
- **Promotions:** coupons, notifications

---

## 🛠 Scripts

```bash
npm run start:dev        # Dev mode với hot reload
npm run start:prod       # Production mode
npm run build            # Build TypeScript
npm run prisma:studio    # Mở Prisma Studio (DB GUI)
npm run prisma:seed      # Seed data mẫu
npm run test             # Unit tests
npm run test:e2e         # E2E tests
```
