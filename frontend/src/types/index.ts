export interface Category {
  id: string;
  name: string;
  description?: string;
  productCount?: number;
  createdAt?: string;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  description?: string;
  price: number;
  costPrice?: number;
  stock: number;
  minStock: number;
  categoryId: string;
  category?: Category;
  isLowStock?: boolean;
  createdAt?: string;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  totalPurchases: number;
  transactionCount?: number;
  createdAt?: string;
}

export interface TransactionItem {
  id?: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Transaction {
  id: string;
  invoiceNo: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: 'CASH' | 'QRIS' | 'DEBIT' | 'CREDIT_CARD' | 'TRANSFER';
  paymentStatus: 'COMPLETED' | 'PENDING' | 'CANCELLED';
  notes?: string;
  customerId?: string;
  customer?: Customer;
  createdAt: string;
  items: TransactionItem[];
}

export interface DashboardSummary {
  totalRevenue: number;
  totalTransactions: number;
  totalProducts: number;
  lowStockCount: number;
  totalCustomers: number;
}

export interface TopProduct {
  productId: string;
  productName: string;
  totalSold: number;
  totalRevenue: number;
}

export interface MonthlyChartData {
  month: string;
  revenue: number;
  orders: number;
}

export interface DashboardData {
  summary: DashboardSummary;
  recentTransactions: Transaction[];
  topProducts: TopProduct[];
  lowStockProducts: { id: string; code: string; name: string; stock: number; minStock: number }[];
  monthlySalesChart: MonthlyChartData[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}
