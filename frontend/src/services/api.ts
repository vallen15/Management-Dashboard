import {
  DashboardData,
  Product,
  Category,
  Customer,
  Transaction,
} from '../types';

const API_BASE = 'https://management-dashboard-production-e010.up.railway.app/api';

async function handleResponse<T>(response: Response, defaultFallback: any = []): Promise<T> {
  try {
    const json = await response.json();
    if (json.data !== undefined) {
      return json.data as T;
    }
    if (json.success === false) {
      console.warn('API Notice:', json.message);
    }
    return defaultFallback as T;
  } catch (err) {
    console.error('API Response parsing error:', err);
    return defaultFallback as T;
  }
}

export const api = {
  // Dashboard
  async getDashboardStats(): Promise<DashboardData> {
    const fallbackStats: DashboardData = {
      summary: { totalRevenue: 0, totalTransactions: 0, totalProducts: 0, lowStockCount: 0, totalCustomers: 0 },
      recentTransactions: [],
      topProducts: [],
      lowStockProducts: [],
      monthlySalesChart: [],
    };
    const res = await fetch(`${API_BASE}/dashboard/stats`);
    return handleResponse<DashboardData>(res, fallbackStats);
  },

  // Products
  async getProducts(params?: { search?: string; categoryId?: string; lowStock?: boolean }): Promise<Product[]> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.categoryId) query.append('categoryId', params.categoryId);
    if (params?.lowStock) query.append('lowStock', 'true');

    const res = await fetch(`${API_BASE}/products?${query.toString()}`);
    return handleResponse<Product[]>(res, []);
  },

  async createProduct(data: Partial<Product>): Promise<Product> {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Product>(res, {} as Product);
  },

  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Product>(res, {} as Product);
  },

  async deleteProduct(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'DELETE',
    });
    await res.json().catch(() => ({}));
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    const res = await fetch(`${API_BASE}/categories`);
    return handleResponse<Category[]>(res, []);
  },

  async createCategory(data: { name: string; description?: string }): Promise<Category> {
    const res = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Category>(res, {} as Category);
  },

  // Customers
  async getCustomers(search?: string): Promise<Customer[]> {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    const res = await fetch(`${API_BASE}/customers${query}`);
    return handleResponse<Customer[]>(res, []);
  },

  async createCustomer(data: { name: string; email?: string; phone?: string; address?: string }): Promise<Customer> {
    const res = await fetch(`${API_BASE}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Customer>(res, {} as Customer);
  },

  // Transactions / Checkout
  async getTransactions(search?: string): Promise<Transaction[]> {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    const res = await fetch(`${API_BASE}/transactions${query}`);
    return handleResponse<Transaction[]>(res, []);
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
    return handleResponse<Transaction>(res, {} as Transaction);
  },
};
