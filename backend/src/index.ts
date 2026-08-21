import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { authRoutes } from "./routes/auth";
import { categoryRoutes } from "./routes/categories";
import { productRoutes } from "./routes/products";
import { customerRoutes } from "./routes/customers";
import { transactionRoutes } from "./routes/transactions";
import { dashboardRoutes } from "./routes/dashboard";

const PORT = Number(process.env.PORT) || 3001;

export const app = new Elysia()
  .use(cors())
  .use(
    swagger({
      documentation: {
        info: {
          title: "Posify API Documentation",
          version: "1.0.0",
          description: "API Backend POS & Sales Management Dashboard built with Bun & Elysia.js",
        },
      },
    })
  )
  .onError(({ code, error, set }) => {
    if (code === "NOT_FOUND") {
      set.status = 404;
      return { success: false, message: "Endpoint tidak ditemukan" };
    }
    if (code === "VALIDATION") {
      set.status = 400;
      return {
        success: false,
        message: "Validasi request gagal",
        errors: error.all,
      };
    }
    set.status = 500;
    return {
      success: false,
      message: "Internal Server Error",
      error: error.message,
    };
  })
  .get("/", () => ({
    success: true,
    message: "Posify POS & Sales API Server is running",
    swagger: `/swagger`,
  }))
  .use(authRoutes)
  .use(categoryRoutes)
  .use(productRoutes)
  .use(customerRoutes)
  .use(transactionRoutes)
  .use(dashboardRoutes)
  .listen({
    port: PORT,
    hostname: "0.0.0.0",
  });

console.log(`🚀 Posify API server running at http://0.0.0.0:${PORT}`);
console.log(`📄 Swagger documentation at http://0.0.0.0:${PORT}/swagger`);
