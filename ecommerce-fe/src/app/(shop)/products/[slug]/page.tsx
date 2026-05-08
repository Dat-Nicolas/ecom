'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Star, ShoppingCart, Heart, Shield, Truck, RefreshCw, ChevronRight, Minus, Plus } from 'lucide-react'
import { productsApi, reviewsApi } from '@/lib/api'
import { Product, ProductVariant, Review } from '@/types'
import { formatPrice, formatDatetime } from '@/lib/utils'
import { useCartStore } from '@/store/cart.store'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)
  const [qty, setQty] = useState(1)
  const [activeImg, setActiveImg] = useState(0)
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews'>('desc')
  const addItem = useCartStore((s) => s.addItem)

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ['product', slug],
    queryFn: () => productsApi.bySlug(slug).then(r => r.data.data as Product),
    enabled: !!slug,
  })

  useEffect(() => {
    setSelectedVariant(product?.variants?.[0] ?? null)
    setActiveImg(0)
  }, [product?.id])

  const { data: reviewsData } = useQuery<{ data: Review[] }>({
    queryKey: ['reviews', product?.id],
    queryFn: () => reviewsApi.byProduct(product!.id, { limit: 5 }).then(r => r.data.data as { data: Review[] }),
    enabled: !!product?.id,
  })
  const reviews: Review[] = reviewsData?.data ?? []

  if (isLoading) return (
    <div className="page-container py-8">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="skeleton aspect-square rounded-2xl" />
        <div className="space-y-4">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-6 rounded" />)}</div>
      </div>
    </div>
  )
  if (!product) return <div className="page-container py-20 text-center text-gray-500">Không tìm thấy sản phẩm</div>

  const variant = selectedVariant ?? product.variants?.[0]
  const price = Number(variant?.salePrice ?? variant?.price ?? product.salePrice ?? product.price)
  const origPrice = Number(variant?.price ?? product.price)
  const imgs = product.images?.length > 0 ? product.images : [{ url: `https://picsum.photos/seed/${product.id}/600/600`, id: '0', altText: product.name, isPrimary: true, sortOrder: 0 }]

  return (
    <div className="bg-white">
      {/* Breadcrumb */}
      <div className="border-b border-gray-100">
        <div className="page-container py-3 flex items-center gap-1.5 text-sm text-gray-500">
          <Link href="/" className="hover:text-primary-600">Trang chủ</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/products" className="hover:text-primary-600">Sản phẩm</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-900 font-medium truncate max-w-[200px]">{product.name}</span>
        </div>
      </div>

      <div className="page-container py-8">
        <div className="grid md:grid-cols-2 gap-10">
          {/* Images */}
          <div>
            <div className="rounded-2xl overflow-hidden bg-gray-50 mb-3 aspect-square">
              <img src={imgs[activeImg]?.url} alt={product.name} className="w-full h-full object-contain p-4" />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {imgs.map((img, i) => (
                <button key={img.id} onClick={() => setActiveImg(i)}
                  className={cn('w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-colors', activeImg === i ? 'border-primary-500' : 'border-transparent hover:border-gray-300')}>
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              {product.brand && <span className="badge-blue text-xs">{product.brand.name}</span>}
              {product.isFeatured && <span className="badge-orange text-xs">🔥 Hot</span>}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3 leading-tight">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`w-4 h-4 ${i < Math.round(Number(product.avgRating)) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`} />)}</div>
              <span className="text-sm text-gray-500">{Number(product.avgRating).toFixed(1)} ({product.reviewCount} đánh giá) · Đã bán {product.soldCount}</span>
            </div>

            {/* Price */}
            <div className="flex items-end gap-3 mb-5 p-4 bg-primary-50 rounded-xl">
              <span className="text-3xl font-extrabold text-primary-600">{formatPrice(price)}</span>
              {price < origPrice && <>
                <span className="text-gray-400 line-through text-base">{formatPrice(origPrice)}</span>
                <span className="bg-red-100 text-red-600 text-sm font-bold px-2 py-0.5 rounded-full">-{Math.round((1 - price / origPrice) * 100)}%</span>
              </>}
            </div>

            {/* Variants */}
            {product.variants?.length > 0 && (
              <div className="mb-5">
                <p className="text-sm font-medium text-gray-700 mb-2">Phiên bản: <span className="text-primary-600">{variant?.name}</span></p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => (
                    <button key={v.id} onClick={() => setSelectedVariant(v)}
                      className={cn('px-3 py-2 rounded-lg text-sm border transition-all', variant?.id === v.id ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium' : 'border-gray-200 text-gray-600 hover:border-gray-300')}>
                      {Object.values(v.attributes as Record<string, string> ?? {}).join(' · ')}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-3 mb-5">
              <span className="text-sm font-medium text-gray-700">Số lượng:</span>
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-9 h-9 flex items-center justify-center hover:bg-gray-50 transition-colors"><Minus className="w-3.5 h-3.5" /></button>
                <span className="w-10 text-center text-sm font-medium">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="w-9 h-9 flex items-center justify-center hover:bg-gray-50 transition-colors"><Plus className="w-3.5 h-3.5" /></button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mb-6">
              <button onClick={() => { if (variant) { addItem(product, variant, qty); toast.success(`Đã thêm ${qty} sản phẩm vào giỏ!`) } }}
                className="flex-1 btn-primary btn-lg gap-2"><ShoppingCart className="w-5 h-5" />Thêm vào giỏ</button>
              <button className="btn-secondary btn-lg btn-icon"><Heart className="w-5 h-5" /></button>
            </div>

            {/* Guarantees */}
            <div className="space-y-2 border-t border-gray-100 pt-5">
              {[{ icon: Shield, text: 'Hàng chính hãng, bảo hành 12 tháng' }, { icon: Truck, text: 'Giao hàng nhanh 2h nội thành, 24h toàn quốc' }, { icon: RefreshCw, text: 'Đổi trả miễn phí trong 30 ngày' }].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-sm text-gray-600">
                  <Icon className="w-4 h-4 text-green-500 flex-shrink-0" />{text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-10">
          <div className="flex border-b border-gray-200 gap-6">
            {(['desc', 'specs', 'reviews'] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={cn('pb-3 text-sm font-medium border-b-2 -mb-px transition-colors', activeTab === tab ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700')}>
                {tab === 'desc' ? 'Mô tả' : tab === 'specs' ? 'Thông số' : `Đánh giá (${product.reviewCount})`}
              </button>
            ))}
          </div>
          <div className="py-6">
            {activeTab === 'desc' && <div className="prose max-w-none text-sm text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: product.description ?? '<p>Chưa có mô tả.</p>' }} />}
            {activeTab === 'specs' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries((product.attributes as Record<string, string>) ?? {}).map(([k, v]) => (
                  <div key={k} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-500 w-28 flex-shrink-0 capitalize">{k}</span>
                    <span className="text-sm font-medium text-gray-900">{String(v)}</span>
                  </div>
                ))}
              </div>
            )}
            {activeTab === 'reviews' && (
              <div className="space-y-4">
                {reviews.length === 0 ? <p className="text-gray-500 text-sm">Chưa có đánh giá nào.</p> : reviews.map((r) => (
                  <div key={r.id} className="p-4 border border-gray-100 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-xs font-bold text-primary-700">{r.user.fullName?.[0]}</div>
                      <div>
                        <p className="text-sm font-medium">{r.user.fullName}</p>
                        <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`w-3 h-3 ${i < r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`} />)}</div>
                      </div>
                      <span className="ml-auto text-xs text-gray-400">{formatDatetime(r.createdAt)}</span>
                    </div>
                    {r.comment && <p className="text-sm text-gray-700">{r.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
