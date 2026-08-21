import { Elysia, t } from "elysia";
import { prisma } from "../db";
import {
  calculateItemSubtotal,
  calculateOrderSubtotal,
  calculateTax,
  calculateFinalTotal,
  formatInvoiceNumber,
} from "../utils/calculations";
import { validateTransactionInput } from "../utils/validation";

export const transactionRoutes = new Elysia({ prefix: "/api/transactions" })
  .get(
    "/",
    async ({ query }) => {
      const { search, startDate, endDate, page = "1", limit = "20" } = query;

      const pageNum = Math.max(1, parseInt(page as string) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20));
      const skip = (pageNum - 1) * limitNum;

      const where: any = {};

      if (search) {
        where.invoiceNo = { contains: search.trim(), mode: "insensitive" };
      }

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate);
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          where.createdAt.lte = end;
        }
      }

      const totalCount = await prisma.transaction.count({ where });

      const transactions = await prisma.transaction.findMany({
        where,
        include: {
          customer: { select: { id: true, name: true, phone: true } },
          user: { select: { id: true, name: true } },
          items: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNum,
      });

      return {
        success: true,
        data: transactions,
        pagination: {
          total: totalCount,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(totalCount / limitNum),
        },
      };
    },
    {
      query: t.Object({
        search: t.Optional(t.String()),
        startDate: t.Optional(t.String()),
        endDate: t.Optional(t.String()),
        page: t.Optional(t.String()),
        limit: t.Optional(t.String()),
      }),
    }
  )
  .get("/:id", async ({ params: { id }, set }) => {
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        customer: true,
        user: { select: { id: true, name: true, email: true } },
        items: {
          include: {
            product: { select: { id: true, code: true, name: true } },
          },
        },
      },
    });

    if (!transaction) {
      set.status = 404;
      return { success: false, message: "Transaksi tidak ditemukan" };
    }

    return { success: true, data: transaction };
  })
  .post(
    "/",
    async ({ body, set }) => {
      const validation = validateTransactionInput(body);
      if (!validation.valid) {
        set.status = 400;
        return { success: false, message: validation.error };
      }

      const { items, paymentMethod = "CASH", discountAmount = 0, customerId, userId, notes } = body;

      // Fetch products and verify stock
      const productIds = items.map((i) => i.productId);
      const dbProducts = await prisma.product.findMany({
        where: { id: { in: productIds } },
      });

      if (dbProducts.length !== productIds.length) {
        set.status = 400;
        return { success: false, message: "Satu atau lebih produk tidak ditemukan" };
      }

      const productMap = new Map(dbProducts.map((p) => [p.id, p]));

      // Verify stock availability
      for (const item of items) {
        const product = productMap.get(item.productId)!;
        if (product.stock < item.quantity) {
          set.status = 400;
          return {
            success: false,
            message: `Stok produk '${product.name}' tidak mencukupi (sisa: ${product.stock}, diminta: ${item.quantity})`,
          };
        }
      }

      // Calculate totals
      const preparedItems = items.map((item) => {
        const product = productMap.get(item.productId)!;
        const subtotal = calculateItemSubtotal(product.price, item.quantity);
        return {
          productId: product.id,
          productName: product.name,
          quantity: item.quantity,
          unitPrice: product.price,
          subtotal,
        };
      });

      const subtotal = calculateOrderSubtotal(
        preparedItems.map((i) => ({ price: i.unitPrice, quantity: i.quantity }))
      );
      const taxAmount = calculateTax(subtotal, 0.11);
      const totalAmount = calculateFinalTotal(subtotal, taxAmount, discountAmount);

      // Generate invoice number based on total transactions today
      const countToday = await prisma.transaction.count();
      const invoiceNo = formatInvoiceNumber(countToday + 1);

      // Create transaction inside interactive transaction to update stock cleanly
      try {
        const result = await prisma.$transaction(async (tx) => {
          // Create main transaction record
          const transaction = await tx.transaction.create({
            data: {
              invoiceNo,
              subtotal,
              taxAmount,
              discountAmount,
              totalAmount,
              paymentMethod: paymentMethod as any,
              paymentStatus: "COMPLETED",
              notes,
              customerId: customerId || null,
              userId: userId || null,
              items: {
                create: preparedItems,
              },
            },
            include: {
              items: true,
              customer: true,
            },
          });

          // Deduct product stock
          for (const item of preparedItems) {
            await tx.product.update({
              where: { id: item.productId },
              data: {
                stock: { decrement: item.quantity },
              },
            });
          }

          // Update customer total purchases if customer assigned
          if (customerId) {
            await tx.customer.update({
              where: { id: customerId },
              data: {
                totalPurchases: { increment: totalAmount },
              },
            });
          }

          return transaction;
        });

        return {
          success: true,
          message: "Transaksi berhasil dibuat",
          data: result,
        };
      } catch (err: any) {
        set.status = 500;
        return {
          success: false,
          message: `Gagal memproses transaksi: ${err.message}`,
        };
      }
    },
    {
      body: t.Object({
        items: t.Array(
          t.Object({
            productId: t.String(),
            quantity: t.Number({ minimum: 1 }),
          })
        ),
        paymentMethod: t.Optional(t.String()),
        discountAmount: t.Optional(t.Number({ minimum: 0 })),
        customerId: t.Optional(t.String()),
        userId: t.Optional(t.String()),
        notes: t.Optional(t.String()),
      }),
    }
  );
