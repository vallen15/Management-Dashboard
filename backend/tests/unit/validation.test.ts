import { describe, expect, test } from "bun:test";
import {
  validateEmail,
  validateProductInput,
  validateTransactionInput,
  sanitizeSearchQuery,
} from "../../src/utils/validation";

describe("Unit Tests: Data Validation & Sanitization", () => {
  describe("validateEmail", () => {
    test("should return true for valid emails", () => {
      expect(validateEmail("user@example.com")).toBe(true);
      expect(validateEmail("admin.posify@store.co.id")).toBe(true);
    });

    test("should return false for invalid emails", () => {
      expect(validateEmail("invalid-email")).toBe(false);
      expect(validateEmail("user@")).toBe(false);
      expect(validateEmail("")).toBe(false);
    });
  });

  describe("validateProductInput", () => {
    test("should pass valid product input", () => {
      const result = validateProductInput({
        code: "P-01",
        name: "Produk A",
        price: 10000,
        stock: 50,
        categoryId: "cat-1",
      });
      expect(result.valid).toBe(true);
    });

    test("should fail if product code is missing", () => {
      const result = validateProductInput({
        code: "",
        name: "Produk A",
        price: 10000,
        stock: 50,
        categoryId: "cat-1",
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Kode produk");
    });

    test("should fail if price is negative", () => {
      const result = validateProductInput({
        code: "P-01",
        name: "Produk A",
        price: -5000,
        stock: 10,
        categoryId: "cat-1",
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Harga produk");
    });
  });

  describe("validateTransactionInput", () => {
    test("should pass valid transaction input", () => {
      const result = validateTransactionInput({
        items: [{ productId: "prod-1", quantity: 2 }],
        paymentMethod: "CASH",
        discountAmount: 1000,
      });
      expect(result.valid).toBe(true);
    });

    test("should fail if items array is empty", () => {
      const result = validateTransactionInput({ items: [] });
      expect(result.valid).toBe(false);
      expect(result.error).toContain("minimal 1 item");
    });

    test("should fail if item quantity is zero or negative", () => {
      const result = validateTransactionInput({
        items: [{ productId: "prod-1", quantity: 0 }],
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain("kuantitas item");
    });
  });

  describe("sanitizeSearchQuery", () => {
    test("should strip SQL wildcard characters % and _", () => {
      expect(sanitizeSearchQuery("kopi%_susu")).toBe("kopisusu");
    });

    test("should handle undefined or empty strings", () => {
      expect(sanitizeSearchQuery(undefined)).toBe("");
      expect(sanitizeSearchQuery("  ")).toBe("");
    });
  });
});
