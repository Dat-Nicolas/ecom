// src/types/index.ts

export interface User {
  id: string
  email: string
  fullName: string
  phone?: string
  avatarUrl?: string
  status: 'active' | 'inactive' | 'banned'
  role: Role
  createdAt: string
}

export interface Role {
  id: number
  name: string
  slug: string
  permissions: string[]
}

export interface Category {
  id: number
  name: string
  slug: string
  imageUrl?: string
  parentId?: number
  children?: Category[]
  _count?: { products: number }
}

export interface Brand {
  id: number
  name: string
  slug: string
  logoUrl?: string
  country?: string
}

export interface ProductVariant {
  id: string
  productId: string
  name: string
  sku: string
  attributes?: Record<string, string>
  price: number
  salePrice?: number
  imageUrl?: string
  isActive: boolean
}

export interface ProductImage {
  id: string
  url: string
  altText?: string
  isPrimary: boolean
  sortOrder: number
}

export interface Product {
  id: string
  name: string
  slug: string
  sku?: string
  description?: string
  attributes?: Record<string, string>
  price: number
  salePrice?: number
  status: 'draft' | 'active' | 'archived'
  isFeatured: boolean
  avgRating: number
  reviewCount: number
  soldCount: number
  category: Category
  brand?: Brand
  variants: ProductVariant[]
  images: ProductImage[]
  createdAt: string
}

export interface CartItem {
  id: string
  variantId: string
  variant: ProductVariant & { product: Product }
  quantity: number
  unitPrice: number
}

export interface Cart {
  id: string
  items: CartItem[]
}

export interface OrderItem {
  id: string
  variantId?: string
  productName: string
  variantName?: string
  sku?: string
  quantity: number
  unitPrice: number
  discountAmt: number
  lineTotal: number
}

export interface Order {
  id: string
  orderCode: string
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  subtotal: number
  discountAmt: number
  shippingFee: number
  total: number
  note?: string
  orderedAt: string
  items: OrderItem[]
  user?: User
  payments?: Payment[]
  shipments?: Shipment[]
}

export interface Payment {
  id: string
  orderId: string
  method: string
  status: 'pending' | 'success' | 'failed' | 'refunded'
  amount: number
  currency: string
  paidAt?: string
  createdAt: string
}

export interface Shipment {
  id: string
  orderId: string
  carrier?: string
  trackingNo?: string
  status: string
  estimatedDate?: string
  shippedAt?: string
  deliveredAt?: string
}

export interface Review {
  id: string
  productId: string
  rating: number
  comment?: string
  status: 'pending' | 'approved' | 'rejected'
  user: { fullName: string; avatarUrl?: string }
  createdAt: string
}

export interface Coupon {
  id: string
  code: string
  type: 'percent' | 'fixed'
  value: number
  maxDiscount?: number
  minOrderValue?: number
  usageLimit?: number
  usedCount: number
  isActive: boolean
  expiresAt?: string
}

export interface Notification {
  id: number
  type: string
  title: string
  body?: string
  isRead: boolean
  createdAt: string
}

export interface PaginatedResult<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

export interface ApiResponse<T> {
  success: boolean
  statusCode: number
  data: T
  message?: string
  meta?: PaginatedResult<T>['meta']
}

export interface DashboardStats {
  totalRevenue: number
  totalOrders: number
  totalUsers: number
  totalProducts: number
  revenueGrowth: number
  ordersGrowth: number
  usersGrowth: number
  recentOrders: Order[]
  revenueByMonth: { month: string; revenue: number }[]
  ordersByStatus: { status: string; count: number }[]
  topProducts: { name: string; sold: number; revenue: number }[]
}
