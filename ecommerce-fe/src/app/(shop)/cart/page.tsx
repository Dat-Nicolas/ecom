'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag } from 'lucide-react'
import { useCartStore } from '@/store/cart.store'
import { useAuthStore } from '@/store/auth.store'
import { couponsApi } from '@/lib/api'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function CartPage() {
  const { items, removeItem, updateQty, totalPrice, clearCart } = useCartStore()
  const { user } = useAuthStore()
  const router = useRouter()
  const [couponCode, setCouponCode] = useState('')
  const [discount, setDiscount] = useState(0)
  const [applying, setApplying] = useState(false)

  const subtotal = totalPrice()
  const shippingFee = subtotal - discount >= 500000 ? 0 : 30000
  const total = subtotal - discount + shippingFee

  const applyCoupon = async () => {
    if (!couponCode.trim()) return
    setApplying(true)
    try {
      const res = await couponsApi.validate(couponCode, subtotal)
      setDiscount(res.data.data.discount)
      toast.success(`Áp dụng mã thành công! Giảm ${formatPrice(res.data.data.discount)}`)
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? 'Mã không hợp lệ')
    } finally {
      setApplying(false)
    }
  }

  const handleCheckout = () => {
    if (!user) { router.push('/login?redirect=/cart'); return }
    router.push('/checkout')
  }

  if (items.length === 0) return (
    <div className="page-container py-20 text-center">
      <div className="text-6xl mb-4">🛒</div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Giỏ hàng trống</h2>
      <p className="text-gray-500 mb-6">Hãy thêm sản phẩm vào giỏ để tiếp tục mua sắm</p>
      <Link href="/products" className="btn-primary">Mua sắm ngay</Link>
    </div>
  )

  return (
    <div className="py-8">
      <div className="page-container">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-primary-600" /> Giỏ hàng ({items.length} sản phẩm)
        </h1>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((item) => (
              <div key={item.id} className="card p-4 flex gap-4">
                <img src={item.imageUrl} alt={item.productName} className="w-20 h-20 object-cover rounded-lg bg-gray-100 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">{item.productName}</h3>
                  <p className="text-xs text-gray-500 mb-2">{item.variantName} · SKU: {item.sku}</p>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                      <button onClick={() => updateQty(item.variantId, item.quantity - 1)} className="w-7 h-7 flex items-center justify-center hover:bg-gray-50 text-gray-600"><Minus className="w-3 h-3" /></button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <button onClick={() => updateQty(item.variantId, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center hover:bg-gray-50 text-gray-600"><Plus className="w-3 h-3" /></button>
                    </div>
                    <span className="font-bold text-primary-600 text-sm">{formatPrice(item.price * item.quantity)}</span>
                    <button onClick={() => removeItem(item.variantId)} className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            ))}
            <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1 mt-2">
              <Trash2 className="w-4 h-4" /> Xoá tất cả
            </button>
          </div>

          {/* Summary */}
          <div className="space-y-4">
            {/* Coupon */}
            <div className="card p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Tag className="w-4 h-4 text-primary-600" />Mã giảm giá</h3>
              <div className="flex gap-2">
                <input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="Nhập mã..." className="input flex-1 text-sm" />
                <button onClick={applyCoupon} disabled={applying} className="btn-primary btn-sm whitespace-nowrap">Áp dụng</button>
              </div>
            </div>

            {/* Total */}
            <div className="card p-4 space-y-3">
              <h3 className="font-semibold text-gray-900">Tổng đơn hàng</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600"><span>Tạm tính</span><span>{formatPrice(subtotal)}</span></div>
                {discount > 0 && <div className="flex justify-between text-green-600"><span>Giảm giá</span><span>-{formatPrice(discount)}</span></div>}
                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển</span>
                  <span>{shippingFee === 0 ? <span className="text-green-600 font-medium">Miễn phí</span> : formatPrice(shippingFee)}</span>
                </div>
                {shippingFee > 0 && <p className="text-xs text-gray-400">Mua thêm {formatPrice(500000 - subtotal + discount)} để miễn phí ship</p>}
                <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-100">
                  <span>Tổng cộng</span><span className="text-primary-600">{formatPrice(total)}</span>
                </div>
              </div>
              <button onClick={handleCheckout} className="w-full btn-primary btn-lg mt-2">
                Đặt hàng <ArrowRight className="w-4 h-4" />
              </button>
              <Link href="/products" className="w-full btn-secondary btn-sm text-center block">← Tiếp tục mua sắm</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
