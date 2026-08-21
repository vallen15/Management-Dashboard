import React, { useEffect, useState } from 'react';
import {
  DollarSign,
  ShoppingBag,
  Package,
  AlertTriangle,
  Users,
  TrendingUp,
  ArrowUpRight,
  RefreshCw,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { DashboardData } from '../types';
import { api } from '../services/api';

const formatIDR = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const DashboardView: React.FC<{ onNavigateToPos: () => void }> = ({ onNavigateToPos }) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getDashboardStats();
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat data dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-3 text-emerald-600">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span className="font-medium text-slate-700">Memuat data dashboard...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center max-w-lg mx-auto my-8">
        <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <h3 className="font-semibold text-red-800 text-lg">Gagal Memuat Dashboard</h3>
        <p className="text-red-600 text-sm mt-1 mb-4">{error}</p>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg text-sm transition"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  const { summary, monthlySalesChart, topProducts, lowStockProducts, recentTransactions } = data;

  return (
    <div className="space-y-6 pb-12">
      {/* Header banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard Penjualan</h1>
          <p className="text-slate-500 text-sm mt-1">
            Ringkasan performa toko, transaksi kasir, dan persediaan barang secara real-time.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={loadData}
            className="p-2 text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            title="Refresh data"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button
            onClick={onNavigateToPos}
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2.5 rounded-xl shadow-sm transition"
          >
            <ShoppingBag className="w-5 h-5" />
            <span>Buka Kasir POS</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Omset</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{formatIDR(summary.totalRevenue)}</h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-emerald-600 font-medium">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>Penjualan terkonfirmasi</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Transaksi</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{summary.totalTransactions}</h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </div>
          <p className="mt-4 text-xs text-slate-500">Transaksi diproses kasir</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Produk</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{summary.totalProducts}</h3>
            </div>
            <div className="p-3 bg-violet-50 text-violet-600 rounded-xl">
              <Package className="w-6 h-6" />
            </div>
          </div>
          <p className="mt-4 text-xs text-slate-500">{summary.totalCustomers} pelanggan terdaftar</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Stok Menipis</p>
              <h3 className={`text-2xl font-bold mt-1 ${summary.lowStockCount > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
                {summary.lowStockCount} Produk
              </h3>
            </div>
            <div className={`p-3 rounded-xl ${summary.lowStockCount > 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
          <p className="mt-4 text-xs text-slate-500">Perlu re-stock sedia barang</p>
        </div>
      </div>

      {/* Chart & Top Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Tren Pendapatan Bulanan</h2>
              <p className="text-xs text-slate-500">Grafik omset penjualan 6 bulan terakhir</p>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlySalesChart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => `Rp${v / 1000}k`} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip formatter={(value: any) => [formatIDR(Number(value)), 'Pendapatan']} />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-1">Produk Terlaris</h2>
            <p className="text-xs text-slate-500 mb-4">Produk paling banyak terjual</p>
            <div className="space-y-4">
              {topProducts.length === 0 ? (
                <p className="text-sm text-slate-400 py-4 text-center">Belum ada data penjualan</p>
              ) : (
                topProducts.map((p, idx) => (
                  <div key={p.productId} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-slate-800 truncate max-w-[140px]">{p.productName}</p>
                        <p className="text-xs text-slate-500">{p.totalSold} unit terjual</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-slate-900">{formatIDR(p.totalRevenue)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tables Row: Recent Transactions & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Transaksi Terbaru</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-semibold text-xs border-b">
                <tr>
                  <th className="pb-3 px-2">No. Faktur</th>
                  <th className="pb-3 px-2">Pelanggan</th>
                  <th className="pb-3 px-2">Metode</th>
                  <th className="pb-3 px-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-400 text-sm">
                      Belum ada transaksi
                    </td>
                  </tr>
                ) : (
                  recentTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50">
                      <td className="py-3 px-2 font-mono text-xs font-medium text-slate-900">{tx.invoiceNo}</td>
                      <td className="py-3 px-2 text-slate-600">{tx.customer?.name || 'Umum'}</td>
                      <td className="py-3 px-2">
                        <span className="inline-block px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-700 rounded-md">
                          {tx.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right font-semibold text-slate-900">{formatIDR(tx.totalAmount)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Warning List */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">Peringatan Stok Menipis</h2>
            <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full">
              Peringatan Kasir
            </span>
          </div>
          <div className="space-y-3">
            {lowStockProducts.length === 0 ? (
              <p className="text-slate-400 text-sm py-6 text-center">Semua stok barang dalam kondisi cukup 👍</p>
            ) : (
              lowStockProducts.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 border border-amber-200 bg-amber-50/50 rounded-xl">
                  <div>
                    <span className="font-mono text-xs text-slate-500 font-semibold">{p.code}</span>
                    <p className="font-medium text-sm text-slate-900">{p.name}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-amber-700">{p.stock} unit</span>
                    <p className="text-xs text-slate-500">Min. stok: {p.minStock}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
