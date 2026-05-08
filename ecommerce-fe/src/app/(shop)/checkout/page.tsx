"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { CreditCard, CheckCircle, MapPin, Tag } from "lucide-react";
import { useCartStore } from "@/store/cart.store";
import { useAuthStore } from "@/store/auth.store";
import { usersApi, ordersApi, couponsApi } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import toast from "react-hot-toast";

const PAYMENT_METHODS = [
  { id: "cod", label: "Thanh toán khi nhận hàng (COD)", icon: "💵" },
  { id: "vnpay", label: "VNPay", icon: "🏧" },
  { id: "momo", label: "Ví MoMo", icon: "💜" },
  { id: "bank_transfer", label: "Chuyển khoản ngân hàng", icon: "🏦" },
];

export default function CheckoutPage() {
  const router = useRouter();

  const { items, totalPrice, clearCart } = useCartStore();
  const { user } = useAuthStore();

  const [mounted, setMounted] = useState(false);
  const [selectedAddr, setSelectedAddr] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [note, setNote] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [placing, setPlacing] = useState(false);

  // ✅ FIX SSR: chỉ render khi client mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // ✅ Redirect nếu chưa login
  useEffect(() => {
    if (!mounted) return;
    if (!user) {
      router.push("/login?redirect=/checkout");
    }
  }, [user, mounted, router]);

  // ✅ Redirect nếu cart rỗng
  useEffect(() => {
    if (!mounted) return;
    if (items.length === 0) {
      router.push("/cart");
    }
  }, [items, mounted, router]);

  // Fetch addresses
  const { data: addrData } = useQuery({
    queryKey: ["my-addresses"],
    queryFn: () => usersApi.addresses().then((r) => r.data.data),
    enabled: mounted && !!user, // tránh SSR call
  });

  useEffect(() => {
    if (addrData) {
      const def = addrData.find((a: any) => a.isDefault);
      if (def) setSelectedAddr(def.id);
    }
  }, [addrData]);

  if (!mounted) return null;

  const addresses = Array.isArray(addrData) ? addrData : [];

  const subtotal = totalPrice();
  const shippingFee = subtotal - discount >= 500000 ? 0 : 30000;
  const total = subtotal - discount + shippingFee;

  const applyCoupon = async () => {
    try {
      const res = await couponsApi.validate(couponCode, subtotal);
      setDiscount(res.data.data.discount);
      toast.success(`Giảm ${formatPrice(res.data.data.discount)}!`);
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? "Mã không hợp lệ");
    }
  };

  const placeOrder = async () => {
    if (!selectedAddr) {
      toast.error("Vui lòng chọn địa chỉ giao hàng");
      return;
    }
    if (items.length === 0) {
      toast.error("Giỏ hàng trống");
      return;
    }

    setPlacing(true);

    try {
      const res = await ordersApi.create({
        addressId: selectedAddr,
        items: items.map((i) => ({
          variantId: i.variantId,
          quantity: i.quantity,
        })),
        couponCode: couponCode || undefined,
        note,
        paymentMethod,
      });

      clearCart();
      toast.success("Đặt hàng thành công!");
      router.push(`/orders?success=${res.data.data.orderCode}`);
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? "Đặt hàng thất bại");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="py-8 bg-gray-50">
      <div className="page-container max-w-5xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Thanh toán</h1>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* LEFT */}
          <div className="lg:col-span-3 space-y-4">

            {/* ADDRESS */}
            <div className="card p-5">
              <h2 className="font-semibold mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary-600" />
                Địa chỉ giao hàng
              </h2>

              {addresses.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Bạn chưa có địa chỉ.
                  <a href="/account" className="text-primary-600 underline ml-1">
                    Thêm ngay
                  </a>
                </p>
              ) : (
                <div className="space-y-2">
                  {addresses.map((addr: any) => (
                    <label
                      key={addr.id}
                      className={`flex gap-3 p-3 border rounded-xl cursor-pointer ${
                        selectedAddr === addr.id
                          ? "border-primary-500 bg-primary-50"
                          : "border-gray-200"
                      }`}
                    >
                      <input
                        type="radio"
                        checked={selectedAddr === addr.id}
                        onChange={() => setSelectedAddr(addr.id)}
                      />
                      <div>
                        <p className="font-medium text-sm">
                          {addr.recipientName} · {addr.phone}
                        </p>
                        <p className="text-xs text-gray-500">
                          {addr.addressLine}, {addr.district}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* PAYMENT */}
            <div className="card p-5">
              <h2 className="font-semibold mb-3 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-primary-600" />
                Thanh toán
              </h2>

              {PAYMENT_METHODS.map((m) => (
                <label key={m.id} className="flex gap-3 p-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={paymentMethod === m.id}
                    onChange={() => setPaymentMethod(m.id)}
                  />
                  <span>{m.icon}</span>
                  <span>{m.label}</span>
                </label>
              ))}
            </div>

            {/* NOTE */}
            <div className="card p-5">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="input w-full"
                placeholder="Ghi chú..."
              />
            </div>
          </div>

          {/* RIGHT */}
          <div className="lg:col-span-2">
            <div className="card p-5 space-y-4">
              <h2 className="font-semibold">Đơn hàng</h2>

              {/* Coupon */}
              <div className="flex gap-2">
                <input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="input flex-1"
                />
                <button onClick={applyCoupon} className="btn-secondary">
                  <Tag className="w-4 h-4" />
                </button>
              </div>

              {/* Price */}
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Tạm tính</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Ship</span>
                  <span>{formatPrice(shippingFee)}</span>
                </div>

                <div className="flex justify-between font-bold">
                  <span>Tổng</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              <button
                onClick={placeOrder}
                disabled={placing}
                className="btn-primary w-full"
              >
                <CheckCircle className="w-4 h-4" />
                {placing ? "Đang xử lý..." : "Đặt hàng"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}