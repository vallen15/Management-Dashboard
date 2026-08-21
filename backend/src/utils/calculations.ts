export interface CartItemInput {
  price: number;
  quantity: number;
}

/**
 * Calculates subtotal for an individual order item
 */
export function calculateItemSubtotal(unitPrice: number, quantity: number): number {
  if (unitPrice < 0 || quantity < 0) {
    throw new Error("Unit price and quantity must be non-negative");
  }
  return Number((unitPrice * quantity).toFixed(2));
}

/**
 * Calculates total subtotal for an array of items
 */
export function calculateOrderSubtotal(items: CartItemInput[]): number {
  if (!items || items.length === 0) return 0;
  const total = items.reduce((acc, item) => {
    return acc + calculateItemSubtotal(item.price, item.quantity);
  }, 0);
  return Number(total.toFixed(2));
}

/**
 * Calculates tax amount based on subtotal and percentage rate (e.g., 11% tax = 0.11)
 */
export function calculateTax(subtotal: number, taxRate: number = 0.11): number {
  if (subtotal < 0) throw new Error("Subtotal must be non-negative");
  if (taxRate < 0) throw new Error("Tax rate must be non-negative");
  return Number((subtotal * taxRate).toFixed(2));
}

/**
 * Calculates final total amount: subtotal + tax - discount
 */
export function calculateFinalTotal(
  subtotal: number,
  taxAmount: number = 0,
  discountAmount: number = 0
): number {
  if (discountAmount > subtotal + taxAmount) {
    throw new Error("Discount cannot exceed subtotal + tax");
  }
  const net = subtotal + taxAmount - discountAmount;
  return Number(Math.max(0, net).toFixed(2));
}

/**
 * Checks if product stock level is low
 */
export function isLowStock(currentStock: number, minStock: number = 5): boolean {
  return currentStock <= minStock;
}

/**
 * Formats transaction invoice number (e.g., INV-20260819-0001)
 */
export function formatInvoiceNumber(seq: number, date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const seqStr = String(seq).padStart(4, "0");
  return `INV-${year}${month}${day}-${seqStr}`;
}

/**
 * Formats number to IDR currency string
 */
export function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}
