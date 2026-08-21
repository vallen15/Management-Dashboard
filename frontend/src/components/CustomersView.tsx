import React, { useEffect, useState } from 'react';
import { Users, Plus, Search, Mail, Phone, MapPin, ShoppingBag, X } from 'lucide-react';
import { Customer } from '../types';
import { api } from '../services/api';

const formatIDR = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const CustomersView: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.getCustomers();
      setCustomers(res);
    } catch (err: any) {
      alert(`Gagal memuat data pelanggan: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      await api.createCustomer(formData);
      setIsModalOpen(false);
      setFormData({ name: '', email: '', phone: '', address: '' });
      loadData();
    } catch (err: any) {
      alert(`Gagal menyimpan pelanggan: ${err.message}`);
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.phone && c.phone.includes(searchQuery)) ||
      (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Database Pelanggan (CRM)</h1>
          <p className="text-slate-500 text-sm mt-1">
            Kelola data pelanggan terdaftar, kontak, dan riwayat akumulasi omset pembelian.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-xl shadow-sm transition text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Pelanggan</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative max-w-md">
          <Search className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari nama, email, atau nomor HP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Customer List Grid */}
      {loading ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500">
          Memuat data pelanggan...
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400">
          Tidak ada data pelanggan.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCustomers.map((c) => (
            <div key={c.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{c.name}</h3>
                  <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-md mt-1">
                    Member Terdaftar
                  </span>
                </div>
                <div className="p-2.5 bg-slate-100 text-slate-600 rounded-xl">
                  <Users className="w-5 h-5" />
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                {c.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{c.phone}</span>
                  </div>
                )}
                {c.email && (
                  <div className="flex items-center space-x-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{c.email}</span>
                  </div>
                )}
                {c.address && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{c.address}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-slate-400 font-medium uppercase">Total Pembelian</p>
                  <p className="text-sm font-bold text-emerald-600">{formatIDR(c.totalPurchases)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-slate-400 font-medium uppercase">Transaksi</p>
                  <p className="text-sm font-semibold text-slate-800">{c.transactionCount || 0} kali</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex justify-between items-center pb-2 border-b">
              <h3 className="text-lg font-bold text-slate-900">Tambah Pelanggan Baru</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="space-y-3 text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-emerald-500"
                  placeholder="Contoh: Budi Santoso"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nomor Telepon / WA</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-emerald-500"
                  placeholder="081234567890"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-emerald-500"
                  placeholder="budi@example.com"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Alamat</label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-emerald-500"
                  placeholder="Jl. Sudirman No. 10..."
                />
              </div>

              <div className="pt-3 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 shadow-sm"
                >
                  Simpan Pelanggan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
