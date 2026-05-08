'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Edit, Trash2, Eye, Package } from 'lucide-react'
import { productsApi } from '@/lib/api'
import { Product } from '@/types'
import { formatPrice, formatDatetime } from '@/lib/utils'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const STATUS_COLORS: Record<string, string> = { active: 'badge-green', draft: 'badge-yellow', archived: 'badge-gray' }
const STATUS_LABELS: Record<string, string> = { active: 'Đang bán', draft: 'Nháp', archived: 'Đã ẩn' }

export default function AdminProductsPage() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', page, search, status],
    queryFn: () => productsApi.list({ page, limit: 15, search: search || undefined, status: status || undefined }).then(r => r.data.data),
  })

  const archiveMutation = useMutation({
    mutationFn: (id: string) => productsApi.remove(id),
    onSuccess: () => { toast.success('Đã ẩn sản phẩm'); qc.invalidateQueries({ queryKey: ['admin-products'] }) },
  })

  const products: Product[] = data?.data ?? []
  const meta = data?.meta

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header actions */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm sản phẩm..." className="input pl-9 text-sm" />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="input text-sm w-36">
          <option value="">Tất cả</option>
          <option value="active">Đang bán</option>
          <option value="draft">Nháp</option>
          <option value="archived">Đã ẩn</option>
        </select>
        <button className="btn-primary btn-sm gap-1.5 ml-auto"><Plus className="w-4 h-4" />Thêm sản phẩm</button>
      </div>

      {/* Stats mini */}
      <div className="grid grid-cols-3 gap-3">
        {[{ label: 'Tổng sản phẩm', value: meta?.total ?? 0, color: 'text-blue-600' },
          { label: 'Đang bán', value: '—', color: 'text-green-600' },
          { label: 'Trang hiện tại', value: `${page}/${meta?.totalPages ?? 1}`, color: 'text-gray-600' }].map((s) => (
          <div key={s.label} className="card p-3 text-center">
            <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-gray-100">
              <th className="table-header">Sản phẩm</th>
              <th className="table-header">SKU</th>
              <th className="table-header">Giá</th>
              <th className="table-header">Trạng thái</th>
              <th className="table-header">Đã bán</th>
              <th className="table-header">Ngày tạo</th>
              <th className="table-header">Thao tác</th>
            </tr></thead>
            <tbody>
              {isLoading ? Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="table-row">
                  <td className="table-cell" colSpan={7}><div className="skeleton h-4 w-full" /></td>
                </tr>
              )) : products.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-16">
                  <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">Không có sản phẩm nào</p>
                </td></tr>
              ) : products.map((p) => (
                <tr key={p.id} className="table-row">
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <img src={p.images?.[0]?.url ?? `https://picsum.photos/seed/${p.id}/40/40`} alt={p.name} className="w-9 h-9 rounded-lg object-cover bg-gray-100 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 text-xs truncate max-w-[160px]">{p.name}</p>
                        <p className="text-gray-400 text-xs">{p.brand?.name ?? p.category?.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell font-mono text-xs text-gray-500">{p.sku ?? '—'}</td>
                  <td className="table-cell">
                    <p className="font-semibold text-primary-600 text-xs">{formatPrice(Number(p.salePrice ?? p.price))}</p>
                    {p.salePrice && <p className="text-gray-400 text-xs line-through">{formatPrice(Number(p.price))}</p>}
                  </td>
                  <td className="table-cell"><span className={`${STATUS_COLORS[p.status]} text-xs`}>{STATUS_LABELS[p.status]}</span></td>
                  <td className="table-cell text-gray-600 text-xs">{p.soldCount}</td>
                  <td className="table-cell text-gray-400 text-xs">{formatDatetime(p.createdAt)}</td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1">
                      <button className="btn-ghost btn-icon text-gray-500"><Edit className="w-3.5 h-3.5" /></button>
                      <button onClick={() => { if (confirm('Ẩn sản phẩm này?')) archiveMutation.mutate(p.id) }}
                        className="btn-ghost btn-icon text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">Tổng {meta.total} sản phẩm</p>
            <div className="flex gap-1">
              <button disabled={!meta.hasPrevPage} onClick={() => setPage(p => p - 1)} className="btn-secondary btn-sm disabled:opacity-40">←</button>
              <span className="px-3 py-1.5 text-sm">{page}/{meta.totalPages}</span>
              <button disabled={!meta.hasNextPage} onClick={() => setPage(p => p + 1)} className="btn-secondary btn-sm disabled:opacity-40">→</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
