import React, { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Package,
  AlertTriangle,
  FolderPlus,
  X,
  CheckCircle,
} from 'lucide-react';
import { Product, Category } from '../types';
import { api } from '../services/api';

const formatIDR = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const ProductsView: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  // Modal states
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    price: 0,
    costPrice: 0,
    stock: 0,
    minStock: 5,
    categoryId: '',
  });

  const [categoryName, setCategoryName] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([api.getProducts(), api.getCategories()]);
      setProducts(prodRes);
      setCategories(catRes);
      if (catRes.length > 0 && !formData.categoryId) {
        setFormData((prev) => ({ ...prev, categoryId: catRes[0].id }));
      }
    } catch (err: any) {
      alert(`Gagal memuat data produk: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      code: `PRD-${Math.floor(100 + Math.random() * 900)}`,
      name: '',
      description: '',
      price: 0,
      costPrice: 0,
      stock: 10,
      minStock: 5,
      categoryId: categories[0]?.id || '',
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      code: product.code,
      name: product.name,
      description: product.description || '',
      price: product.price,
      costPrice: product.costPrice || 0,
      stock: product.stock,
      minStock: product.minStock,
      categoryId: product.categoryId,
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code || !formData.categoryId) {
      alert('Mohon lengkapi data produk yang wajib diisi');
      return;
    }

    try {
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, formData);
      } else {
        await api.createProduct(formData);
      }
      setIsProductModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(`Gagal menyimpan produk: ${err.message}`);
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus produk '${name}'?`)) return;
    try {
      await api.deleteProduct(id);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;
    try {
      await api.createCategory({ name: categoryName.trim() });
      setCategoryName('');
      setIsCategoryModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(`Gagal menambah kategori: ${err.message}`);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || p.categoryId === selectedCategory;
    const matchesLowStock = !showLowStockOnly || p.stock <= p.minStock;
    return matchesSearch && matchesCategory && matchesLowStock;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manajemen Produk & Stok</h1>
          <p className="text-slate-500 text-sm mt-1">
            Kelola data katalog produk, harga jual, harga pokok, dan batas stok minimum.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2.5 rounded-xl transition text-sm"
          >
            <FolderPlus className="w-4 h-4" />
            <span>Tambah Kategori</span>
          </button>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-xl shadow-sm transition text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Produk</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari kode atau nama produk..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.productCount || 0})
              </option>
            ))}
          </select>

          <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 cursor-pointer bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
            <input
              type="checkbox"
              checked={showLowStockOnly}
              onChange={(e) => setShowLowStockOnly(e.target.checked)}
              className="accent-emerald-600 rounded"
            />
            <span className="flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              Stok Menipis Saja
            </span>
          </label>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">Memuat data produk...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-slate-400">Tidak ada produk ditemukan.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-semibold text-xs border-b">
                <tr>
                  <th className="py-3 px-4">Kode</th>
                  <th className="py-3 px-4">Nama Produk</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4 text-right">Harga Jual</th>
                  <th className="py-3 px-4 text-center">Stok</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((p) => {
                  const isLow = p.stock <= p.minStock;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4 font-mono text-xs font-semibold text-slate-900">{p.code}</td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-900">{p.name}</p>
                        {p.description && <p className="text-xs text-slate-400 truncate max-w-xs">{p.description}</p>}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-md">
                          {p.category?.name || 'Tanpa Kategori'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-emerald-600">{formatIDR(p.price)}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                            isLow
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {isLow && <AlertTriangle className="w-3 h-3 mr-0.5" />}
                          <span>{p.stock} unit</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center space-x-2">
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                          title="Edit Produk"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id, p.name)}
                          className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Hapus Produk"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Product Form Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex justify-between items-center pb-3 border-b">
              <h3 className="text-lg font-bold text-slate-900">
                {editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
              </h3>
              <button onClick={() => setIsProductModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kode Produk *</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full p-2 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kategori *</label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full p-2 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Produk *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  placeholder="Contoh: Kopi Susu Aren 250ml"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Deskripsi</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Harga Jual (Rp) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Harga Pokok/HPP (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jumlah Stok Saat Ini *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Batas Min. Stok Alert</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 shadow-sm"
                >
                  Simpan Produk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Form Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex justify-between items-center pb-2 border-b">
              <h3 className="text-lg font-bold text-slate-900">Tambah Kategori Baru</h3>
              <button onClick={() => setIsCategoryModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 text-sm mb-1">Nama Kategori</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Snack & Camilan"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 shadow-sm"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
