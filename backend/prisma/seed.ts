import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Posify database...");

  // Clean existing data
  await prisma.transactionItem.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();

  // 1. Users
  const adminPassword = await Bun.password.hash("admin123");
  const cashierPassword = await Bun.password.hash("cashier123");

  const admin = await prisma.user.create({
    data: {
      name: "Administrator",
      email: "admin@posify.com",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  const cashier = await prisma.user.create({
    data: {
      name: "Kasir Utami",
      email: "kasir@posify.com",
      password: cashierPassword,
      role: "CASHIER",
    },
  });

  // 2. Categories
  const catMakanan = await prisma.category.create({
    data: { name: "Makanan & Camilan", description: "Aneka makanan saji dan camilan" },
  });
  const catMinuman = await prisma.category.create({
    data: { name: "Minuman", description: "Kopi, teh, dan aneka minuman segar" },
  });
  const catElektronik = await prisma.category.create({
    data: { name: "Elektronik & Aksesoris", description: "Perangkat elektronik dan aksesoris gadget" },
  });
  const catPakaian = await prisma.category.create({
    data: { name: "Pakaian & Fashion", description: "Pakaian pria, wanita, dan aksesoris fashion" },
  });

  // 3. Products
  const prod1 = await prisma.product.create({
    data: {
      code: "PRD-001",
      name: "Kopi Susu Gula Aren 250ml",
      description: "Kopi susu espresso segar dengan gula aren murni",
      price: 18000,
      costPrice: 8000,
      stock: 45,
      minStock: 10,
      categoryId: catMinuman.id,
    },
  });

  const prod2 = await prisma.product.create({
    data: {
      code: "PRD-002",
      name: "Teh Tarik Boba",
      description: "Teh tarik creamy manis dengan topping boba tapioka",
      price: 22000,
      costPrice: 10000,
      stock: 30,
      minStock: 5,
      categoryId: catMinuman.id,
    },
  });

  const prod3 = await prisma.product.create({
    data: {
      code: "PRD-003",
      name: "Nasi Goreng Spesial Posify",
      description: "Nasi goreng ayam dengan telur mata sapi dan kerupuk",
      price: 28000,
      costPrice: 14000,
      stock: 25,
      minStock: 5,
      categoryId: catMakanan.id,
    },
  });

  const prod4 = await prisma.product.create({
    data: {
      code: "PRD-004",
      name: "Roti Bakar Keju Cokelat",
      description: "Roti bakar empuk isi topping keju kraft dan cokelat nutella",
      price: 20000,
      costPrice: 9000,
      stock: 4, // low stock for testing alert!
      minStock: 5,
      categoryId: catMakanan.id,
    },
  });

  const prod5 = await prisma.product.create({
    data: {
      code: "PRD-005",
      name: "Mouse Wireless Logistics M185",
      description: "Mouse nirkabel 2.4GHz dengan ketahanan baterai tinggi",
      price: 145000,
      costPrice: 95000,
      stock: 12,
      minStock: 3,
      categoryId: catElektronik.id,
    },
  });

  const prod6 = await prisma.product.create({
    data: {
      code: "PRD-006",
      name: "Kaos Polos Cotton Combed 30s",
      description: "Kaos adem bahan 100% cotton combed warna hitam size L",
      price: 65000,
      costPrice: 35000,
      stock: 2, // low stock alert
      minStock: 5,
      categoryId: catPakaian.id,
    },
  });

  // 4. Customers
  const customer1 = await prisma.customer.create({
    data: {
      name: "Budi Santoso",
      email: "budi.santoso@example.com",
      phone: "081234567890",
      address: "Jl. Merdeka No. 45, Jakarta Selatan",
      totalPurchases: 110000,
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      name: "Siti Rahma",
      email: "siti.rahma@example.com",
      phone: "085678901234",
      address: "Jl. Mawar No. 12, Bandung",
      totalPurchases: 68000,
    },
  });

  // 5. Sample Transactions
  const tx1 = await prisma.transaction.create({
    data: {
      invoiceNo: "INV-20260819-0001",
      subtotal: 100000,
      taxAmount: 11000,
      discountAmount: 10000,
      totalAmount: 101000,
      paymentMethod: "QRIS",
      paymentStatus: "COMPLETED",
      notes: "Pelanggan makan di tempat",
      customerId: customer1.id,
      userId: cashier.id,
      items: {
        create: [
          {
            productId: prod1.id,
            productName: prod1.name,
            quantity: 2,
            unitPrice: prod1.price,
            subtotal: 36000,
          },
          {
            productId: prod3.id,
            productName: prod3.name,
            quantity: 2,
            unitPrice: prod3.price,
            subtotal: 56000,
          },
        ],
      },
    },
  });

  console.log("✅ Database seeding successfully completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
