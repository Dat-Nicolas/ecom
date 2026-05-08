'use client'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { User, Mail, Phone, Save, MapPin, Plus, Trash2 } from 'lucide-react'
import { usersApi } from '@/lib/api'
import { useAuthStore } from '@/store/auth.store'
import toast from 'react-hot-toast'

export default function AccountPage() {
  const { user, setUser } = useAuthStore()
  const qc = useQueryClient()

  const { data: profileData } = useQuery({
    queryKey: ['my-profile'],
    queryFn: () => usersApi.me().then(r => r.data.data),
  })

  const { data: addrData } = useQuery({
    queryKey: ['my-addresses'],
    queryFn: () => usersApi.addresses().then(r => r.data.data),
  })

  const { register, handleSubmit, reset } = useForm()
  const { register: regAddr, handleSubmit: submitAddr, reset: resetAddr } = useForm()

  useEffect(() => { if (profileData) reset({ fullName: profileData.fullName, phone: profileData.phone }) }, [profileData])

  const updateMutation = useMutation({
    mutationFn: (d: any) => usersApi.update(d),
    onSuccess: (res) => { setUser(res.data.data); toast.success('Cập nhật thành công!') },
  })

  const addAddrMutation = useMutation({
    mutationFn: (d: any) => usersApi.addAddress(d),
    onSuccess: () => { 
  toast.success('Đã thêm địa chỉ'); 
  qc.invalidateQueries({ queryKey: ['my-addresses'] }); 
  resetAddr() 
},
  })

  const removeAddrMutation = useMutation({
    mutationFn: (id: string) => usersApi.removeAddress(id),
    onSuccess: () => { toast.success('Đã xoá địa chỉ'); qc.invalidateQueries({ queryKey: ['my-addresses'] }) },
  })

  const addresses = Array.isArray(addrData) ? addrData : []

  return (
    <div className="py-8">
      <div className="page-container max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><User className="w-6 h-6 text-primary-600" /> Tài khoản của tôi</h1>

        {/* Profile */}
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Thông tin cá nhân</h2>

          {/* Avatar */}
          <div className="flex items-center gap-4 mb-5 p-4 bg-gray-50 rounded-xl">
            <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center text-2xl font-bold text-primary-700">
              {user?.fullName?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{user?.fullName}</p>
              <p className="text-sm text-gray-500">{user?.role?.name}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit((d) => updateMutation.mutate(d))} className="space-y-4">
            <div>
              <label className="label">Họ và tên</label>
              <div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input {...register('fullName')} className="input pl-9" /></div>
            </div>
            <div>
              <label className="label">Email</label>
              <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input defaultValue={user?.email} disabled className="input pl-9 bg-gray-50 text-gray-400" /></div>
              <p className="text-xs text-gray-400 mt-1">Email không thể thay đổi</p>
            </div>
            <div>
              <label className="label">Số điện thoại</label>
              <div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input {...register('phone')} className="input pl-9" placeholder="0901234567" /></div>
            </div>
            <button type="submit" disabled={updateMutation.isPending} className="btn-primary gap-2">
              <Save className="w-4 h-4" /> Lưu thay đổi
            </button>
          </form>
        </div>

        {/* Addresses */}
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><MapPin className="w-4 h-4 text-primary-600" /> Địa chỉ giao hàng</h2>

          <div className="space-y-3 mb-4">
            {addresses.length === 0 ? <p className="text-sm text-gray-400">Chưa có địa chỉ nào</p> : addresses.map((addr: any) => (
              <div key={addr.id} className="flex items-start justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm">{addr.recipientName}</p>
                    <span className="text-xs text-gray-400">· {addr.phone}</span>
                    {addr.isDefault && <span className="badge-blue text-xs">Mặc định</span>}
                  </div>
                  <p className="text-xs text-gray-500">{addr.addressLine}, {addr.ward}, {addr.district}, {addr.province}</p>
                </div>
                <button onClick={() => removeAddrMutation.mutate(addr.id)} className="btn-ghost btn-icon text-red-400 hover:text-red-600 flex-shrink-0 ml-2"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>

          {/* Add address form */}
          <details className="group">
            <summary className="btn-secondary btn-sm gap-1.5 cursor-pointer w-fit list-none"><Plus className="w-4 h-4" /> Thêm địa chỉ mới</summary>
            <form onSubmit={submitAddr((d) => addAddrMutation.mutate(d))} className="mt-4 grid grid-cols-2 gap-3">
              <div><label className="label text-xs">Tên người nhận</label><input {...regAddr('recipientName', { required: true })} className="input text-sm" /></div>
              <div><label className="label text-xs">Số điện thoại</label><input {...regAddr('phone', { required: true })} className="input text-sm" /></div>
              <div><label className="label text-xs">Tỉnh/Thành phố</label><input {...regAddr('province', { required: true })} className="input text-sm" /></div>
              <div><label className="label text-xs">Quận/Huyện</label><input {...regAddr('district', { required: true })} className="input text-sm" /></div>
              <div><label className="label text-xs">Phường/Xã</label><input {...regAddr('ward')} className="input text-sm" /></div>
              <div><label className="label text-xs">Địa chỉ chi tiết</label><input {...regAddr('addressLine', { required: true })} className="input text-sm" /></div>
              <div className="col-span-2 flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" {...regAddr('isDefault')} className="rounded" /> Đặt làm địa chỉ mặc định</label>
                <button type="submit" className="btn-primary btn-sm ml-auto">Lưu địa chỉ</button>
              </div>
            </form>
          </details>
        </div>
      </div>
    </div>
  )
}
