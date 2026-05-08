# 🛍️ TechShop — Frontend

Next.js 14 · TypeScript · Tailwind CSS · Chart.js · Zustand · TanStack Query

---

## 📦 Tech Stack

| | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Charts | Chart.js + react-chartjs-2 |
| State | Zustand (auth + cart, persist) |
| Data Fetching | TanStack Query v5 |
| Forms | React Hook Form + Zod |
| HTTP | Axios (auto token refresh) |
| Toast | react-hot-toast |
| Animation | Framer Motion |

---

## 🗂 Cấu trúc

```
src/
├── app/
│   ├── (shop)/               # Customer-facing pages
│   │   ├── page.tsx          # Homepage
│   │   ├── products/         # Product listing + detail
│   │   ├── cart/             # Shopping cart
│   │   ├── checkout/         # Checkout flow
│   │   ├── orders/           # My orders
│   │   └── account/          # Profile & addresses
│   ├── admin/                # Admin panel
│   │   ├── page.tsx          # Dashboard (Charts)
│   │   ├── products/         # Product management
│   │   ├── orders/           # Order management
│   │   ├── users/            # User management
│   │   ├── coupons/          # Coupon management
│   │   ├── inventory/        # Stock management
│   │   ├── reviews/          # Review moderation
│   │   └── analytics/        # Full analytics charts
│   ├── login/                # Login + Register
│   └── layout.tsx            # Root layout
├── components/
│   ├── layout/               # Navbar, Footer, AdminSidebar
│   └── common/               # Providers, shared UI
├── lib/
│   ├── api.ts                # Axios client + all API calls
│   └── utils.ts              # Helpers, formatters
├── store/
│   ├── auth.store.ts         # Zustand auth store
│   └── cart.store.ts         # Zustand cart store (persisted)
├── types/
│   └── index.ts              # All TypeScript interfaces
└── styles/
    └── globals.css           # Tailwind + custom classes
```

---

## 🚀 Cài đặt & Chạy

### 1. Setup env
```bash
cp .env.local.example .env.local
# Sửa NEXT_PUBLIC_API_URL trỏ đến backend
```

### 2. Cài dependencies
```bash
npm install
```

### 3. Chạy dev
```bash
npm run dev
# → http://localhost:3001
```

### 4. Build production
```bash
npm run build
npm start
```

---

## 📱 Các trang

### Shop (Customer)
| Route | Mô tả |
|-------|-------|
| `/` | Trang chủ: Hero, danh mục, sản phẩm nổi bật |
| `/products` | Danh sách sản phẩm + filter + phân trang |
| `/products/[slug]` | Chi tiết sản phẩm + variants + reviews |
| `/cart` | Giỏ hàng + áp mã giảm giá |
| `/checkout` | Thanh toán (chọn địa chỉ + phương thức) |
| `/orders` | Lịch sử đơn hàng |
| `/account` | Hồ sơ + địa chỉ giao hàng |
| `/login` | Đăng nhập + Đăng ký |

### Admin Panel
| Route | Mô tả |
|-------|-------|
| `/admin` | Dashboard: doanh thu, đơn hàng, biểu đồ |
| `/admin/products` | Quản lý sản phẩm |
| `/admin/orders` | Quản lý đơn hàng + cập nhật trạng thái |
| `/admin/users` | Quản lý người dùng |
| `/admin/coupons` | Tạo và quản lý mã giảm giá |
| `/admin/inventory` | Quản lý tồn kho |
| `/admin/reviews` | Kiểm duyệt đánh giá |
| `/admin/analytics` | Biểu đồ phân tích chi tiết |

---

## 🎨 Design System

```css
/* Buttons */
.btn-primary   /* Xanh dương */
.btn-secondary /* Trắng/viền */
.btn-danger    /* Đỏ */
.btn-ghost     /* Trong suốt */
.btn-brand     /* Cam (CTA) */

/* Badges */
.badge-blue .badge-green .badge-red .badge-yellow .badge-gray .badge-orange

/* Components */
.card .card-hover
.input .input-error
.label
.skeleton       /* Loading state */
.product-card   /* Product card with hover */
```

---

## 🔐 Tài khoản demo
- **Admin:** `admin@ecommerce.com` / `Admin@123456`
- **Customer:** `customer@ecommerce.com` / `Customer@123`

---

## 🔗 Kết nối Backend
Đảm bảo backend NestJS đang chạy ở `http://localhost:8080` trước khi chạy frontend.
