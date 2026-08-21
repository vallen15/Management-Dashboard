export function validateEmail(email: string): boolean {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

export interface ProductInput {
  code: string;
  name: string;
  price: number;
  stock: number;
  categoryId: string;
}

export function validateProductInput(input: Partial<ProductInput>): { valid: boolean; error?: string } {
  if (!input.code || input.code.trim().length === 0) {
    return { valid: false, error: "Kode produk wajib diisi" };
  }
  if (!input.name || input.name.trim().length === 0) {
    return { valid: false, error: "Nama produk wajib diisi" };
  }
  if (typeof input.price !== "number" || input.price < 0) {
    return { valid: false, error: "Harga produk harus berupa angka non-negatif" };
  }
  if (typeof input.stock !== "number" || input.stock < 0) {
    return { valid: false, error: "Stok produk harus berupa angka non-negatif" };
  }
  if (!input.categoryId || input.categoryId.trim().length === 0) {
    return { valid: false, error: "Kategori produk wajib dipilih" };
  }
  return { valid: true };
}

export interface CreateTransactionInput {
  items: { productId: string; quantity: number }[];
  paymentMethod?: string;
  discountAmount?: number;
  customerId?: string;
}

export function validateTransactionInput(input: Partial<CreateTransactionInput>): { valid: boolean; error?: string } {
  if (!input.items || !Array.isArray(input.items) || input.items.length === 0) {
    return { valid: false, error: "Transaksi harus memiliki minimal 1 item produk" };
  }
  for (const item of input.items) {
    if (!item.productId || typeof item.productId !== "string") {
      return { valid: false, error: "ID produk tidak valid pada item transaksi" };
    }
    if (typeof item.quantity !== "number" || item.quantity <= 0) {
      return { valid: false, error: "Jumlah kuantitas item harus lebih besar dari 0" };
    }
  }
  if (input.discountAmount !== undefined && (typeof input.discountAmount !== "number" || input.discountAmount < 0)) {
    return { valid: false, error: "Jumlah diskon tidak boleh negatif" };
  }
  return { valid: true };
}

export function sanitizeSearchQuery(query: string | undefined): string {
  if (!query) return "";
  return query.trim().replace(/[%_]/g, "");
}
