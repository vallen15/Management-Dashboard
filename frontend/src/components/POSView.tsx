import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  CheckCircle,
  X,
  Printer,
  ShoppingBag,
  CreditCard,
  UserCheck,
} from 'lucide-react';
import { Product, Category, Customer, CartItem, Transaction } from '../types';
import { api } from '../services/api';

const formatIDR = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const POSView: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('CASH');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [completedTransaction, setCompletedTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes, custRes] = await Promise.all([
        api.getProducts(),
        api.getCategories(),
        api.getCustomers(),
      ]);
      setProducts(prodRes);
      setCategories(catRes);
      setCustomers(custRes);
    } catch (err: any) {
      alert(`Gagal memuat data POS: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'all' || p.categoryId === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      alert(`Stok ${product.name} habis!`);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          alert(`Jumlah melebihi stok yang tersedia (${product.stock} unit)`);
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            if (newQty > item.product.stock) {
              alert(`Kuantitas melebihi stok (${item.product.stock})`);
              return item;
            }
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const cartSubtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const taxAmount = cartSubtotal * 0.11;
  const finalTotal = Math.max(0, cartSubtotal + taxAmount - discountAmount);

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Keranjang belanja masih kosong');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        items: cart.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
        paymentMethod,
        discountAmount: Number(discountAmount),
        customerId: selectedCustomerId || undefined,
        notes,
      };

      const result = await api.createTransaction(payload);
      setCompletedTransaction(result);
      setCart([]);
      setDiscountAmount(0);
      setNotes('');
      // Refresh products to sync stock
      loadData();
    } catch (err: any) {
      alert(`Gagal memproses transaksi: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-12">
      {/* Left 2 Columns: Product Catalog */}
      <div className="lg:col-span-2 space-y-5">
        {/* Search & Categories */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Cari nama atau kode produk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === 'all'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua Kategori
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategory === c.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        {loading ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500">
            Memuat katalog produk...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400">
            Tidak ada produk yang sesuai.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                onClick={() => addToCart(p)}
                className={`bg-white p-4 rounded-2xl border transition-all cursor-pointer shadow-sm flex flex-col justify-between hover:shadow-md ${
                  p.stock <= 0
                    ? 'opacity-50 border-slate-200 bg-slate-50 cursor-not-allowed'
                    : 'border-slate-200 hover:border-emerald-500'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
                    <span>{p.code}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                        p.stock <= p.minStock
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      Stok: {p.stock}
                    </span>
                  </div>
                  <h3 className="font-semibold text-slate-900 text-sm line-clamp-2">{p.name}</h3>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className="font-bold text-emerald-600 text-sm">{formatIDR(p.price)}</span>
                  <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition">
                    <Plus className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Column: Checkout Cart */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-fit sticky top-20">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-600" />
              Keranjang Kasir
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-full">
              {cart.reduce((a, b) => a + b.quantity, 0)} Item
            </span>
          </div>

          {/* Cart Items list */}
          {cart.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              Keranjang masih kosong. Klik produk di sebelah kiri untuk menambahkan.
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100"
                >
                  <div className="flex-1 pr-2">
                    <p className="text-sm font-semibold text-slate-800 line-clamp-1">{item.product.name}</p>
                    <p className="text-xs text-emerald-600 font-medium">
                      {formatIDR(item.product.price)} x {item.quantity} = {formatIDR(item.product.price * item.quantity)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => updateQuantity(item.product.id, -1)}
                      className="p-1 text-slate-500 hover:bg-slate-200 rounded"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-bold w-5 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, 1)}
                      className="p-1 text-slate-500 hover:bg-slate-200 rounded"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded ml-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Options: Customer & Payment */}
          <div className="mt-5 pt-4 border-t border-slate-100 space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Pelanggan (Opsional)</label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
              >
                <option value="">-- Pelanggan Umum --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone || 'Tanpa No. HP'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Metode Pembayaran</label>
              <div className="grid grid-cols-4 gap-1.5">
                {['CASH', 'QRIS', 'DEBIT', 'TRANSFER'].map((method) => (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={`py-1.5 text-[11px] font-bold rounded-lg transition ${
                      paymentMethod === method
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Potongan Diskon (Rp)</label>
              <input
                type="number"
                min="0"
                value={discountAmount}
                onChange={(e) => setDiscountAmount(Math.max(0, Number(e.target.value)))}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Total Summary & Checkout Button */}
        <div className="mt-5 pt-4 border-t border-slate-200 space-y-2">
          <div className="flex justify-between text-xs text-slate-600">
            <span>Subtotal</span>
            <span>{formatIDR(cartSubtotal)}</span>
          </div>
          <div className="flex justify-between text-xs text-slate-600">
            <span>PPN (11%)</span>
            <span>{formatIDR(taxAmount)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-xs text-emerald-600 font-semibold">
              <span>Diskon</span>
              <span>-{formatIDR(discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t">
            <span>Total Bayar</span>
            <span className="text-emerald-600">{formatIDR(finalTotal)}</span>
          </div>

          <button
            onClick={handleCheckout}
            disabled={cart.length === 0 || submitting}
            className={`w-full py-3 rounded-xl font-bold text-white transition mt-4 shadow-sm flex items-center justify-center space-x-2 ${
              cart.length === 0 || submitting
                ? 'bg-slate-300 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            <CreditCard className="w-5 h-5" />
            <span>{submitting ? 'Memproses...' : 'Proses Pembayaran'}</span>
          </button>
        </div>
      </div>

      {/* Completed Invoice / Struk Modal */}
      {completedTransaction && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setCompletedTransaction(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="text-xl font-bold text-slate-900">Transaksi Berhasil!</h3>
              <p className="text-xs text-slate-500 font-mono">{completedTransaction.invoiceNo}</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-200 text-xs font-mono">
              <div className="flex justify-between border-b pb-2">
                <span>Tanggal</span>
                <span>{new Date(completedTransaction.createdAt).toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span>Metode</span>
                <span className="font-bold">{completedTransaction.paymentMethod}</span>
              </div>
              {completedTransaction.customer && (
                <div className="flex justify-between border-b pb-2">
                  <span>Pelanggan</span>
                  <span>{completedTransaction.customer.name}</span>
                </div>
              )}

              <div className="py-2 space-y-1">
                {completedTransaction.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-slate-700">
                    <span>
                      {item.productName} x{item.quantity}
                    </span>
                    <span>{formatIDR(item.subtotal)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-2 space-y-1">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatIDR(completedTransaction.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>PPN 11%</span>
                  <span>{formatIDR(completedTransaction.taxAmount)}</span>
                </div>
                {completedTransaction.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Diskon</span>
                    <span>-{formatIDR(completedTransaction.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm text-slate-900 pt-1 border-t">
                  <span>Total</span>
                  <span>{formatIDR(completedTransaction.totalAmount)}</span>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => window.print()}
                className="flex-1 flex items-center justify-center space-x-2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl text-xs transition"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Struk</span>
              </button>
              <button
                onClick={() => setCompletedTransaction(null)}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs transition"
              >
                Transaksi Baru
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
