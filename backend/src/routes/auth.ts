import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { prisma } from "../db";
import { validateEmail } from "../utils/validation";

const JWT_SECRET = process.env.JWT_SECRET || "posify-secret-key";

export const authRoutes = new Elysia({ prefix: "/api/auth" })
  .use(
    jwt({
      name: "jwt",
      secret: JWT_SECRET,
      exp: "7d",
    })
  )
  .post(
    "/register",
    async ({ body, set }) => {
      const { name, email, password, role } = body;

      if (!validateEmail(email)) {
        set.status = 400;
        return { success: false, message: "Format email tidak valid" };
      }

      if (password.length < 4) {
        set.status = 400;
        return { success: false, message: "Password minimal 4 karakter" };
      }

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        set.status = 409;
        return { success: false, message: "Email sudah terdaftar" };
      }

      // Hash password using Bun.password
      const hashedPassword = await Bun.password.hash(password);

      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: role === "ADMIN" ? "ADMIN" : "CASHIER",
        },
      });

      return {
        success: true,
        message: "Registrasi pengguna berhasil",
        data: { id: user.id, name: user.name, email: user.email, role: user.role },
      };
    },
    {
      body: t.Object({
        name: t.String({ minLength: 2 }),
        email: t.String(),
        password: t.String(),
        role: t.Optional(t.String()),
      }),
    }
  )
  .post(
    "/login",
    async ({ body, set, jwt }) => {
      const { email, password } = body;

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        set.status = 401;
        return { success: false, message: "Email atau password salah" };
      }

      const isPasswordValid = await Bun.password.verify(password, user.password);
      if (!isPasswordValid) {
        set.status = 401;
        return { success: false, message: "Email atau password salah" };
      }

      const token = await jwt.sign({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      });

      return {
        success: true,
        message: "Login berhasil",
        data: {
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        },
      };
    },
    {
      body: t.Object({
        email: t.String(),
        password: t.String(),
      }),
    }
  )
  .get("/me", async ({ headers, set, jwt }) => {
    const authHeader = headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      set.status = 401;
      return { success: false, message: "Token tidak ditemukan" };
    }

    const token = authHeader.split(" ")[1];
    const payload = await jwt.verify(token);

    if (!payload || !payload.id) {
      set.status = 401;
      return { success: false, message: "Token tidak valid atau kedaluwarsa" };
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.id as string },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    if (!user) {
      set.status = 404;
      return { success: false, message: "Pengguna tidak ditemukan" };
    }

    return { success: true, data: user };
  });
