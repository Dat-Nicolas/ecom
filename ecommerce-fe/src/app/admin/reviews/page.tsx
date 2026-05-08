'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Star, Check, X, Clock } from 'lucide-react'
import { reviewsApi } from '@/lib/api'
import { Review } from '@/types'
import { formatDatetime } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function AdminReviewsPage() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['admin-reviews-pending'],
    queryFn: () => reviewsApi.pending({ limit: 20 }).then(r => r.data.data),
  })

  const moderateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => reviewsApi.moderate(id, status),
    onSuccess: (_, vars) => {
      toast.success(vars.status === 'approved' ? 'Đã duyệt đánh giá' : 'Đã từ chối')
      qc.invalidateQueries({ queryKey: ['admin-reviews-pending'] })
    },
  })

  const reviews: Review[] = data?.data ?? []

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-full text-sm font-medium">
          <Clock className="w-4 h-4" /> {reviews.length} đánh giá chờ duyệt
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="card p-4"><div className="skeleton h-20 w-full" /></div>)}</div>
      ) : reviews.length === 0 ? (
        <div className="card py-16 text-center">
          <Star className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-400">Không có đánh giá nào đang chờ duyệt</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {reviews.map((r) => (
            <div key={r.id} className="card p-4">
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-sm font-bold text-primary-700 flex-shrink-0">
                  {r.user?.fullName?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm text-gray-900">{r.user?.fullName}</p>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`} />
                      ))}
                    </div>
                    <span className="text-xs text-gray-400 ml-auto">{formatDatetime(r.createdAt)}</span>
                  </div>
                  <p className="text-xs text-primary-600 mb-2">{(r as any).product?.name}</p>
                  {r.comment && <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{r.comment}</p>}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => moderateMutation.mutate({ id: r.id, status: 'approved' })}
                    disabled={moderateMutation.isPending}
                    className="btn-sm bg-green-500 text-white hover:bg-green-600 gap-1">
                    <Check className="w-3.5 h-3.5" /> Duyệt
                  </button>
                  <button
                    onClick={() => moderateMutation.mutate({ id: r.id, status: 'rejected' })}
                    disabled={moderateMutation.isPending}
                    className="btn-danger btn-sm gap-1">
                    <X className="w-3.5 h-3.5" /> Từ chối
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
