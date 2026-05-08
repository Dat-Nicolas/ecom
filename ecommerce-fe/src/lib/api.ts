// src/lib/api.ts
import axios, { AxiosInstance } from "axios";
import { getCookie, setCookie, deleteCookie } from "cookies-next";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// Attach token
api.interceptors.request.use((config) => {
  const token = getCookie("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config || {};

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      try {
        const refreshToken = getCookie("refreshToken");
        if (!refreshToken) {
          throw new Error("MISSING_REFRESH_TOKEN");
        }

        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const nextAccessToken = data?.data?.accessToken;
        const nextRefreshToken = data?.data?.refreshToken;

        if (!nextAccessToken || !nextRefreshToken) {
          throw new Error("INVALID_REFRESH_RESPONSE");
        }

        setCookie("accessToken", nextAccessToken, { maxAge: 7 * 86400 });
        setCookie("refreshToken", nextRefreshToken, { maxAge: 30 * 86400 });

        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${nextAccessToken}`;
        return api(original);
      } catch {
        deleteCookie("accessToken");
        deleteCookie("refreshToken");

        return Promise.reject(new Error("UNAUTHORIZED"));
      }
    }

    return Promise.reject(error);
  }
);

// â”€â”€â”€ Auth â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const authApi = {
  register: (data: any) => api.post("/auth/register", data),
  login: (data: any) => api.post("/auth/login", data),
  refresh: (refreshToken: string) => api.post("/auth/refresh", { refreshToken }),
  logout: (refreshToken: string) => api.post("/auth/logout", { refreshToken }),
};

// â”€â”€â”€ Products â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const productsApi = {
  list: (params?: any) => api.get("/products", { params }),
  featured: () => api.get("/products/featured"),
  bySlug: (slug: string) => api.get(`/products/slug/${slug}`),
  byId: (id: string) => api.get(`/products/${id}`),
  create: (data: any) => api.post("/products", data),
  update: (id: string, data: any) => api.put(`/products/${id}`, data),
  remove: (id: string) => api.delete(`/products/${id}`),
  addVariant: (id: string, data: any) =>
    api.post(`/products/${id}/variants`, data),
};

// â”€â”€â”€ Categories â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const categoriesApi = {
  list: () => api.get("/categories"),
  byId: (id: number) => api.get(`/categories/${id}`),
  create: (data: any) => api.post("/categories", data),
  update: (id: number, data: any) => api.put(`/categories/${id}`, data),
  remove: (id: number) => api.delete(`/categories/${id}`),
};

// â”€â”€â”€ Brands â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const brandsApi = {
  list: () => api.get("/brands"),
  create: (data: any) => api.post("/brands", data),
  update: (id: number, data: any) => api.put(`/brands/${id}`, data),
  remove: (id: number) => api.delete(`/brands/${id}`),
};

// â”€â”€â”€ Orders â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const ordersApi = {
  create: (data: any) => api.post("/orders", data),
  myOrders: (params?: any) => api.get("/orders/my", { params }),
  myOrder: (id: string) => api.get(`/orders/my/${id}`),
  cancel: (id: string) => api.put(`/orders/my/${id}/cancel`),
  list: (params?: any) => api.get("/orders", { params }),
  byId: (id: string) => api.get(`/orders/${id}`),
  updateStatus: (id: string, data: any) =>
    api.put(`/orders/${id}/status`, data),
};

// â”€â”€â”€ Payments â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const paymentsApi = {
  create: (orderId: string, data: any) =>
    api.post(`/payments/orders/${orderId}`, data),
  orderPayments: (orderId: string) => api.get(`/payments/orders/${orderId}`),
};

// â”€â”€â”€ Users â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const usersApi = {
  me: () => api.get("/users/me"),
  update: (data: any) => api.put("/users/me", data),
  addresses: () => api.get("/users/me/addresses"),
  addAddress: (data: any) => api.post("/users/me/addresses", data),
  removeAddress: (id: string) => api.delete(`/users/me/addresses/${id}`),
  list: (params?: any) => api.get("/users", { params }),
  byId: (id: string) => api.get(`/users/${id}`),
};

// â”€â”€â”€ Reviews â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const reviewsApi = {
  create: (data: any) => api.post("/reviews", data),
  byProduct: (productId: string, params?: any) =>
    api.get(`/reviews/products/${productId}`, { params }),
  pending: (params?: any) => api.get("/reviews/pending", { params }),
  moderate: (id: string, status: string) =>
    api.put(`/reviews/${id}/moderate`, { status }),
};

// â”€â”€â”€ Coupons â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const couponsApi = {
  list: () => api.get("/coupons"),
  create: (data: any) => api.post("/coupons", data),
  update: (id: string, data: any) => api.put(`/coupons/${id}`, data),
  remove: (id: string) => api.delete(`/coupons/${id}`),
  validate: (code: string, orderValue: number) =>
    api.post("/coupons/validate", { code, orderValue }),
};

// â”€â”€â”€ Inventory â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const inventoryApi = {
  list: (params?: any) => api.get("/inventory", { params }),
  adjust: (data: any) => api.post("/inventory/adjust", data),
  warehouses: () => api.get("/inventory/warehouses"),
  createWarehouse: (data: any) => api.post("/inventory/warehouses", data),
};

// â”€â”€â”€ Notifications â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const notificationsApi = {
  list: (params?: any) => api.get("/notifications", { params }),
  unreadCount: () => api.get("/notifications/unread-count"),
  markRead: (id: number) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put("/notifications/read-all"),
};

export default api;

