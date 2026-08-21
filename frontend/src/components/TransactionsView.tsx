import React, { useEffect, useState } from 'react';
import { Receipt, Search, Eye, X, Calendar, Printer } from 'lucide-react';
import { Transaction } from '../types';
import { api } from '../services/api';

const formatIDR = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const TransactionsView: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.getTransactions();
      setTransactions(res);
    } catch (err: any) {
      alert(`Gagal memuat riwayat transaksi: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(
    (t) =>
      t.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.customer && t.customer.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Riwayat Penjualan & Transaksi</h1>
          <p className="text-slate-500 text-sm mt-1">
            Daftar lengkap faktur penjualan, pembayaran, dan rincian item transaksi kasir.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative max-w-md">
          <Search className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari nomor faktur atau nama pelanggan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">Memuat riwayat transaksi...</div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-12 text-center text-slate-400">Tidak ada riwayat transaksi ditemukan.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-semibold text-xs border-b">
                <tr>
                  <th className="py-3 px-4">No. Faktur</th>
                  <th className="py-3 px-4">Waktu Transaksi</th>
                  <th className="py-3 px-4">Pelanggan</th>
                  <th className="py-3 px-4">Metode Bayar</th>
                  <th className="py-3 px-4 text-right">Total Transaksi</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-mono text-xs font-bold text-slate-900">{tx.invoiceNo}</td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      {new Date(tx.createdAt).toLocaleString('id-ID')}
                    </td>
                    <td className="py-3.5 px-4 text-slate-800 font-medium">{tx.customer?.name || 'Pelanggan Umum'}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-md">
                        {tx.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-emerald-600">{formatIDR(tx.totalAmount)}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
                        SELESAI
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => setSelectedTx(tx)}
                        className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                        title="Lihat Faktur"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoice Detail Modal */}
      {selectedTx && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <button onClick={() => setSelectedTx(null)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>

            <div className="border-b pb-3">
              <h3 className="text-lg font-bold text-slate-900">Rincian Faktur Penjualan</h3>
              <p className="text-xs font-mono text-emerald-600 font-semibold">{selectedTx.invoiceNo}</p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400 block font-medium">Tanggal</span>
                  <span className="font-semibold text-slate-800">
                    {new Date(selectedTx.createdAt).toLocaleString('id-ID')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Metode</span>
                  <span className="font-semibold text-slate-800">{selectedTx.paymentMethod}</span>
                </div>
                <div className="col-span-2 border-t pt-2 mt-1">
                  <span className="text-slate-400 block font-medium">Pelanggan</span>
                  <span className="font-semibold text-slate-800">
                    {selectedTx.customer?.name || 'Pelanggan Umum'}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-700 mb-2">Item Pembelian</h4>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {selectedTx.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between p-2 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-800">{item.productName}</p>
                        <p className="text-[11px] text-slate-400">
                          {formatIDR(item.unitPrice)} x {item.quantity}
                        </p>
                      </div>
                      <span className="font-semibold text-slate-900">{formatIDR(item.subtotal)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-3 space-y-1 text-slate-700">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatIDR(selectedTx.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>PPN 11%</span>
                  <span>{formatIDR(selectedTx.taxAmount)}</span>
                </div>
                {selectedTx.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Diskon</span>
                    <span>-{formatIDR(selectedTx.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm text-slate-900 border-t pt-2">
                  <span>Total Bayar</span>
                  <span className="text-emerald-600">{formatIDR(selectedTx.totalAmount)}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex space-x-3">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl text-xs flex items-center justify-center space-x-2"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Faktur</span>
              </button>
              <button
                onClick={() => setSelectedTx(null)}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
