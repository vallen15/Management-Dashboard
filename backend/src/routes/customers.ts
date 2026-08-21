import { Elysia, t } from "elysia";
import { prisma } from "../db";
import { validateEmail } from "../utils/validation";

export const customerRoutes = new Elysia({ prefix: "/api/customers" })
  .get("/", async ({ query }) => {
    try {
      const searchParam = query?.search;
      const searchStr = typeof searchParam === "string" ? searchParam.trim().replace(/[%_]/g, "") : "";
      const where: any = searchStr
        ? {
            OR: [
              { name: { contains: searchStr } },
              { phone: { contains: searchStr } },
              { email: { contains: searchStr } },
            ],
          }
        : {};

      const customers = await prisma.customer.findMany({
        where,
        orderBy: { name: "asc" },
        include: {
          _count: { select: { transactions: true } },
        },
      });

      return {
        success: true,
        data: customers.map((c) => ({
          id: c.id,
          name: c.name,
          email: c.email || undefined,
          phone: c.phone || undefined,
          address: c.address || undefined,
          totalPurchases: c.totalPurchases || 0,
          transactionCount: c._count ? c._count.transactions : 0,
          createdAt: c.createdAt,
        })),
      };
    } catch (err: any) {
      console.warn("⚠️ [Customer Route Handler Notice]: Returning empty customer array");
      return {
        success: true,
        data: [],
      };
    }
  })
  .get("/:id", async ({ params: { id }, set }) => {
    try {
      const customer = await prisma.customer.findUnique({
        where: { id },
        include: {
          transactions: {
            orderBy: { createdAt: "desc" },
            take: 10,
          },
        },
      });

      if (!customer) {
        set.status = 404;
        return { success: false, message: "Pelanggan tidak ditemukan" };
      }

      return { success: true, data: customer };
    } catch (err: any) {
      set.status = 500;
      return { success: false, message: `Gagal memuat detail pelanggan: ${err.message}` };
    }
  })
  .post(
    "/",
    async ({ body, set }) => {
      const { name, email, phone, address } = body;

      if (!name || name.trim().length === 0) {
        set.status = 400;
        return { success: false, message: "Nama pelanggan wajib diisi" };
      }

      if (email && !validateEmail(email)) {
        set.status = 400;
        return { success: false, message: "Format email tidak valid" };
      }

      try {
        if (email) {
          const existingEmail = await prisma.customer.findUnique({ where: { email } });
          if (existingEmail) {
            set.status = 409;
            return { success: false, message: "Email pelanggan sudah terdaftar" };
          }
        }

        const customer = await prisma.customer.create({
          data: {
            name: name.trim(),
            email: email ? email.trim() : null,
            phone: phone ? phone.trim() : null,
            address: address ? address.trim() : null,
          },
        });

        return {
          success: true,
          message: "Pelanggan berhasil ditambahkan",
          data: customer,
        };
      } catch (err: any) {
        set.status = 500;
        return { success: false, message: `Gagal menambahkan pelanggan: ${err.message}` };
      }
    },
    {
      body: t.Object({
        name: t.String(),
        email: t.Optional(t.String()),
        phone: t.Optional(t.String()),
        address: t.Optional(t.String()),
      }),
    }
  )
  .put(
    "/:id",
    async ({ params: { id }, body, set }) => {
      try {
        const customer = await prisma.customer.findUnique({ where: { id } });
        if (!customer) {
          set.status = 404;
          return { success: false, message: "Pelanggan tidak ditemukan" };
        }

        if (body.email && body.email !== customer.email) {
          if (!validateEmail(body.email)) {
            set.status = 400;
            return { success: false, message: "Format email tidak valid" };
          }
          const existingEmail = await prisma.customer.findUnique({ where: { email: body.email } });
          if (existingEmail) {
            set.status = 409;
            return { success: false, message: "Email sudah digunakan pelanggan lain" };
          }
        }

        const updated = await prisma.customer.update({
          where: { id },
          data: {
            ...(body.name && { name: body.name.trim() }),
            ...(body.email !== undefined && { email: body.email ? body.email.trim() : null }),
            ...(body.phone !== undefined && { phone: body.phone ? body.phone.trim() : null }),
            ...(body.address !== undefined && { address: body.address ? body.address.trim() : null }),
          },
        });

        return {
          success: true,
          message: "Data pelanggan berhasil diperbarui",
          data: updated,
        };
      } catch (err: any) {
        set.status = 500;
        return { success: false, message: `Gagal memperbarui data pelanggan: ${err.message}` };
      }
    },
    {
      body: t.Object({
        name: t.Optional(t.String()),
        email: t.Optional(t.String()),
        phone: t.Optional(t.String()),
        address: t.Optional(t.String()),
      }),
    }
  )
  .delete("/:id", async ({ params: { id }, set }) => {
    try {
      const customer = await prisma.customer.findUnique({ where: { id } });
      if (!customer) {
        set.status = 404;
        return { success: false, message: "Pelanggan tidak ditemukan" };
      }

      await prisma.customer.delete({ where: { id } });

      return {
        success: true,
        message: "Pelanggan berhasil dihapus",
      };
    } catch (err: any) {
      set.status = 500;
      return { success: false, message: `Gagal menghapus pelanggan: ${err.message}` };
    }
  });
