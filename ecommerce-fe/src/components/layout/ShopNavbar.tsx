'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { deleteCookie, getCookie } from 'cookies-next'
import { ShoppingCart, Search, User, Menu, X, Bell, Heart, ChevronDown, Zap } from 'lucide-react'
import { useCartStore } from '@/store/cart.store'
import { useAuthStore } from '@/store/auth.store'
import { authApi } from '@/lib/api'
import { cn } from '@/lib/utils'

import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '@/components/common/LanguageSwitcher'
import ThemeToggle from '@/components/common/ThemeToggle'

const getNavLinks = (t: any) => [
  { label: t('navbar.phones'), href: '/products?categoryId=1' },
  { label: t('navbar.laptops'), href: '/products?categoryId=2' },
  { label: t('navbar.accessories'), href: '/products?categoryId=3' },
  { label: t('navbar.deals'), href: '/products?isFeatured=true' },
]

export default function ShopNavbar() {
  const { t } = useTranslation()
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const totalItems = useCartStore((s) => s.totalItems())
  const [mobileOpen, setMobileOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [userMenu, setUserMenu] = useState(false)

  const NAV_LINKS = getNavLinks(t)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (search.trim()) router.push(`/products?search=${encodeURIComponent(search)}`)
  }

  const handleLogout = async () => {
    const refreshToken = getCookie('refreshToken')

    if (typeof refreshToken === 'string' && refreshToken.length > 0) {
      try {
        await authApi.logout(refreshToken)
      } catch {
        // Ignore logout API failure and clear local session regardless.
      }
    }

    deleteCookie('accessToken')
    deleteCookie('refreshToken')
    logout()
    setUserMenu(false)
  }


  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800 shadow-sm">
      {/* Top banner */}
      <div className="bg-primary-600 text-white text-center text-[11px] sm:text-xs py-1.5 font-medium tracking-wide">
        {t('navbar.banner')}
      </div>

      <div className="page-container">
        <div className="flex items-center gap-4 h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-gray-900 dark:text-white">Tech<span className="text-primary-600">Shop</span></span>
          </Link>

          {/* Nav links desktop */}
          <nav className="hidden md:flex items-center gap-1 flex-1 ml-4">
            {NAV_LINKS.map((l) => (
              <Link key={l.href} href={l.href}
                className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors">
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Search */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-sm lg:max-w-md mx-2">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder={t('common.searchPlaceholder')}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition"
              />
            </div>
          </form>

          {/* Language Switcher - Desktop */}
          <div className="hidden lg:block">
            <LanguageSwitcher />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 ml-auto">
            <div className="hidden sm:block mr-1">
              <ThemeToggle />
            </div>
            
            <Link href="/wishlist" className="btn-icon btn-ghost hidden sm:flex">
              <Heart className="w-5 h-5" />
            </Link>

            <Link href="/cart" className="btn-icon btn-ghost relative">
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative">
                <button onClick={() => setUserMenu(!userMenu)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300">
                  <div className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-300 font-semibold text-xs">
                    {user.fullName?.[0]?.toUpperCase()}
                  </div>
                  <span className="hidden sm:block max-w-[80px] truncate">{user.fullName.split(' ').pop()}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </button>
                {userMenu && (
                  <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 py-1 z-50 animate-fade-in">
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800">
                      <p className="text-xs text-gray-500">{t('navbar.loggedInAs')}</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.email}</p>
                    </div>
                    <Link href="/account" onClick={() => setUserMenu(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <User className="w-4 h-4" /> {t('navbar.account')}
                    </Link>
                    <Link href="/orders" onClick={() => setUserMenu(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <ShoppingCart className="w-4 h-4" /> {t('navbar.orders')}
                    </Link>
                    {user.role?.slug === 'admin' && (
                      <Link href="/admin" onClick={() => setUserMenu(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20">
                        <Zap className="w-4 h-4" /> {t('navbar.adminPanel')}
                      </Link>
                    )}
                    <div className="border-t border-gray-100 dark:border-gray-800 mt-1">
                      <button onClick={handleLogout}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                        {t('navbar.logout')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2">
                  <Link href="/login" className="btn-primary btn-sm">{t('navbar.login')}</Link>
                  <Link href="/register" className="btn-ghost btn-sm">{t('navbar.register')}</Link>
                </div>
                <Link href="/login" className="btn-primary btn-sm sm:hidden">{t('navbar.login')}</Link>
              </div>
            )}
            
            {/* Language Switcher - Tablet/Mobile */}
            <div className="lg:hidden">
              <LanguageSwitcher />
            </div>
            <button className="md:hidden btn-icon btn-ghost ml-1" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 animate-slide-down">
          <div className="page-container py-3 space-y-3">
            <div className="flex items-center justify-between px-3">
              <span className="text-sm font-medium text-gray-500">{t('common.appearance')}</span>
              <ThemeToggle />
            </div>
            <form onSubmit={handleSearch} className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder={t('common.searchPlaceholder')} className="input pl-9" />
            </form>
            {NAV_LINKS.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)}
                className="block py-2 px-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}


