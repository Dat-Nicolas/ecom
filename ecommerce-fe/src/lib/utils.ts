// src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
}

export function formatDate(date: string, format = 'dd/MM/yyyy'): string {
  return new Intl.DateTimeFormat('vi-VN').format(new Date(date))
}

export function formatDatetime(date: string): string {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(date))
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('vi-VN').format(n)
}

export function truncate(str: string, max = 80): string {
  return str.length > max ? str.slice(0, max) + '…' : str
}

export function getOrderStatusLabel(status: string): string {
  const map: Record<string, string> = {
    pending: 'Chờ xác nhận', confirmed: 'Đã xác nhận',
    processing: 'Đang xử lý', shipped: 'Đang giao',
    delivered: 'Đã giao', cancelled: 'Đã huỷ', refunded: 'Hoàn tiền',
  }
  return map[status] ?? status
}

export function getOrderStatusColor(status: string): string {
  const map: Record<string, string> = {
    pending: 'badge-yellow', confirmed: 'badge-blue',
    processing: 'badge-blue', shipped: 'badge-orange',
    delivered: 'badge-green', cancelled: 'badge-red', refunded: 'badge-gray',
  }
  return map[status] ?? 'badge-gray'
}

export function getPaymentMethodLabel(method: string): string {
  const map: Record<string, string> = {
    cod: 'Thanh toán khi nhận hàng', bank_transfer: 'Chuyển khoản',
    momo: 'Ví MoMo', vnpay: 'VNPay', zalopay: 'ZaloPay', stripe: 'Stripe',
  }
  return map[method] ?? method
}

export function discountPercent(price: number, salePrice: number): number {
  return Math.round((1 - salePrice / price) * 100)
}
