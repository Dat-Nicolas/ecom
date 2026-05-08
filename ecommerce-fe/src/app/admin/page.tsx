'use client'
import { useQuery } from '@tanstack/react-query'
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Tooltip, Legend, Filler,
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import { TrendingUp, TrendingDown, ShoppingCart, Users, Package, DollarSign, ArrowUpRight, Clock, CheckCircle, XCircle } from 'lucide-react'
import { ordersApi, usersApi, productsApi } from '@/lib/api'
import { formatPrice, formatDatetime, getOrderStatusLabel, getOrderStatusColor } from '@/lib/utils'
import { Order } from '@/types'
import Link from 'next/link'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend, Filler)

// Mock dashboard stats (in production, fetch from a stats endpoint)
const MOCK_STATS = {
  totalRevenue: 425600000,
  totalOrders: 1243,
  totalUsers: 3891,
  totalProducts: 284,
  revenueGrowth: 18.2,
  ordersGrowth: 12.5,
  usersGrowth: 8.7,
  revenueByMonth: [
    { month: 'T1', revenue: 28000000 }, { month: 'T2', revenue: 32000000 },
    { month: 'T3', revenue: 27000000 }, { month: 'T4', revenue: 38000000 },
    { month: 'T5', revenue: 45000000 }, { month: 'T6', revenue: 52000000 },
    { month: 'T7', revenue: 48000000 }, { month: 'T8', revenue: 61000000 },
    { month: 'T9', revenue: 55000000 }, { month: 'T10', revenue: 70000000 },
    { month: 'T11', revenue: 82000000 }, { month: 'T12', revenue: 95000000 },
  ],
  ordersByStatus: [
    { status: 'delivered', count: 654 }, { status: 'shipped', count: 213 },
    { status: 'processing', count: 124 }, { status: 'pending', count: 98 },
    { status: 'cancelled', count: 154 },
  ],
  topProducts: [
    { name: 'iPhone 15 Pro Max', sold: 142, revenue: 46800000 },
    { name: 'MacBook Pro M3', sold: 87, revenue: 69600000 },
    { name: 'Samsung Galaxy S24', sold: 201, revenue: 50250000 },
    { name: 'AirPods Pro 2', sold: 310, revenue: 18600000 },
    { name: 'iPad Pro M2', sold: 95, revenue: 28500000 },
  ],
}

function StatCard({ title, value, subtitle, icon: Icon, color, growth }: any) {
  const isPositive = growth >= 0
  return (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}><Icon className="w-5 h-5" /></div>
      <div className="flex-1 min-w-0">
        <p className="text-muted text-xs mb-1">{title}</p>
        <p className="text-xl font-bold text-gray-900 truncate">{value}</p>
        {growth !== undefined && (
          <div className={`flex items-center gap-1 text-xs mt-1 font-medium ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(growth)}% so với tháng trước
          </div>
        )}
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  )
}

const CHART_COLORS = { primary: '#3b82f6', green: '#22c55e', orange: '#f97316', red: '#ef4444', purple: '#a855f7' }
const chartDefaults = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }

export default function AdminDashboard() {
  const stats = MOCK_STATS

  const { data: ordersData } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => ordersApi.list({ limit: 8, sortBy: 'orderedAt', sortOrder: 'desc' }).then(r => r.data.data?.data ?? []),
  })
  const recentOrders: Order[] = ordersData ?? []

  const revenueChartData = {
    labels: stats.revenueByMonth.map(d => d.month),
    datasets: [{
      label: 'Doanh thu',
      data: stats.revenueByMonth.map(d => d.revenue / 1_000_000),
      borderColor: CHART_COLORS.primary,
      backgroundColor: `${CHART_COLORS.primary}15`,
      fill: true, tension: 0.4, pointRadius: 3, pointBackgroundColor: CHART_COLORS.primary,
    }],
  }

  const topProductsData = {
    labels: stats.topProducts.map(p => p.name.length > 20 ? p.name.slice(0, 20) + '…' : p.name),
    datasets: [{
      data: stats.topProducts.map(p => p.sold),
      backgroundColor: [CHART_COLORS.primary, CHART_COLORS.green, CHART_COLORS.orange, CHART_COLORS.purple, CHART_COLORS.red],
      borderWidth: 0, hoverOffset: 6,
    }],
  }

  const statusColors: Record<string, string> = {
    delivered: CHART_COLORS.green, shipped: CHART_COLORS.primary,
    processing: CHART_COLORS.orange, pending: '#f59e0b', cancelled: CHART_COLORS.red,
  }
  const orderStatusData = {
    labels: stats.ordersByStatus.map(s => getOrderStatusLabel(s.status)),
    datasets: [{
      data: stats.ordersByStatus.map(s => s.count),
      backgroundColor: stats.ordersByStatus.map(s => statusColors[s.status] ?? '#94a3b8'),
      borderWidth: 0, hoverOffset: 6,
    }],
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Doanh thu tháng" value={formatPrice(stats.totalRevenue)} icon={DollarSign} color="bg-blue-50 text-blue-600" growth={stats.revenueGrowth} />
        <StatCard title="Tổng đơn hàng" value={stats.totalOrders.toLocaleString()} icon={ShoppingCart} color="bg-green-50 text-green-600" growth={stats.ordersGrowth} />
        <StatCard title="Người dùng" value={stats.totalUsers.toLocaleString()} icon={Users} color="bg-purple-50 text-purple-600" growth={stats.usersGrowth} />
        <StatCard title="Sản phẩm" value={stats.totalProducts.toLocaleString()} icon={Package} color="bg-orange-50 text-orange-600" subtitle="Đang bán" />
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Revenue line chart */}
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900">Doanh thu theo tháng</h3>
              <p className="text-muted text-xs">Triệu đồng (VNĐ)</p>
            </div>
            <span className="badge-green text-xs">↑ 2024</span>
          </div>
          <div style={{ height: 220 }}>
            <Line data={revenueChartData} options={{ ...chartDefaults, scales: { y: { ticks: { callback: (v) => `${v}M`, font: { size: 11 } }, grid: { color: '#f3f4f6' } }, x: { ticks: { font: { size: 11 } }, grid: { display: false } } }, plugins: { ...chartDefaults.plugins, tooltip: { callbacks: { label: (c) => ` ${c.raw}M VNĐ` } } } }} />
          </div>
        </div>

        {/* Order status donut */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 mb-1">Trạng thái đơn hàng</h3>
          <p className="text-muted text-xs mb-4">Tổng {stats.totalOrders} đơn</p>
          <div style={{ height: 160 }} className="mx-auto max-w-[180px]">
            <Doughnut data={orderStatusData} options={{ ...chartDefaults, cutout: '65%', plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => ` ${c.label}: ${c.raw} đơn` } } } }} />
          </div>
          <div className="space-y-1.5 mt-4">
            {stats.ordersByStatus.map((s) => (
              <div key={s.status} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: statusColors[s.status] }} />
                  <span className="text-gray-600">{getOrderStatusLabel(s.status)}</span>
                </div>
                <span className="font-medium text-gray-900">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid lg:grid-cols-5 gap-4">
        {/* Recent orders */}
        <div className="lg:col-span-3 card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Đơn hàng mới nhất</h3>
            <Link href="/admin/orders" className="text-xs text-primary-600 hover:underline flex items-center gap-1">Xem tất cả <ArrowUpRight className="w-3 h-3" /></Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentOrders.length === 0
              ? Array.from({ length: 5 }).map((_, i) => <div key={i} className="px-5 py-3 flex gap-3 items-center"><div className="skeleton h-4 flex-1" /><div className="skeleton h-4 w-24" /></div>)
              : recentOrders.map((o) => (
                <div key={o.id} className="px-5 py-3 flex items-center gap-3 hover:bg-gray-50/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{o.orderCode}</p>
                    <p className="text-xs text-gray-400">{formatDatetime(o.orderedAt)}</p>
                  </div>
                  <span className={`${getOrderStatusColor(o.status)} text-xs`}>{getOrderStatusLabel(o.status)}</span>
                  <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">{formatPrice(Number(o.total))}</span>
                </div>
              ))
            }
          </div>
        </div>

        {/* Top products */}
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Top sản phẩm</h3>
            <Link href="/admin/products" className="text-xs text-primary-600 hover:underline">Xem thêm</Link>
          </div>
          <div className="space-y-3">
            {stats.topProducts.map((p, i) => {
              const maxSold = Math.max(...stats.topProducts.map(x => x.sold))
              return (
                <div key={p.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-700 truncate flex-1 pr-2">{i + 1}. {p.name}</span>
                    <span className="text-xs font-medium text-gray-900 whitespace-nowrap">{p.sold} bán</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-primary-500 transition-all duration-500" style={{ width: `${(p.sold / maxSold) * 100}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
