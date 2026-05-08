'use client'
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  PointElement, LineElement, ArcElement, Tooltip, Legend, Filler,
} from 'chart.js'
import { Bar, Line, Doughnut } from 'react-chartjs-2'
import { TrendingUp, Users, ShoppingCart, DollarSign, Package } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler)

const MONTHS = ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12']
const REVENUE = [28,32,27,38,45,52,48,61,55,70,82,95]
const ORDERS  = [180,210,165,240,310,350,290,410,380,450,520,620]
const USERS   = [40,55,38,70,90,110,85,130,115,150,180,210]

const chartBase = { responsive: true, maintainAspectRatio: false }
const gridColor = '#f3f4f6'
const tickFont  = { size: 11, family: 'Inter' }

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Doanh thu năm', value: formatPrice(633_000_000), icon: DollarSign, color: 'bg-blue-50 text-blue-600', sub: '+24% YoY' },
          { label: 'Tổng đơn hàng', value: '4,163', icon: ShoppingCart, color: 'bg-green-50 text-green-600', sub: '+18% YoY' },
          { label: 'Người dùng mới', value: '1,263', icon: Users, color: 'bg-purple-50 text-purple-600', sub: '+31% YoY' },
          { label: 'Sản phẩm bán chạy', value: '284', icon: Package, color: 'bg-orange-50 text-orange-600', sub: 'active SKUs' },
        ].map(({ label, value, icon: Icon, color, sub }) => (
          <div key={label} className="card p-5 flex items-start gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">{label}</p>
              <p className="text-xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-green-600 font-medium mt-0.5 flex items-center gap-1"><TrendingUp className="w-3 h-3" />{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue bar chart */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-900">Doanh thu theo tháng</h3>
            <p className="text-xs text-gray-400">Đơn vị: Triệu VNĐ · Năm 2024</p>
          </div>
          <span className="badge-blue text-xs">Năm 2024</span>
        </div>
        <div style={{ height: 260 }}>
          <Bar
            data={{
              labels: MONTHS,
              datasets: [{
                label: 'Doanh thu (triệu)',
                data: REVENUE,
                backgroundColor: MONTHS.map((_, i) => i === 11 ? '#2563eb' : '#93c5fd'),
                borderRadius: 6,
                borderSkipped: false,
              }],
            }}
            options={{
              ...chartBase,
              plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => ` ${c.raw}M VNĐ` } } },
              scales: {
                y: { ticks: { callback: (v) => `${v}M`, font: tickFont }, grid: { color: gridColor } },
                x: { ticks: { font: tickFont }, grid: { display: false } },
              },
            }}
          />
        </div>
      </div>

      {/* Two charts */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Orders trend line */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 mb-1">Số đơn hàng</h3>
          <p className="text-xs text-gray-400 mb-4">Theo tháng</p>
          <div style={{ height: 200 }}>
            <Line
              data={{
                labels: MONTHS,
                datasets: [{
                  label: 'Đơn hàng',
                  data: ORDERS,
                  borderColor: '#22c55e',
                  backgroundColor: '#22c55e18',
                  fill: true, tension: 0.4, pointRadius: 3, pointBackgroundColor: '#22c55e',
                }],
              }}
              options={{
                ...chartBase,
                plugins: { legend: { display: false } },
                scales: {
                  y: { ticks: { font: tickFont }, grid: { color: gridColor } },
                  x: { ticks: { font: tickFont }, grid: { display: false } },
                },
              }}
            />
          </div>
        </div>

        {/* New users line */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 mb-1">Người dùng mới</h3>
          <p className="text-xs text-gray-400 mb-4">Đăng ký theo tháng</p>
          <div style={{ height: 200 }}>
            <Line
              data={{
                labels: MONTHS,
                datasets: [{
                  label: 'Người dùng',
                  data: USERS,
                  borderColor: '#a855f7',
                  backgroundColor: '#a855f718',
                  fill: true, tension: 0.4, pointRadius: 3, pointBackgroundColor: '#a855f7',
                }],
              }}
              options={{
                ...chartBase,
                plugins: { legend: { display: false } },
                scales: {
                  y: { ticks: { font: tickFont }, grid: { color: gridColor } },
                  x: { ticks: { font: tickFont }, grid: { display: false } },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Top categories donut */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Doanh thu theo danh mục</h3>
          <div style={{ height: 180 }} className="mx-auto max-w-[180px]">
            <Doughnut
              data={{
                labels: ['Điện thoại', 'Laptop', 'Tai nghe', 'Phụ kiện', 'Khác'],
                datasets: [{
                  data: [42, 28, 14, 10, 6],
                  backgroundColor: ['#3b82f6','#22c55e','#f97316','#a855f7','#94a3b8'],
                  borderWidth: 0, hoverOffset: 6,
                }],
              }}
              options={{ ...chartBase, cutout: '62%', plugins: { legend: { display: false } } }}
            />
          </div>
          <div className="space-y-1.5 mt-4">
            {[['Điện thoại','#3b82f6','42%'],['Laptop','#22c55e','28%'],['Tai nghe','#f97316','14%'],['Phụ kiện','#a855f7','10%'],['Khác','#94a3b8','6%']].map(([l,c,v]) => (
              <div key={l as string} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: c as string }} />
                  <span className="text-gray-600">{l as string}</span>
                </div>
                <span className="font-medium text-gray-900">{v as string}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment methods donut */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Phương thức thanh toán</h3>
          <div style={{ height: 180 }} className="mx-auto max-w-[180px]">
            <Doughnut
              data={{
                labels: ['COD', 'VNPay', 'MoMo', 'ZaloPay', 'Chuyển khoản'],
                datasets: [{
                  data: [38, 27, 18, 10, 7],
                  backgroundColor: ['#f59e0b','#ef4444','#ec4899','#06b6d4','#6366f1'],
                  borderWidth: 0, hoverOffset: 6,
                }],
              }}
              options={{ ...chartBase, cutout: '62%', plugins: { legend: { display: false } } }}
            />
          </div>
          <div className="space-y-1.5 mt-4">
            {[['COD','#f59e0b','38%'],['VNPay','#ef4444','27%'],['MoMo','#ec4899','18%'],['ZaloPay','#06b6d4','10%'],['Chuyển khoản','#6366f1','7%']].map(([l,c,v]) => (
              <div key={l as string} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: c as string }} />
                  <span className="text-gray-600">{l as string}</span>
                </div>
                <span className="font-medium text-gray-900">{v as string}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick stats */}
        <div className="card p-5 space-y-4">
          <h3 className="font-semibold text-gray-900">Chỉ số nhanh</h3>
          {[
            { label: 'Tỷ lệ chuyển đổi', value: '3.2%', color: 'text-green-600', bar: 32 },
            { label: 'Giá trị đơn TB', value: formatPrice(1_850_000), color: 'text-blue-600', bar: 62 },
            { label: 'Tỷ lệ huỷ đơn', value: '6.4%', color: 'text-red-600', bar: 6 },
            { label: 'Khách quay lại', value: '41%', color: 'text-purple-600', bar: 41 },
            { label: 'NPS Score', value: '72/100', color: 'text-orange-600', bar: 72 },
          ].map(({ label, value, color, bar }) => (
            <div key={label}>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-gray-500">{label}</span>
                <span className={`text-xs font-bold ${color}`}>{value}</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-current rounded-full transition-all" style={{ width: `${bar}%`, color: color.replace('text-', '') }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
