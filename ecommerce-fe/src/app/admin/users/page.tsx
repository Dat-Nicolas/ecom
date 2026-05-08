'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, Users, Shield, ShieldOff } from 'lucide-react'
import { usersApi } from '@/lib/api'
import { User } from '@/types'
import { formatDatetime } from '@/lib/utils'

const STATUS_COLORS: Record<string, string> = { active: 'badge-green', inactive: 'badge-yellow', banned: 'badge-red' }
const STATUS_LABELS: Record<string, string> = { active: 'Hoạt động', inactive: 'Không hoạt động', banned: 'Bị cấm' }

export default function AdminUsersPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, search],
    queryFn: () => usersApi.list({ page, limit: 15 }).then(r => r.data.data),
  })

  const users: User[] = data?.data ?? []
  const meta = data?.meta

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm người dùng..." className="input pl-9 text-sm" />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-gray-100">
              <th className="table-header">Người dùng</th>
              <th className="table-header">Vai trò</th>
              <th className="table-header">SĐT</th>
              <th className="table-header">Trạng thái</th>
              <th className="table-header">Ngày tạo</th>
              <th className="table-header">Thao tác</th>
            </tr></thead>
            <tbody>
              {isLoading ? Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="table-row"><td colSpan={6} className="table-cell"><div className="skeleton h-4 w-full" /></td></tr>
              )) : users.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-16">
                  <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">Không có người dùng nào</p>
                </td></tr>
              ) : users.map((u) => (
                <tr key={u.id} className="table-row">
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-sm font-bold text-primary-700 flex-shrink-0">
                        {u.fullName?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-xs">{u.fullName}</p>
                        <p className="text-gray-400 text-xs">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className={u.role?.slug === 'admin' ? 'badge-blue text-xs' : 'badge-gray text-xs'}>
                      {u.role?.name ?? '—'}
                    </span>
                  </td>
                  <td className="table-cell text-xs text-gray-500">{u.phone ?? '—'}</td>
                  <td className="table-cell">
                    <span className={`${STATUS_COLORS[u.status]} text-xs`}>{STATUS_LABELS[u.status]}</span>
                  </td>
                  <td className="table-cell text-xs text-gray-400">{formatDatetime(u.createdAt)}</td>
                  <td className="table-cell">
                    <button className="btn-ghost btn-sm gap-1 text-xs">
                      <Shield className="w-3.5 h-3.5" /> Chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">Tổng {meta.total} người dùng</p>
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
