"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Package, ChevronDown, ChevronUp, XCircle } from "lucide-react";
import { ordersApi } from "@/lib/api";
import { Order } from "@/types";
import {
  formatPrice,
  formatDatetime,
  getOrderStatusLabel,
  getOrderStatusColor,
} from "@/lib/utils";
import toast from "react-hot-toast";

export default function MyOrdersPage() {
  const qc = useQueryClient();
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["my-orders"],
    queryFn: () => ordersApi.myOrders({ limit: 20 }).then((r) => r.data.data),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => ordersApi.cancel(id),
    onSuccess: () => {
      toast.success("Đã huỷ đơn hàng");
      qc.invalidateQueries({
        queryKey: ["my-orders"],
      });
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message ?? "Không thể huỷ đơn"),
  });

  const orders: Order[] = data?.data ?? [];

  if (isLoading)
    return (
      <div className="py-8 page-container space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card p-5">
            <div className="skeleton h-20 w-full" />
          </div>
        ))}
      </div>
    );

  return (
    <div className="py-8">
      <div className="page-container max-w-3xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Package className="w-6 h-6 text-primary-600" /> Đơn hàng của tôi
        </h1>

        {orders.length === 0 ? (
          <div className="card py-20 text-center">
            <p className="text-5xl mb-4">📦</p>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Chưa có đơn hàng
            </h2>
            <p className="text-gray-500 mb-6">
              Hãy mua sắm và quay lại đây nhé!
            </p>
            <Link href="/products" className="btn-primary">
              Mua sắm ngay
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order.id} className="card overflow-hidden">
                {/* Header */}
                <div
                  className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
                  onClick={() =>
                    setExpanded(expanded === order.id ? null : order.id)
                  }
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-900 text-sm">
                        {order.orderCode}
                      </span>
                      <span
                        className={`${getOrderStatusColor(order.status)} text-xs`}
                      >
                        {getOrderStatusLabel(order.status)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">
                      {formatDatetime(order.orderedAt)} ·{" "}
                      {order.items?.length ?? 0} sản phẩm
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary-600">
                      {formatPrice(Number(order.total))}
                    </p>
                  </div>
                  {expanded === order.id ? (
                    <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  )}
                </div>

                {/* Expanded */}
                {expanded === order.id && (
                  <div className="border-t border-gray-100 px-4 pb-4 pt-3 space-y-3 animate-slide-down">
                    {/* Items */}
                    {order.items?.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                      >
                        <div className="w-12 h-12 rounded-lg bg-gray-200 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {item.productName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.variantName} · x{item.quantity}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">
                          {formatPrice(Number(item.lineTotal))}
                        </p>
                      </div>
                    ))}

                    {/* Summary */}
                    <div className="text-sm space-y-1 pt-2 border-t border-gray-100">
                      <div className="flex justify-between text-gray-500">
                        <span>Tạm tính</span>
                        <span>{formatPrice(Number(order.subtotal))}</span>
                      </div>
                      {Number(order.discountAmt) > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Giảm giá</span>
                          <span>-{formatPrice(Number(order.discountAmt))}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-gray-500">
                        <span>Phí ship</span>
                        <span>{formatPrice(Number(order.shippingFee))}</span>
                      </div>
                      <div className="flex justify-between font-bold pt-1 border-t border-gray-100">
                        <span>Tổng cộng</span>
                        <span className="text-primary-600">
                          {formatPrice(Number(order.total))}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    {order.status === "pending" && (
                      <button
                        onClick={() => {
                          if (confirm("Xác nhận huỷ đơn hàng này?"))
                            cancelMutation.mutate(order.id);
                        }}
                        className="btn-danger btn-sm gap-1.5 w-full"
                      >
                        <XCircle className="w-4 h-4" /> Huỷ đơn hàng
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
