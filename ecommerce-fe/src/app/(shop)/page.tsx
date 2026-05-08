'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, ShieldCheck, Truck, RefreshCw, Headphones, Star, TrendingUp, Zap } from 'lucide-react'
import { productsApi, categoriesApi } from '@/lib/api'
import { Product, Category } from '@/types'
import { formatPrice, discountPercent } from '@/lib/utils'
import { useCartStore } from '@/store/cart.store'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

const HERO_SLIDES = [
  { title: 'iPhone 15 Pro Max', subtitle: 'Chip A17 Pro · Camera 48MP · Titan siêu bền', badge: 'Mới nhất', img: 'https://picsum.photos/seed/iphone/800/400', color: 'from-slate-900 to-slate-700', cta: 'Mua ngay', href: '/products' },
  { title: 'MacBook Pro M3', subtitle: 'Hiệu năng vượt trội · Pin 22 giờ · Màn Liquid Retina', badge: 'Hot deal', img: 'https://picsum.photos/seed/macbook/800/400', color: 'from-indigo-900 to-indigo-700', cta: 'Khám phá', href: '/products' },
]

const getBenefits = (t: any) => [
  { icon: Truck, title: t('home.fastDelivery'), desc: t('home.fastDeliveryDesc') },
  { icon: ShieldCheck, title: t('home.genuine'), desc: t('home.genuineDesc') },
  { icon: RefreshCw, title: t('home.easyReturn'), desc: t('home.easyReturnDesc') },
  { icon: Headphones, title: t('home.support247'), desc: t('home.support247Desc') },
]

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
      <div className="relative overflow-hidden bg-gray-50 dark:bg-gray-800/50">
        <img src={mainImg} alt={product.name} className="product-img group-hover:scale-105 transition-transform duration-500" />
        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">-{discount}%</span>
        )}
        {product.isFeatured && (
          <span className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><TrendingUp className="w-3 h-3" />Hot</span>
        )}
      </div>
      <div className="p-4">
        <Link href={`/products/${product.slug}`}>
          <p className="text-xs text-gray-400 mb-1">{product.brand?.name ?? product.category?.name}</p>
          <h3 className="font-medium text-gray-900 dark:text-white text-sm leading-tight mb-2 line-clamp-2 hover:text-primary-600 transition-colors">{product.name}</h3>
        </Link>
        <div className="flex items-center gap-1 mb-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`w-3 h-3 ${i < Math.round(Number(product.avgRating)) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`} />
          ))}
          <span className="text-xs text-gray-400 ml-1">({product.reviewCount})</span>
        </div>
        <div className="flex items-end gap-2 mb-3">
          <span className="font-bold text-primary-600 text-base">{formatPrice(salePrice)}</span>
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

export default function HomePage() {
  const { t } = useTranslation()
  const { data: featuredData } = useQuery({ queryKey: ['featured'], queryFn: () => productsApi.featured().then(r => r.data.data) })
  const { data: categoriesData } = useQuery({ queryKey: ['categories'], queryFn: () => categoriesApi.list().then(r => r.data.data) })
  const { data: latestData } = useQuery({ queryKey: ['latest'], queryFn: () => productsApi.list({ limit: 8, status: 'active', sortBy: 'createdAt', sortOrder: 'desc' }).then(r => r.data.data) })

  const featured: Product[] = featuredData ?? []
  const categories: Category[] = categoriesData ?? []
  const latest: Product[] = latestData?.data ?? []

  const CAT_ICONS = ['📱', '💻', '🎧', '⌚', '📸', '🖥️', '🎮', '🔋']
  const BENEFITS = getBenefits(t)

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/hero/1920/600')] bg-cover bg-center opacity-10" />
        <div className="page-container relative py-16 md:py-24">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1.5 bg-primary-500/20 text-primary-300 text-xs font-semibold px-3 py-1 rounded-full mb-4 border border-primary-500/30">
              <Zap className="w-3 h-3" /> {t('home.flashSale')}
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4 text-balance">
              {t('home.heroTitle1')}<br /><span className="text-primary-400">{t('home.heroTitle2')}</span>
            </h1>
            <p className="text-gray-300 text-lg mb-8 leading-relaxed">
              {t('home.heroDesc')}
            </p>
            <div className="flex gap-3 flex-wrap">
              <Link href="/products" className="btn-brand btn-lg">{t('home.shopNow')} <ArrowRight className="w-4 h-4" /></Link>
              <Link href="/products?isFeatured=true" className="btn btn-lg border border-white/30 text-white hover:bg-white/10 px-6 py-3 text-base">{t('home.viewDeals')}</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits bar */}
      <section className="bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800">
        <div className="page-container">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100 dark:divide-gray-800">
            {BENEFITS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3 p-4 md:p-5">
                <div className="w-9 h-9 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-10 bg-gray-50 dark:bg-gray-950">
        <div className="page-container">
          <div className="flex items-center justify-between mb-6">
            <h2 className="section-title">{t('home.categories')}</h2>
            <Link href="/products" className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">{t('common.viewAll')} <ArrowRight className="w-3.5 h-3.5" /></Link>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
            {(categories.length > 0
              ? [...categories].sort((a, b) => a.id - b.id)
              : Array.from({ length: 8 }, (_, i) => ({ id: i, name: [t('home.catPhones'),t('home.catLaptops'),t('home.catHeadphones'),t('home.catSmartwatch'),t('home.catCamera'),t('home.catMonitor'),t('home.catGaming'),t('home.catAccessories')][i], slug: '' }))).map((cat, i) => (
                <Link key={cat.id} href={`/products?categoryId=${cat.id}`}
                  className="flex flex-col items-center gap-2 p-3 bg-white dark:bg-gray-900 rounded-xl hover:shadow-md hover:-translate-y-0.5 transition-all border border-gray-100 dark:border-gray-800 group">
                  <span className="text-2xl">{CAT_ICONS[i % CAT_ICONS.length]}</span>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center group-hover:text-primary-600 transition-colors">{cat.name}</span>
                </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured products */}
      {featured.length > 0 && (
        <section className="py-10">
          <div className="page-container">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="section-title flex items-center gap-2"><TrendingUp className="w-5 h-5 text-orange-500" /> {t('home.featured')}</h2>
                <p className="text-muted mt-1">{t('home.featuredDesc')}</p>
              </div>
              <Link href="/products?isFeatured=true" className="btn-secondary btn-sm">{t('common.viewMore')} <ArrowRight className="w-3.5 h-3.5" /></Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {featured.slice(0, 5).map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* Latest products */}
      <section className="py-10 bg-gray-50 dark:bg-gray-950">
        <div className="page-container">
          <div className="flex items-center justify-between mb-6">
            <h2 className="section-title">{t('home.latest')}</h2>
            <Link href="/products" className="btn-secondary btn-sm">{t('common.viewAll')} <ArrowRight className="w-3.5 h-3.5" /></Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {latest.length > 0
              ? latest.map((p) => <ProductCard key={p.id} product={p} />)
              : Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="card p-4 space-y-3">
                  <div className="skeleton aspect-square w-full rounded-lg" />
                  <div className="skeleton h-4 w-3/4" />
                  <div className="skeleton h-4 w-1/2" />
                  <div className="skeleton h-8 w-full rounded-lg" />
                </div>
              ))
            }
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="py-14 bg-gradient-to-r from-primary-600 to-indigo-600 text-white">
        <div className="page-container text-center">
          <h2 className="text-3xl font-bold mb-3">{t('home.ctaTitle')}</h2>
          <p className="text-primary-100 mb-6">{t('home.ctaDesc')}</p>
          <form className="flex gap-2 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder={t('home.ctaPlaceholder')} className="flex-1 px-4 py-2.5 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-white" />
            <button className="bg-white text-primary-600 font-semibold px-5 py-2.5 rounded-lg hover:bg-primary-50 transition-colors text-sm">{t('home.ctaButton')}</button>
          </form>
        </div>
      </section>
    </div>
  )
}
