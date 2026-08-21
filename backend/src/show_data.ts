import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });

  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { name: "asc" },
  });

  const customers = await prisma.customer.findMany({
    include: { _count: { select: { transactions: true } } },
    orderBy: { name: "asc" },
  });

  const transactions = await prisma.transaction.findMany({
    include: { customer: true, items: true },
    orderBy: { createdAt: "desc" },
  });

  console.log("=== DATABSE CONTENT REPORT ===");
  console.log(`\n📌 KATEGORI PRODUK (${categories.length}):`);
  categories.forEach((c) => console.log(`- [${c.name}] (${c._count.products} produk) - ${c.description || ''}`));

  console.log(`\n📌 KATALOG PRODUK (${products.length}):`);
  products.forEach((p) =>
    console.log(`- [${p.code}] ${p.name} | Rp${p.price.toLocaleString('id-ID')} | Stok: ${p.stock} | Kat: ${p.category?.name}`)
  );

  console.log(`\n📌 PELANGGAN CRM (${customers.length}):`);
  customers.forEach((cust) =>
    console.log(`- ${cust.name} | HP: ${cust.phone || '-'} | Total Belanja: Rp${cust.totalPurchases.toLocaleString('id-ID')} (${cust._count.transactions} tx)`)
  );

  console.log(`\n📌 RIWAYAT TRANSAKSI (${transactions.length}):`);
  transactions.forEach((tx) => {
    console.log(`- Faktur: ${tx.invoiceNo} | Pelanggan: ${tx.customer?.name || 'Umum'} | Total: Rp${tx.totalAmount.toLocaleString('id-ID')} | Metode: ${tx.paymentMethod} | Items: ${tx.items.length}`);
    tx.items.forEach((item) => {
      console.log(`   ↳ ${item.productName} x${item.quantity} @ Rp${item.unitPrice.toLocaleString('id-ID')} = Rp${item.subtotal.toLocaleString('id-ID')}`);
    });
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
