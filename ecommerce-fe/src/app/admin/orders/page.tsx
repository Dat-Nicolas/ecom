'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Filter, Eye, ChevronDown } from 'lucide-react'
import { ordersApi } from '@/lib/api'
import { Order } from '@/types'
import { formatPrice, formatDatetime, getOrderStatusLabel, getOrderStatusColor } from '@/lib/utils'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const STATUSES = ['', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']
const NEXT_STATUS: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped'],
  shipped: ['delivered'],
}

export default function AdminOrdersPage() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Order | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', page, status, search],
    queryFn: () => ordersApi.list({ page, limit: 15, status: status || undefined, orderCode: search || undefined }).then(r => r.data.data),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, s }: { id: string; s: string }) => ordersApi.updateStatus(id, { status: s }),
    onSuccess: () => { toast.success('Cập nhật trạng thái thành công'); qc.invalidateQueries({ queryKey: ['admin-orders'] }); setSelected(null) },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Lỗi cập nhật'),
  })

  const orders: Order[] = data?.data ?? []
  const meta = data?.meta

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm mã đơn hàng..." className="input pl-9 text-sm" />
        </div>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }} className="input text-sm w-44">
          <option value="">Tất cả trạng thái</option>
          {STATUSES.filter(Boolean).map(s => <option key={s} value={s}>{getOrderStatusLabel(s)}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-gray-100">
              <th className="table-header">Mã đơn</th>
              <th className="table-header">Khách hàng</th>
              <th className="table-header">Tổng tiền</th>
              <th className="table-header">Trạng thái</th>
              <th className="table-header">Ngày đặt</th>
              <th className="table-header">Thao tác</th>
            </tr></thead>
            <tbody>
              {isLoading ? Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="table-row"><td colSpan={6} className="table-cell"><div className="skeleton h-4 w-full" /></td></tr>
              )) : orders.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">Không có đơn hàng nào</td></tr>
              ) : orders.map((o) => (
                <tr key={o.id} className="table-row">
                  <td className="table-cell font-medium text-primary-600">{o.orderCode}</td>
                  <td className="table-cell">
                    <div>
                      <p className="font-medium text-gray-900 text-xs">{(o as any).user?.fullName ?? '—'}</p>
                      <p className="text-gray-400 text-xs">{(o as any).user?.email}</p>
                    </div>
                  </td>
                  <td className="table-cell font-semibold">{formatPrice(Number(o.total))}</td>
                  <td className="table-cell"><span className={`${getOrderStatusColor(o.status)} text-xs`}>{getOrderStatusLabel(o.status)}</span></td>
                  <td className="table-cell text-gray-400 text-xs">{formatDatetime(o.orderedAt)}</td>
                  <td className="table-cell">
                    <button onClick={() => setSelected(o)} className="btn-ghost btn-sm gap-1.5"><Eye className="w-3.5 h-3.5" /> Chi tiết</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">Tổng {meta.total} đơn hàng</p>
            <div className="flex gap-1">
              <button disabled={!meta.hasPrevPage} onClick={() => setPage(p => p - 1)} className="btn-secondary btn-sm disabled:opacity-40">←</button>
              <span className="px-3 py-1.5 text-sm text-gray-600">{page}/{meta.totalPages}</span>
              <button disabled={!meta.hasNextPage} onClick={() => setPage(p => p + 1)} className="btn-secondary btn-sm disabled:opacity-40">→</button>
            </div>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <h2 className="font-bold text-gray-900">Chi tiết đơn: {selected.orderCode}</h2>
                <span className={`${getOrderStatusColor(selected.status)} text-xs mt-1`}>{getOrderStatusLabel(selected.status)}</span>
              </div>
              <button onClick={() => setSelected(null)} className="btn-ghost btn-icon">✕</button>
            </div>
            <div className="p-5 space-y-4">
              {/* Items */}
              <div>
                <h3 className="font-semibold text-sm text-gray-700 mb-2">Sản phẩm</h3>
                <div className="space-y-2">
                  {selected.items?.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm">
                      <div>
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-xs text-gray-400">{item.variantName} · x{item.quantity}</p>
                      </div>
                      <p className="font-semibold">{formatPrice(Number(item.lineTotal))}</p>
                    </div>
                  ))}
                </div>
              </div>
              {/* Summary */}
              <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-2">
                <div className="flex justify-between text-gray-600"><span>Tạm tính</span><span>{formatPrice(Number(selected.subtotal))}</span></div>
                <div className="flex justify-between text-gray-600"><span>Giảm giá</span><span>-{formatPrice(Number(selected.discountAmt))}</span></div>
                <div className="flex justify-between text-gray-600"><span>Phí ship</span><span>{formatPrice(Number(selected.shippingFee))}</span></div>
                <div className="flex justify-between font-bold text-base pt-2 border-t"><span>Tổng cộng</span><span className="text-primary-600">{formatPrice(Number(selected.total))}</span></div>
              </div>
              {/* Actions */}
              {NEXT_STATUS[selected.status]?.length > 0 && (
                <div>
                  <p className="font-semibold text-sm text-gray-700 mb-2">Cập nhật trạng thái</p>
                  <div className="flex gap-2 flex-wrap">
                    {NEXT_STATUS[selected.status].map((ns) => (
                      <button key={ns} onClick={() => updateMutation.mutate({ id: selected.id, s: ns })}
                        disabled={updateMutation.isPending}
                        className={ns === 'cancelled' ? 'btn-danger btn-sm' : 'btn-primary btn-sm'}>
                        → {getOrderStatusLabel(ns)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
