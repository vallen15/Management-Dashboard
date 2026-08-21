import { Elysia, t } from "elysia";
import { prisma } from "../db";
import { validateProductInput, sanitizeSearchQuery } from "../utils/validation";
import { isLowStock } from "../utils/calculations";

export const productRoutes = new Elysia({ prefix: "/api/products" })
  .get(
    "/",
    async ({ query }) => {
      const { search, categoryId, lowStock, page = "1", limit = "50" } = query;
      const cleanSearch = sanitizeSearchQuery(search);

      const pageNum = Math.max(1, parseInt(page as string) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 50));
      const skip = (pageNum - 1) * limitNum;

      try {
        const where: any = {};

        if (cleanSearch) {
          where.OR = [
            { name: { contains: cleanSearch, mode: "insensitive" } },
            { code: { contains: cleanSearch, mode: "insensitive" } },
          ];
        }

        if (categoryId) {
          where.categoryId = categoryId;
        }

        const totalCount = await prisma.product.count({ where });

        const products = await prisma.product.findMany({
          where,
          include: {
            category: {
              select: { id: true, name: true },
            },
          },
          orderBy: { name: "asc" },
          skip,
          take: limitNum,
        });

        let filteredProducts = products.map((p) => ({
          ...p,
          isLowStock: isLowStock(p.stock, p.minStock),
        }));

        if (lowStock === "true") {
          filteredProducts = filteredProducts.filter((p) => p.isLowStock);
        }

        return {
          success: true,
          data: filteredProducts,
          pagination: {
            total: totalCount,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(totalCount / limitNum),
          },
        };
      } catch (err: any) {
        console.warn("⚠️ [Database Offline/Notice]: Returning empty product array fallback");
        return {
          success: true,
          data: [],
          pagination: { total: 0, page: pageNum, limit: limitNum, totalPages: 0 },
          warning: "Database PostgreSQL offline atau belum terhubung",
        };
      }
    },
    {
      query: t.Object({
        search: t.Optional(t.String()),
        categoryId: t.Optional(t.String()),
        lowStock: t.Optional(t.String()),
        page: t.Optional(t.String()),
        limit: t.Optional(t.String()),
      }),
    }
  )
  .get("/:id", async ({ params: { id }, set }) => {
    try {
      const product = await prisma.product.findUnique({
        where: { id },
        include: { category: true },
      });

      if (!product) {
        set.status = 404;
        return { success: false, message: "Produk tidak ditemukan" };
      }

      return {
        success: true,
        data: {
          ...product,
          isLowStock: isLowStock(product.stock, product.minStock),
        },
      };
    } catch (err: any) {
      set.status = 500;
      return { success: false, message: `Gagal memuat detail produk: ${err.message}` };
    }
  })
  .post(
    "/",
    async ({ body, set }) => {
      const validation = validateProductInput(body);
      if (!validation.valid) {
        set.status = 400;
        return { success: false, message: validation.error };
      }

      try {
        const existingCode = await prisma.product.findUnique({
          where: { code: body.code },
        });

        if (existingCode) {
          set.status = 409;
          return { success: false, message: "Kode produk sudah terdaftar" };
        }

        const category = await prisma.category.findUnique({
          where: { id: body.categoryId },
        });

        if (!category) {
          set.status = 404;
          return { success: false, message: "Kategori yang dipilih tidak ditemukan" };
        }

        const product = await prisma.product.create({
          data: {
            code: body.code.trim().toUpperCase(),
            name: body.name.trim(),
            description: body.description,
            price: body.price,
            costPrice: body.costPrice ?? 0,
            stock: body.stock,
            minStock: body.minStock ?? 5,
            categoryId: body.categoryId,
          },
          include: { category: true },
        });

        return {
          success: true,
          message: "Produk berhasil ditambahkan",
          data: product,
        };
      } catch (err: any) {
        set.status = 500;
        return { success: false, message: `Gagal menambahkan produk: ${err.message}` };
      }
    },
    {
      body: t.Object({
        code: t.String(),
        name: t.String(),
        description: t.Optional(t.String()),
        price: t.Number(),
        costPrice: t.Optional(t.Number()),
        stock: t.Number(),
        minStock: t.Optional(t.Number()),
        categoryId: t.String(),
      }),
    }
  )
  .put(
    "/:id",
    async ({ params: { id }, body, set }) => {
      try {
        const product = await prisma.product.findUnique({ where: { id } });
        if (!product) {
          set.status = 404;
          return { success: false, message: "Produk tidak ditemukan" };
        }

        if (body.code && body.code !== product.code) {
          const existingCode = await prisma.product.findUnique({
            where: { code: body.code },
          });
          if (existingCode) {
            set.status = 409;
            return { success: false, message: "Kode produk sudah digunakan produk lain" };
          }
        }

        if (body.categoryId) {
          const category = await prisma.category.findUnique({
            where: { id: body.categoryId },
          });
          if (!category) {
            set.status = 404;
            return { success: false, message: "Kategori tidak ditemukan" };
          }
        }

        const updated = await prisma.product.update({
          where: { id },
          data: {
            ...(body.code && { code: body.code.trim().toUpperCase() }),
            ...(body.name && { name: body.name.trim() }),
            ...(body.description !== undefined && { description: body.description }),
            ...(body.price !== undefined && { price: body.price }),
            ...(body.costPrice !== undefined && { costPrice: body.costPrice }),
            ...(body.stock !== undefined && { stock: body.stock }),
            ...(body.minStock !== undefined && { minStock: body.minStock }),
            ...(body.categoryId && { categoryId: body.categoryId }),
          },
          include: { category: true },
        });

        return {
          success: true,
          message: "Produk berhasil diperbarui",
          data: updated,
        };
      } catch (err: any) {
        set.status = 500;
        return { success: false, message: `Gagal memperbarui produk: ${err.message}` };
      }
    },
    {
      body: t.Object({
        code: t.Optional(t.String()),
        name: t.Optional(t.String()),
        description: t.Optional(t.String()),
        price: t.Optional(t.Number()),
        costPrice: t.Optional(t.Number()),
        stock: t.Optional(t.Number()),
        minStock: t.Optional(t.Number()),
        categoryId: t.Optional(t.String()),
      }),
    }
  )
  .delete("/:id", async ({ params: { id }, set }) => {
    try {
      const product = await prisma.product.findUnique({ where: { id } });

      if (!product) {
        set.status = 404;
        return { success: false, message: "Produk tidak ditemukan" };
      }

      await prisma.product.delete({ where: { id } });
      return {
        success: true,
        message: "Produk berhasil dihapus",
      };
    } catch (err: any) {
      set.status = 400;
      return {
        success: false,
        message: "Gagal menghapus produk. Produk mungkin memiliki riwayat transaksi.",
      };
    }
  });
