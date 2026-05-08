'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Tag, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { couponsApi } from '@/lib/api'
import { Coupon } from '@/types'
import { formatPrice, formatDatetime } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function AdminCouponsPage() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: () => couponsApi.list().then(r => r.data.data),
  })

  const createMutation = useMutation({
    mutationFn: (d: any) => couponsApi.create(d),
    onSuccess: () => { toast.success('Tạo mã thành công!'); qc.invalidateQueries({ queryKey: ['admin-coupons'] }); reset(); setShowForm(false) },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Lỗi tạo mã'),
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => couponsApi.update(id, { isActive }),
    onSuccess: () => { toast.success('Đã cập nhật'); qc.invalidateQueries({ queryKey: ['admin-coupons'] }) },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => couponsApi.remove(id),
    onSuccess: () => { toast.success('Đã vô hiệu hoá'); qc.invalidateQueries({ queryKey: ['admin-coupons'] }) },
  })

  const coupons: Coupon[] = Array.isArray(data) ? data : []

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">Quản lý mã giảm giá</p>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary btn-sm gap-1.5">
          <Plus className="w-4 h-4" /> Tạo mã mới
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="card p-5 border-primary-200 border animate-slide-down">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Tag className="w-4 h-4 text-primary-600" /> Tạo mã giảm giá mới</h3>
          <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Mã code <span className="text-red-500">*</span></label>
              <input {...register('code', { required: true })} placeholder="SUMMER2024" className="input text-sm uppercase" />
            </div>
            <div>
              <label className="label">Loại giảm giá</label>
              <select {...register('type')} className="input text-sm">
                <option value="percent">Phần trăm (%)</option>
                <option value="fixed">Số tiền cố định</option>
              </select>
            </div>
            <div>
              <label className="label">Giá trị <span className="text-red-500">*</span></label>
              <input {...register('value', { required: true, valueAsNumber: true })} type="number" placeholder="10" className="input text-sm" />
            </div>
            <div>
              <label className="label">Giảm tối đa (VNĐ)</label>
              <input {...register('maxDiscount', { valueAsNumber: true })} type="number" placeholder="500000" className="input text-sm" />
            </div>
            <div>
              <label className="label">Đơn tối thiểu (VNĐ)</label>
              <input {...register('minOrderValue', { valueAsNumber: true })} type="number" placeholder="1000000" className="input text-sm" />
            </div>
            <div>
              <label className="label">Giới hạn sử dụng</label>
              <input {...register('usageLimit', { valueAsNumber: true })} type="number" placeholder="100" className="input text-sm" />
            </div>
            <div>
              <label className="label">Ngày bắt đầu</label>
              <input {...register('startsAt')} type="datetime-local" className="input text-sm" />
            </div>
            <div>
              <label className="label">Ngày hết hạn</label>
              <input {...register('expiresAt')} type="datetime-local" className="input text-sm" />
            </div>
            <div className="flex items-end gap-2">
              <button type="submit" disabled={isSubmitting} className="btn-primary btn-sm flex-1">Tạo mã</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary btn-sm">Huỷ</button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-gray-100">
              <th className="table-header">Mã code</th>
              <th className="table-header">Loại / Giá trị</th>
              <th className="table-header">Đơn tối thiểu</th>
              <th className="table-header">Đã dùng</th>
              <th className="table-header">Hết hạn</th>
              <th className="table-header">Trạng thái</th>
              <th className="table-header">Thao tác</th>
            </tr></thead>
            <tbody>
              {isLoading ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="table-row"><td colSpan={7} className="table-cell"><div className="skeleton h-4 w-full" /></td></tr>
              )) : coupons.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">Chưa có mã giảm giá nào</td></tr>
              ) : coupons.map((c) => (
                <tr key={c.id} className="table-row">
                  <td className="table-cell font-mono font-bold text-primary-600">{c.code}</td>
                  <td className="table-cell text-sm">
                    {c.type === 'percent' ? `${c.value}%` : formatPrice(Number(c.value))}
                    {c.maxDiscount && <span className="text-xs text-gray-400 block">Tối đa {formatPrice(Number(c.maxDiscount))}</span>}
                  </td>
                  <td className="table-cell text-sm">{c.minOrderValue ? formatPrice(Number(c.minOrderValue)) : '—'}</td>
                  <td className="table-cell text-sm">
                    {c.usedCount}/{c.usageLimit ?? '∞'}
                    <div className="w-20 h-1 bg-gray-100 rounded-full mt-1 overflow-hidden">
                      <div className="h-full bg-primary-500 rounded-full" style={{ width: c.usageLimit ? `${(c.usedCount / c.usageLimit) * 100}%` : '0%' }} />
                    </div>
                  </td>
                  <td className="table-cell text-xs text-gray-500">{c.expiresAt ? formatDatetime(c.expiresAt) : '—'}</td>
                  <td className="table-cell">
                    <span className={c.isActive ? 'badge-green text-xs' : 'badge-gray text-xs'}>{c.isActive ? 'Hoạt động' : 'Tắt'}</span>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1">
                      <button onClick={() => toggleMutation.mutate({ id: c.id, isActive: !c.isActive })} className="btn-ghost btn-icon text-gray-500">
                        {c.isActive ? <ToggleRight className="w-4 h-4 text-green-500" /> : <ToggleLeft className="w-4 h-4" />}
                      </button>
                      <button onClick={() => { if (confirm('Vô hiệu hoá mã này?')) deleteMutation.mutate(c.id) }} className="btn-ghost btn-icon text-red-400">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
