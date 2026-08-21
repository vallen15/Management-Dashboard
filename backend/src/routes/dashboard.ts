import { Elysia } from "elysia";
import { prisma } from "../db";

export const dashboardRoutes = new Elysia({ prefix: "/api/dashboard" })
  .get("/stats", async () => {
    try {
      // 1. KPI Cards
      const totalTransactions = await prisma.transaction.count();
      const totalProducts = await prisma.product.count();

      const revenueAggregate = await prisma.transaction.aggregate({
        _sum: { totalAmount: true },
        where: { paymentStatus: "COMPLETED" },
      });
      const totalRevenue = revenueAggregate._sum.totalAmount || 0;

      // Low stock count
      const allProducts = await prisma.product.findMany({
        select: { stock: true, minStock: true },
      });
      const lowStockCount = allProducts.filter((p) => p.stock <= p.minStock).length;

      // Total active customers
      const totalCustomers = await prisma.customer.count();

      // 2. Recent Transactions (last 5)
      const recentTransactions = await prisma.transaction.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          customer: { select: { name: true } },
        },
      });

      // 3. Top Selling Products
      const topSellingItems = await prisma.transactionItem.groupBy({
        by: ["productId", "productName"],
        _sum: { quantity: true, subtotal: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 5,
      });

      // 4. Low Stock Products Warning list
      const lowStockProducts = await prisma.product.findMany({
        where: { stock: { lte: 5 } },
        take: 5,
        select: { id: true, code: true, name: true, stock: true, minStock: true },
      });

      // 5. Monthly Sales Aggregation (for chart)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
      sixMonthsAgo.setDate(1);
      sixMonthsAgo.setHours(0, 0, 0, 0);

      const pastTransactions = await prisma.transaction.findMany({
        where: {
          createdAt: { gte: sixMonthsAgo },
          paymentStatus: "COMPLETED",
        },
        select: { createdAt: true, totalAmount: true },
      });

      // Group sales by month
      const monthsMap: Record<string, { month: string; revenue: number; orders: number }> = {};
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        const label = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
        monthsMap[key] = { month: label, revenue: 0, orders: 0 };
      }

      pastTransactions.forEach((tx) => {
        const key = `${tx.createdAt.getFullYear()}-${String(tx.createdAt.getMonth() + 1).padStart(2, "0")}`;
        if (monthsMap[key]) {
          monthsMap[key].revenue += tx.totalAmount;
          monthsMap[key].orders += 1;
        }
      });

      const monthlySalesChart = Object.values(monthsMap);

      return {
        success: true,
        data: {
          summary: {
            totalRevenue,
            totalTransactions,
            totalProducts,
            lowStockCount,
            totalCustomers,
          },
          recentTransactions,
          topProducts: topSellingItems.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            totalSold: item._sum.quantity || 0,
            totalRevenue: item._sum.subtotal || 0,
          })),
          lowStockProducts,
          monthlySalesChart,
        },
      };
    } catch (err: any) {
      console.warn("⚠️ [Database Offline/Notice]: Returning default stats fallback");
      return {
        success: true,
        data: {
          summary: {
            totalRevenue: 0,
            totalTransactions: 0,
            totalProducts: 0,
            lowStockCount: 0,
            totalCustomers: 0,
          },
          recentTransactions: [],
          topProducts: [],
          lowStockProducts: [],
          monthlySalesChart: [],
        },
        warning: "Database PostgreSQL offline atau belum terhubung",
      };
    }
  });
