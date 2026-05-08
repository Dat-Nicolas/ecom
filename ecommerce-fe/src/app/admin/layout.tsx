'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Package, ShoppingCart, Users, Tag, Warehouse,
  Star, Bell, Menu, X, Zap, LogOut, ChevronRight, BarChart3, Settings,
} from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '@/components/common/LanguageSwitcher'
import ThemeToggle from '@/components/common/ThemeToggle'

const getNav = (t: any) => [
  { label: t('admin.dashboard'), href: '/admin', icon: LayoutDashboard },
  { label: t('admin.products'), href: '/admin/products', icon: Package },
  { label: t('admin.orders'), href: '/admin/orders', icon: ShoppingCart },
  { label: t('admin.users'), href: '/admin/users', icon: Users },
  { label: t('admin.coupons'), href: '/admin/coupons', icon: Tag },
  { label: t('admin.inventory'), href: '/admin/inventory', icon: Warehouse },
  { label: t('admin.reviews'), href: '/admin/reviews', icon: Star },
  { label: t('admin.analytics'), href: '/admin/analytics', icon: BarChart3 },
]

function Sidebar({ mobile, onClose }: { mobile?: boolean; onClose?: () => void }) {
  const { t } = useTranslation()
  const pathname = usePathname()
  const { user, logout } = useAuthStore()
  const router = useRouter()

  const NAV = getNav(t)
  const handleLogout = () => { logout(); toast.success(t('admin.loggedOut')); router.push('/') }

  return (
    <div className={cn('flex flex-col h-full bg-gray-900 text-white', mobile ? 'w-72' : 'w-60')}>
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <Link href="/admin" className="flex items-center gap-2" onClick={onClose}>
          <div className="w-7 h-7 bg-primary-500 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-sm">TechShop <span className="text-primary-400">Admin</span></span>
        </Link>
        {mobile && <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {NAV.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || (href !== '/admin' && pathname.startsWith(href))
          return (
            <Link key={href} href={href} onClick={onClose}
              className={cn('sidebar-link', active ? 'bg-primary-600/20 text-primary-300 hover:bg-primary-600/20 hover:text-primary-300' : 'text-gray-400 hover:text-white hover:bg-gray-800')}>
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{label}</span>
              {active && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-gray-800">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-7 h-7 rounded-full bg-primary-600/30 flex items-center justify-center text-xs font-bold text-primary-300">
            {user?.fullName?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white truncate">{user?.fullName}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="w-full sidebar-link text-red-400 hover:text-red-300 hover:bg-red-900/20">
          <LogOut className="w-4 h-4" /> <span className="text-sm">{t('admin.logout')}</span>
        </button>
      </div>
    </div>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { t, i18n } = useTranslation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const NAV = getNav(t)
  const currentNav = NAV.find((n) => n.href === pathname || (n.href !== '/admin' && pathname.startsWith(n.href)))

  const dateLocale = i18n.language === 'vi' ? 'vi-VN' : i18n.language === 'en' ? 'en-US' : i18n.language === 'zh' ? 'zh-CN' : i18n.language === 'ja' ? 'ja-JP' : 'ko-KR'

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-shrink-0"><Sidebar /></div>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="relative z-10"><Sidebar mobile onClose={() => setMobileOpen(false)} /></div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center gap-3 flex-shrink-0">
          <button onClick={() => setMobileOpen(true)} className="md:hidden btn-ghost btn-icon">
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-semibold text-gray-900 dark:text-white text-sm">{currentNav?.label ?? 'Admin'}</h1>
            <p className="text-xs text-gray-400">{new Date().toLocaleDateString(dateLocale, { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <LanguageSwitcher />
              <div className="h-6 w-px bg-gray-200 dark:bg-gray-800 mx-2" />
            </div>
            <Link href="/" className="btn-secondary btn-sm hidden sm:flex">{t('common.viewShop')}</Link>
            <button className="btn-ghost btn-icon relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
