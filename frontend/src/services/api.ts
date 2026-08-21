import {
  DashboardData,
  Product,
  Category,
  Customer,
  Transaction,
} from '../types';

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV
    ? '/api'
    : 'https://management-dashboard-production-e010.up.railway.app/api');

async function handleResponse<T>(response: Response): Promise<T> {
  const json = await response.json();
  if (!response.ok || !json.success) {
    throw new Error(json.message || 'Terjadi kesalahan pada server');
  }
  return json.data as T;
}

export const api = {
  // Dashboard
  async getDashboardStats(): Promise<DashboardData> {
    const res = await fetch(`${API_BASE}/dashboard/stats`);
    return handleResponse<DashboardData>(res);
  },

  // Products
  async getProducts(params?: { search?: string; categoryId?: string; lowStock?: boolean }): Promise<Product[]> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.categoryId) query.append('categoryId', params.categoryId);
    if (params?.lowStock) query.append('lowStock', 'true');

    const res = await fetch(`${API_BASE}/products?${query.toString()}`);
    return handleResponse<Product[]>(res);
  },

  async createProduct(data: Partial<Product>): Promise<Product> {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Product>(res);
  },

  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Product>(res);
  },

  async deleteProduct(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Gagal menghapus produk');
    }
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    const res = await fetch(`${API_BASE}/categories`);
    return handleResponse<Category[]>(res);
  },

  async createCategory(data: { name: string; description?: string }): Promise<Category> {
    const res = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Category>(res);
  },

  // Customers
  async getCustomers(search?: string): Promise<Customer[]> {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    const res = await fetch(`${API_BASE}/customers${query}`);
    return handleResponse<Customer[]>(res);
  },

  async createCustomer(data: { name: string; email?: string; phone?: string; address?: string }): Promise<Customer> {
    const res = await fetch(`${API_BASE}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Customer>(res);
  },

  // Transactions / Checkout
  async getTransactions(search?: string): Promise<Transaction[]> {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    const res = await fetch(`${API_BASE}/transactions${query}`);
    return handleResponse<Transaction[]>(res);
  },

  async createTransaction(payload: {
    items: { productId: string; quantity: number }[];
    paymentMethod: string;
    discountAmount: number;
    customerId?: string;
    notes?: string;
  }): Promise<Transaction> {
    const res = await fetch(`${API_BASE}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<Transaction>(res);
  },
};
