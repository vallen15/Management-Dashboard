import { describe, expect, test } from "bun:test";
import {
  calculateItemSubtotal,
  calculateOrderSubtotal,
  calculateTax,
  calculateFinalTotal,
  isLowStock,
  formatInvoiceNumber,
  formatIDR,
} from "../../src/utils/calculations";

describe("Unit Tests: Business Logic Calculations", () => {
  describe("calculateItemSubtotal", () => {
    test("should correctly multiply price and quantity", () => {
      expect(calculateItemSubtotal(15000, 3)).toBe(45000);
      expect(calculateItemSubtotal(18.5, 2)).toBe(37);
    });

    test("should throw error for negative values", () => {
      expect(() => calculateItemSubtotal(-100, 2)).toThrow("Unit price and quantity must be non-negative");
      expect(() => calculateItemSubtotal(100, -1)).toThrow("Unit price and quantity must be non-negative");
    });
  });

  describe("calculateOrderSubtotal", () => {
    test("should return sum of all items in cart", () => {
      const cart = [
        { price: 10000, quantity: 2 }, // 20000
        { price: 25000, quantity: 1 }, // 25000
        { price: 5000, quantity: 3 },  // 15000
      ];
      expect(calculateOrderSubtotal(cart)).toBe(60000);
    });

    test("should return 0 for empty cart", () => {
      expect(calculateOrderSubtotal([])).toBe(0);
    });
  });

  describe("calculateTax", () => {
    test("should calculate 11% tax default correctly", () => {
      expect(calculateTax(100000)).toBe(11000);
      expect(calculateTax(200000, 0.11)).toBe(22000);
    });

    test("should throw error if subtotal is negative", () => {
      expect(() => calculateTax(-50)).toThrow();
    });
  });

  describe("calculateFinalTotal", () => {
    test("should calculate subtotal + tax - discount", () => {
      // Subtotal: 100,000, Tax: 11,000, Discount: 10,000 => 101,000
      expect(calculateFinalTotal(100000, 11000, 10000)).toBe(101000);
    });

    test("should throw error when discount exceeds subtotal + tax", () => {
      expect(() => calculateFinalTotal(10000, 1000, 20000)).toThrow(
        "Discount cannot exceed subtotal + tax"
      );
    });
  });

  describe("isLowStock", () => {
    test("should return true when stock <= minStock", () => {
      expect(isLowStock(3, 5)).toBe(true);
      expect(isLowStock(5, 5)).toBe(true);
    });

    test("should return false when stock > minStock", () => {
      expect(isLowStock(10, 5)).toBe(false);
    });
  });

  describe("formatInvoiceNumber", () => {
    test("should format invoice number with padded sequence and date", () => {
      const fixedDate = new Date(2026, 7, 19); // 19 Aug 2026
      expect(formatInvoiceNumber(5, fixedDate)).toBe("INV-20260819-0005");
      expect(formatInvoiceNumber(123, fixedDate)).toBe("INV-20260819-0123");
    });
  });

  describe("formatIDR", () => {
    test("should format number as IDR currency", () => {
      const formatted = formatIDR(50000);
      expect(formatted).toContain("50");
    });
  });
});
