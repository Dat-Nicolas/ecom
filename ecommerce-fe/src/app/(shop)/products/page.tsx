'use client'
import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { SlidersHorizontal, Star, TrendingUp, ArrowRight, X, ChevronDown } from 'lucide-react'
import { productsApi, categoriesApi, brandsApi } from '@/lib/api'
import { Product, Category, Brand } from '@/types'
import { formatPrice, discountPercent, getOrderStatusColor } from '@/lib/utils'
import { useCartStore } from '@/store/cart.store'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { Suspense } from 'react'
import { useTranslation } from 'react-i18next'

function ProductCard({ product }: { product: Product }) {
  const { t } = useTranslation()
  const addItem = useCartStore((s) => s.addItem)
  const mainImg = product.images?.[0]?.url ?? `https://picsum.photos/seed/${product.id}/400/400`
  const firstVariant = product.variants?.[0]
  const salePrice = Number(product.salePrice ?? product.price)
  const origPrice = Number(product.price)
  const discount = product.salePrice ? discountPercent(origPrice, salePrice) : 0
  return (
    <div className="product-card group">
      <div className="relative overflow-hidden">
        <img src={mainImg} alt={product.name} className="product-img group-hover:scale-105 transition-transform duration-500" />
        {discount > 0 && <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">-{discount}%</span>}
      </div>
      <div className="p-4">
        <Link href={`/products/${product.slug}`}>
          <p className="text-xs text-gray-400 mb-1">{product.brand?.name}</p>
          <h3 className="font-medium text-gray-900 dark:text-white text-sm leading-tight mb-2 line-clamp-2 hover:text-primary-600">{product.name}</h3>
        </Link>
        <div className="flex items-center gap-0.5 mb-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`w-3 h-3 ${i < Math.round(Number(product.avgRating)) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`} />
          ))}
          <span className="text-xs text-gray-400 ml-1">({product.reviewCount})</span>
        </div>
        <div className="flex items-end gap-2 mb-3">
          <span className="font-bold text-primary-600">{formatPrice(salePrice)}</span>
          {discount > 0 && <span className="text-xs text-gray-400 line-through">{formatPrice(origPrice)}</span>}
        </div>
        {firstVariant && (
          <button onClick={() => { addItem(product, firstVariant); toast.success(t('common.addedToCart')) }}
            className="w-full btn-primary btn-sm">{t('common.addToCart')}</button>
        )}
      </div>
    </div>
  )
}

const getSortOptions = (t: any) => [
  { label: t('products.newest'), value: 'createdAt_desc' },
  { label: t('products.priceLow'), value: 'price_asc' },
  { label: t('products.priceHigh'), value: 'price_desc' },
  { label: t('products.bestSelling'), value: 'soldCount_desc' },
  { label: t('products.topRated'), value: 'avgRating_desc' },
]

function ProductsContent() {
  const { t } = useTranslation()
  const sp = useSearchParams()
  const router = useRouter()
  const [sort, setSort] = useState('createdAt_desc')
  const [page, setPage] = useState(1)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedCat, setSelectedCat] = useState<number | undefined>(sp.get('categoryId') ? Number(sp.get('categoryId')) : undefined)
  const [selectedBrand, setSelectedBrand] = useState<number | undefined>()
  const search = sp.get('search') ?? undefined
  const isFeatured = sp.get('isFeatured') === 'true' ? true : undefined
  const [sortBy, sortOrder] = sort.split('_')

  const SORT_OPTIONS = getSortOptions(t)
  const { data: prodData, isLoading } = useQuery({
    queryKey: ['products', page, sort, selectedCat, selectedBrand, search, isFeatured],
    queryFn: () => productsApi.list({ page, limit: 16, sortBy, sortOrder, categoryId: selectedCat, brandId: selectedBrand, search, isFeatured, status: 'active' }).then(r => r.data),
  })
  const { data: catData } = useQuery({ queryKey: ['categories'], queryFn: () => categoriesApi.list().then(r => r.data.data) })
  const { data: brandData } = useQuery({ queryKey: ['brands'], queryFn: () => brandsApi.list().then(r => r.data.data) })

  const products: Product[] = prodData?.data?.data ?? []
  const meta = prodData?.data?.meta
  const categories: Category[] = catData ?? []
  const brands: Brand[] = brandData ?? []

  const Sidebar = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">{t('products.categories')}</h3>
        <div className="space-y-1">
          <button onClick={() => setSelectedCat(undefined)} className={cn('w-full text-left px-3 py-2 rounded-lg text-sm transition-colors', !selectedCat ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800')}>{t('common.all')}</button>
          {categories.map((c) => (
            <button key={c.id} onClick={() => setSelectedCat(c.id)} className={cn('w-full text-left px-3 py-2 rounded-lg text-sm transition-colors', selectedCat === c.id ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800')}>
              {c.name} {c._count && <span className="text-gray-400 text-xs">({c._count.products})</span>}
            </button>
          ))}
        </div>
      </div>
      <div>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">{t('products.brands')}</h3>
        <div className="space-y-1">
          {brands.map((b) => (
            <button key={b.id} onClick={() => setSelectedBrand(selectedBrand === b.id ? undefined : b.id)} className={cn('w-full text-left px-3 py-2 rounded-lg text-sm transition-colors', selectedBrand === b.id ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800')}>
              {b.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="py-6">
      <div className="page-container">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{search ? `${t('products.resultsFor')}: "${search}"` : t('products.allProducts')}</h1>
            {meta && <p className="text-muted mt-0.5">{meta.total} {t('products.productCount')}</p>}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden btn-secondary btn-sm gap-1.5">
              <SlidersHorizontal className="w-4 h-4" /> {t('products.filter')}
            </button>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="text-sm border border-gray-200 dark:border-gray-800 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500">
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar desktop */}
          <aside className="hidden md:block w-56 flex-shrink-0"><div className="card p-4 sticky top-24"><Sidebar /></div></aside>

          {/* Mobile sidebar */}
          {sidebarOpen && (
            <div className="fixed inset-0 z-50 md:hidden">
              <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
              <div className="absolute left-0 top-0 bottom-0 w-72 bg-white dark:bg-gray-950 p-5 overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-gray-900 dark:text-white">{t('products.filter')}</h2>
                  <button onClick={() => setSidebarOpen(false)} className="dark:text-gray-400"><X className="w-5 h-5" /></button>
                </div>
                <Sidebar />
              </div>
            </div>
          )}

          {/* Products grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="card p-4 space-y-3">
                    <div className="skeleton aspect-square rounded-lg" />
                    <div className="skeleton h-4 w-3/4" />
                    <div className="skeleton h-4 w-1/2" />
                    <div className="skeleton h-8 rounded-lg" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-5xl mb-4">🔍</p>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('products.noProductsFound')}</h3>
                <p className="text-muted">{t('products.tryAnotherSearch')}</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {products.map((p) => <ProductCard key={p.id} product={p} />)}
                </div>
                {/* Pagination */}
                {meta && meta.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button disabled={!meta.hasPrevPage} onClick={() => setPage(page - 1)} className="btn-secondary btn-sm disabled:opacity-40">← {t('common.prev')}</button>
                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(meta.totalPages, 5) }, (_, i) => i + 1).map((p) => (
                        <button key={p} onClick={() => setPage(p)} className={cn('w-8 h-8 rounded-lg text-sm font-medium transition-colors', page === p ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-100')}>{p}</button>
                      ))}
                    </div>
                    <button disabled={!meta.hasNextPage} onClick={() => setPage(page + 1)} className="btn-secondary btn-sm disabled:opacity-40">{t('common.next')} →</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProductsPage() {
  const { t } = useTranslation()
  return (
    <Suspense fallback={<div>{t('common.loading')}</div>}>
      <ProductsContent />
    </Suspense>
  )
}