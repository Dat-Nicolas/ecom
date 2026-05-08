'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Warehouse, AlertTriangle, Plus, TrendingDown, TrendingUp } from 'lucide-react'
import { inventoryApi } from '@/lib/api'
import toast from 'react-hot-toast'

export default function AdminInventoryPage() {
  const qc = useQueryClient()
  const [showAdjust, setShowAdjust] = useState(false)
  const { register, handleSubmit, reset } = useForm()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-inventory'],
    queryFn: () => inventoryApi.list({ limit: 20 }).then(r => r.data.data),
  })

  const { data: warehousesData } = useQuery({
    queryKey: ['warehouses'],
    queryFn: () => inventoryApi.warehouses().then(r => r.data.data),
  })

  const adjustMutation = useMutation({
    mutationFn: (d: any) => inventoryApi.adjust(d),
    onSuccess: () => { toast.success('Cập nhật tồn kho thành công'); qc.invalidateQueries({ queryKey: ['admin-inventory'] }); reset(); setShowAdjust(false) },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Lỗi cập nhật'),
  })

  const items = data?.data ?? []
  const warehouses = Array.isArray(warehousesData) ? warehousesData : []
  const lowStock = items.filter((i: any) => i.qtyAvailable <= i.reorderPoint)

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Alerts */}
      {lowStock.length > 0 && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{lowStock.length} sản phẩm dưới mức tồn kho tối thiểu cần nhập thêm!</p>
        </div>
      )}

      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">{items.length} bản ghi tồn kho</p>
        <button onClick={() => setShowAdjust(!showAdjust)} className="btn-primary btn-sm gap-1.5">
          <Plus className="w-4 h-4" /> Điều chỉnh kho
        </button>
      </div>

      {/* Adjust form */}
      {showAdjust && (
        <div className="card p-5 border-primary-200 border animate-slide-down">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Warehouse className="w-4 h-4 text-primary-600" /> Điều chỉnh tồn kho</h3>
          <form onSubmit={handleSubmit((d) => adjustMutation.mutate({ ...d, warehouseId: Number(d.warehouseId), qtyChange: Number(d.qtyChange) }))}
            className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Variant ID</label>
              <input {...register('variantId', { required: true })} placeholder="uuid..." className="input text-sm" />
            </div>
            <div>
              <label className="label">Kho hàng</label>
              <select {...register('warehouseId', { required: true })} className="input text-sm">
                <option value="">Chọn kho</option>
                {warehouses.map((w: any) => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Số lượng thay đổi</label>
              <input {...register('qtyChange', { required: true, valueAsNumber: true })} type="number" placeholder="+100 hoặc -10" className="input text-sm" />
            </div>
            <div>
              <label className="label">Hành động</label>
              <select {...register('action', { required: true })} className="input text-sm">
                <option value="import">Nhập kho</option>
                <option value="export">Xuất kho</option>
                <option value="adjustment">Điều chỉnh</option>
              </select>
            </div>
            <div>
              <label className="label">Ghi chú</label>
              <input {...register('note')} placeholder="Lý do điều chỉnh..." className="input text-sm" />
            </div>
            <div className="flex items-end gap-2">
              <button type="submit" className="btn-primary btn-sm flex-1">Xác nhận</button>
              <button type="button" onClick={() => setShowAdjust(false)} className="btn-secondary btn-sm">Huỷ</button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-gray-100">
              <th className="table-header">Sản phẩm</th>
              <th className="table-header">SKU</th>
              <th className="table-header">Kho</th>
              <th className="table-header">Có sẵn</th>
              <th className="table-header">Đã giữ</th>
              <th className="table-header">Tối thiểu</th>
              <th className="table-header">Tình trạng</th>
            </tr></thead>
            <tbody>
              {isLoading ? Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="table-row"><td colSpan={7} className="table-cell"><div className="skeleton h-4 w-full" /></td></tr>
              )) : items.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">Không có dữ liệu tồn kho</td></tr>
              ) : items.map((item: any) => {
                const isLow = item.qtyAvailable <= item.reorderPoint
                return (
                  <tr key={item.id} className={`table-row ${isLow ? 'bg-red-50/50' : ''}`}>
                    <td className="table-cell">
                      <p className="text-xs font-medium text-gray-900 max-w-[160px] truncate">{item.variant?.product?.name}</p>
                      <p className="text-xs text-gray-400">{item.variant?.name}</p>
                    </td>
                    <td className="table-cell font-mono text-xs text-gray-500">{item.variant?.sku}</td>
                    <td className="table-cell text-xs text-gray-600">{item.warehouse?.name}</td>
                    <td className="table-cell">
                      <span className={`font-bold text-sm ${isLow ? 'text-red-600' : 'text-gray-900'}`}>{item.qtyAvailable}</span>
                    </td>
                    <td className="table-cell text-sm text-gray-500">{item.qtyReserved}</td>
                    <td className="table-cell text-sm text-gray-500">{item.reorderPoint}</td>
                    <td className="table-cell">
                      {isLow
                        ? <span className="badge-red text-xs flex items-center gap-1 w-fit"><TrendingDown className="w-3 h-3" />Thấp</span>
                        : <span className="badge-green text-xs flex items-center gap-1 w-fit"><TrendingUp className="w-3 h-3" />Đủ hàng</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
