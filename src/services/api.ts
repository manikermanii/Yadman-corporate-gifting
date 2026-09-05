/**
 * Yadman API Client Service
 * Fully typed, hosting-independent frontend client for the Yadman REST API.
 */

import {
  Product,
  Category,
  Order,
  Coupon,
  ProductReview,
  BlogPost,
  CorporateInquiry,
  ConsultationRequest,
  StoreSettings,
  User,
} from '../types';

const API_BASE = '/api';

async function fetchJson<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message = data?.error?.message || data?.message || 'خطایی در برقراری ارتباط با سرور رخ داد.';
    const error = new Error(message) as any;
    error.code = data?.error?.code;
    error.status = res.status;
    error.details = data?.error?.details;
    throw error;
  }

  return data?.data !== undefined ? data.data : data;
}

export const api = {
  // Authentication
  auth: {
    async register(payload: { name: string; phone: string; email?: string; password: string; companyName?: string }) {
      return fetchJson<{ user: User; token: string }>(`${API_BASE}/auth/register`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    async login(payload: { email: string; password: string }) {
      return fetchJson<{ user: User; token: string }>(`${API_BASE}/auth/login`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    async adminLogin(payload: { email: string; password: string }) {
      return fetchJson<{ admin: any; token: string }>(`${API_BASE}/auth/admin/login`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    async getMe() {
      return fetchJson<{ user: User }>(`${API_BASE}/auth/me`);
    },

    async logout() {
      return fetchJson<{ success: boolean }>(`${API_BASE}/auth/logout`, {
        method: 'POST',
      });
    },
  },

  // Products & Categories
  products: {
    async getAll(params: Record<string, any> = {}) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          searchParams.set(key, String(val));
        }
      });
      const qs = searchParams.toString() ? `?${searchParams.toString()}` : '';
      return fetchJson<Product[]>(`${API_BASE}/products${qs}`);
    },

    async getById(idOrSlug: string) {
      return fetchJson<Product>(`${API_BASE}/products/${idOrSlug}`);
    },

    async getCategories() {
      return fetchJson<Category[]>(`${API_BASE}/categories`);
    },

    async createAdmin(productData: Partial<Product>) {
      return fetchJson<Product>(`${API_BASE}/admin/products`, {
        method: 'POST',
        body: JSON.stringify(productData),
      });
    },

    async updateAdmin(id: string, productData: Partial<Product>) {
      return fetchJson<Product>(`${API_BASE}/admin/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(productData),
      });
    },

    async deleteAdmin(id: string) {
      return fetchJson<{ success: boolean }>(`${API_BASE}/admin/products/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // Orders & Checkout
  orders: {
    async create(orderPayload: any) {
      return fetchJson<Order>(`${API_BASE}/orders`, {
        method: 'POST',
        body: JSON.stringify(orderPayload),
      });
    },

    async getMyOrders() {
      return fetchJson<Order[]>(`${API_BASE}/orders/my`);
    },

    async getById(id: string) {
      return fetchJson<Order>(`${API_BASE}/orders/${id}`);
    },

    async getAllAdmin(params: Record<string, any> = {}) {
      const searchParams = new URLSearchParams(params as any);
      const qs = searchParams.toString() ? `?${searchParams.toString()}` : '';
      return fetchJson<Order[]>(`${API_BASE}/admin/orders${qs}`);
    },

    async updateStatusAdmin(id: string, status: string, adminNotes?: string) {
      return fetchJson<Order>(`${API_BASE}/admin/orders/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, adminNotes }),
      });
    },
  },

  // Coupons
  coupons: {
    async validate(code: string, cartTotal: number) {
      return fetchJson<{ isValid: boolean; coupon: Coupon; discountAmount: number }>(
        `${API_BASE}/coupons/validate`,
        {
          method: 'POST',
          body: JSON.stringify({ code, cartTotal }),
        }
      );
    },

    async getAllAdmin() {
      return fetchJson<Coupon[]>(`${API_BASE}/admin/coupons`);
    },

    async createAdmin(data: Partial<Coupon>) {
      return fetchJson<Coupon>(`${API_BASE}/admin/coupons`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    async updateAdmin(id: string, data: Partial<Coupon>) {
      return fetchJson<Coupon>(`${API_BASE}/admin/coupons/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    async deleteAdmin(id: string) {
      return fetchJson<{ success: boolean }>(`${API_BASE}/admin/coupons/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // Blog
  blog: {
    async getPosts(params: Record<string, any> = {}) {
      const qs = new URLSearchParams(params as any).toString();
      return fetchJson<BlogPost[]>(`${API_BASE}/blog/posts${qs ? `?${qs}` : ''}`);
    },

    async getPostBySlug(slug: string) {
      return fetchJson<BlogPost>(`${API_BASE}/blog/posts/${slug}`);
    },
  },

  // Reviews & Wishlist
  reviews: {
    async getProductReviews(productId: string) {
      return fetchJson<ProductReview[]>(`${API_BASE}/products/${productId}/reviews`);
    },

    async create(data: Partial<ProductReview>) {
      return fetchJson<ProductReview>(`${API_BASE}/reviews`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    async getAllAdmin() {
      return fetchJson<ProductReview[]>(`${API_BASE}/admin/reviews`);
    },

    async updateStatusAdmin(id: string, status: string) {
      return fetchJson<ProductReview>(`${API_BASE}/admin/reviews/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
    },
  },

  // Inquiries & Custom Orders
  inquiries: {
    async submitCorporate(data: Partial<CorporateInquiry>) {
      return fetchJson<CorporateInquiry>(`${API_BASE}/corporate-inquiries`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    async getAllCorporateAdmin() {
      return fetchJson<CorporateInquiry[]>(`${API_BASE}/admin/corporate-inquiries`);
    },

    async submitConsultation(data: Partial<ConsultationRequest>) {
      return fetchJson<ConsultationRequest>(`${API_BASE}/consultations`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    async getAllConsultationsAdmin() {
      return fetchJson<ConsultationRequest[]>(`${API_BASE}/admin/consultations`);
    },

    async submitCustomBox(data: any) {
      return fetchJson<any>(`${API_BASE}/custom-gift-boxes`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
  },

  // CMS & Settings
  cms: {
    async getHomepage() {
      return fetchJson<any>(`${API_BASE}/cms/homepage`);
    },

    async updateHomepageAdmin(config: any) {
      return fetchJson<any>(`${API_BASE}/admin/cms/homepage`, {
        method: 'PUT',
        body: JSON.stringify(config),
      });
    },

    async getSettings() {
      return fetchJson<StoreSettings>(`${API_BASE}/cms/settings`);
    },

    async updateSettingsAdmin(settings: Partial<StoreSettings>) {
      return fetchJson<StoreSettings>(`${API_BASE}/admin/cms/settings`, {
        method: 'PUT',
        body: JSON.stringify(settings),
      });
    },
  },

  // File & Voice Uploads
  upload: {
    async singleImage(file: File, folder = 'products') {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);
      return fetchJson<{ url: string; key: string }>(`${API_BASE}/upload/single`, {
        method: 'POST',
        body: formData,
      });
    },

    async voice(base64Data: string, mimeType = 'audio/webm') {
      return fetchJson<{ url: string }>(`${API_BASE}/upload/voice`, {
        method: 'POST',
        body: JSON.stringify({ base64Data, mimeType }),
      });
    },
  },
};
