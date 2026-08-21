# Posify - POS & Sales Management Dashboard

Aplikasi Dashboard Penjualan dan Point of Sale (POS) modern & efisien yang dibangun dengan stack **Bun + Elysia.js** (Backend API), **React + TypeScript + Vite + Tailwind CSS** (Frontend UI), dan **PostgreSQL + Prisma ORM** (Database & Data Layer).

---

## 🚀 Fitur Utama

- 📊 **Dashboard Analytics & KPI:** Ringkasan Total Omset Penjualan, Jumlah Transaksi, Peringatan Stok Menipis, Top Selling Products, serta Grafik Penjualan Bulanan (Recharts).
- 🛒 **Point of Sale (POS Kasir):** Checkout transaksi cepat dengan pencarian produk, filter kategori, cart drawer, penyesuaian kuantitas, kalkulasi PPN (11%) & diskon otomatis, pilihan pelanggan, serta modal cetak struk/invoice.
- 📦 **Manajemen Produk & Stok (CRUD):** Tambah, lihat, edit, dan hapus produk persediaan lengkap dengan kode unik, harga pokok (HPP), harga jual, serta indikator batas stok minimum (*low stock alert*).
- 📁 **Manajemen Kategori:** Pengelompokan katalog produk berdasarkan kategori.
- 👥 **Database Pelanggan / CRM (CRUD):** Manajemen data pelanggan terdaftar beserta akumulasi omset dan total transaksi.
- 🧾 **Riwayat Penjualan & Invoice:** Laporan lengkap seluruh transaksi dengan pencarian nomor faktur dan rincian itemized receipt.
- 🔐 **Autentikasi & Authorization:** Endpoint login & registrasi pengguna kasir/admin berbasis JWT token.
- 🧪 **Pengujian Otomatis (Testing Suite):** Pengujian unit (*Unit Tests*) & integrasi (*Integration Tests*) bawaan **Bun Test**.

---

## 🛠️ Tech Stack

- **Backend:** [Bun](https://bun.sh/) (v1.3+), [Elysia.js](https://elysiajs.com/) (v1.2+), Prisma ORM (v6+), JWT, CORS, Swagger API UI.
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Lucide React Icons, Recharts.
- **Database:** PostgreSQL (atau SQLite fallback untuk pengujian lokal instan).
- **Testing Framework:** Bun Test Runner.

---

## 📁 Struktur Direktori Workspace

Workspace utama berada di: `E:\semester 7\project magang\project 2`

```
project 2/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Skema Database PostgreSQL
│   │   └── seed.ts             # Script seed data awal
│   ├── src/
│   │   ├── routes/             # Controller rute API (auth, products, categories, customers, transactions, dashboard)
│   │   ├── utils/              # Kalkulasi bisnis & data sanitizer (Unit-tested)
│   │   ├── db.ts               # Instance Prisma Client
│   │   └── index.ts            # Main Elysia server entry point
│   ├── tests/
│   │   ├── unit/               # Unit Tests (Calculations & Validation)
│   │   └── integration/        # Integration Tests (API & DB layer)
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/         # DashboardView, POSView, ProductsView, CustomersView, TransactionsView, Navbar
│   │   ├── services/           # Service API Client (Fetch)
│   │   ├── types/              # Type definitions TypeScript
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml           # Setup PostgreSQL via Docker Container
├── README.md                   # Dokumentasi Lengkap
└── .gitignore
```

---

## ⚙️ Langkah Setup & Instalasi

### 1. Prasyarat System
Pastikan perangkat Anda sudah terpasang:
- **Bun**: `bun --version` (atau ikuti instalasi dari [bun.sh](https://bun.sh))
- **Node.js**: v18+ & **npm**: `npm -v`
- **PostgreSQL**: Server PostgreSQL aktif pada `localhost:5432` atau gunakan Docker Compose.

---

### 2. Memulai PostgreSQL via Docker (Opsional)
Jika Anda belum memiliki PostgreSQL lokal, Anda dapat menjalankannya dengan cepat via Docker:
```bash
docker-compose up -d
```
*Port default:* `5432`, *User:* `postgres`, *Password:* `postgres`, *Database:* `posify_db`.

---

### 3. Setup Backend (Bun + Elysia + Prisma)

1. Masuk ke folder `backend`:
   ```bash
   cd "E:\semester 7\project magang\project 2\backend"
   ```

2. Install dependensi:
   ```bash
   bun install
   ```

3. Buat file `.env` (atau salin dari `.env.example`):
   ```env
   PORT=3001
   JWT_SECRET=super-secret-posify-jwt-key-2026
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/posify_db?schema=public"
   ```

4. Jalankan Migrasi / Push Skema Database & Seed Data Sample:
   ```bash
   # Sinkronisasi skema ke PostgreSQL
   bun db:push

   # Seed data awal (Pengguna admin/kasir, kategori, produk & sampel transaksi)
   bun db:seed
   ```

5. Jalankan Backend Server (Development Mode):
   ```bash
   bun run dev
   ```
   Backend berjalan di: **`http://localhost:3001`**  
   Dokumentasi Swagger UI otomatis di: **`http://localhost:3001/swagger`**

---

### 4. Setup Frontend (React + TypeScript + Vite)

1. Buka terminal baru dan masuk ke folder `frontend`:
   ```bash
   cd "E:\semester 7\project magang\project 2\frontend"
   ```

2. Install dependensi:
   ```bash
   npm install
   ```

3. Jalankan Frontend Server:
   ```bash
   npm run dev
   ```
   Frontend berjalan di: **`http://localhost:3000`**

---

## 🧪 Panduan Pengujian (Testing Tasks)

Seluruh pengujian dilakukan menggunakan **Bun Test** runner bawaan Bun yang sangat cepat.

Masuk ke folder `backend` terlebih dahulu:
```bash
cd "E:\semester 7\project magang\project 2\backend"
```

### 1. Menjalankan Seluruh Suite Pengujian (Unit & Integration Tests)
```bash
bun test
```

### 2. Menjalankan Unit Testing
Menguji fungsi kalkulasi bisnis inti (subtotal, pajak, diskon, stok menipis, format faktur) dan validasi data request.
```bash
bun test tests/unit
```

### 3. Menjalankan Integration Testing
Menguji alur komunikasi rute API Elysia.js, penanganan status HTTP (200, 400, 404, 409), serta integrasi Prisma ORM database.
```bash
bun test tests/integration
```

---

## 📄 Dokumentasi API Endpoints

Semua response API mengembalikan format JSON standar:
```json
{
  "success": true,
  "message": "Pesan deskriptif",
  "data": { ... }
}
```

### 1. Autentikasi (`/api/auth`)
| Method | Endpoint | Deskripsi |
|---|---|---|
| `POST` | `/api/auth/register` | Mendaftarkan pengguna kasir/admin baru. |
| `POST` | `/api/auth/login` | Login & mendapatkan JWT Token. |
| `GET` | `/api/auth/me` | Memeriksa profil pengguna berdasarkan `Authorization: Bearer <token>`. |

### 2. Kategori Produk (`/api/categories`)
| Method | Endpoint | Deskripsi |
|---|---|---|
| `GET` | `/api/categories` | Mengambil daftar seluruh kategori beserta jumlah produk terikat. |
| `POST` | `/api/categories` | Membuat kategori produk baru. |
| `PUT` | `/api/categories/:id` | Memperbarui nama/deskripsi kategori. |
| `DELETE` | `/api/categories/:id` | Menghapus kategori (mencegah hapus jika ada produk terikat). |

### 3. Produk & Stok (`/api/products`)
| Method | Endpoint | Deskripsi |
|---|---|---|
| `GET` | `/api/products` | Mengambil daftar produk (dukungan pencarian `search`, filter `categoryId`, filter `lowStock=true`, & paginasi `page`, `limit`). |
| `GET` | `/api/products/:id` | Mengambil rincian produk tunggal. |
| `POST` | `/api/products` | Membuat produk baru (validasi kode produk unik & harga/stok non-negatif). |
| `PUT` | `/api/products/:id` | Memperbarui data atau stok produk. |
| `DELETE` | `/api/products/:id` | Menghapus produk. |

### 4. Pelanggan CRM (`/api/customers`)
| Method | Endpoint | Deskripsi |
|---|---|---|
| `GET` | `/api/customers` | Mengambil daftar pelanggan terdaftar. |
| `GET` | `/api/customers/:id` | Rincian pelanggan & riwayat 10 transaksi terakhir. |
| `POST` | `/api/customers` | Mendaftarkan pelanggan baru. |
| `PUT` | `/api/customers/:id` | Memperbarui informasi pelanggan. |
| `DELETE` | `/api/customers/:id` | Menghapus pelanggan. |

### 5. Transaksi POS Kasir (`/api/transactions`)
| Method | Endpoint | Deskripsi |
|---|---|---|
| `GET` | `/api/transactions` | Mengambil daftar riwayat transaksi (dukungan pencarian faktur & filter tanggal `startDate`, `endDate`). |
| `GET` | `/api/transactions/:id` | Mengambil rincian faktur transaksi itemized. |
| `POST` | `/api/transactions` | Memproses transaksi POS baru. Otomatis mengurangi stok barang, menghitung total, PPN, diskon, dan memperbarui omset pelanggan. |

**Contoh Payload POST `/api/transactions`:**
```json
{
  "items": [
    { "productId": "uuid-produk-1", "quantity": 2 },
    { "productId": "uuid-produk-2", "quantity": 1 }
  ],
  "paymentMethod": "QRIS",
  "discountAmount": 5000,
  "customerId": "uuid-pelanggan-opsional",
  "notes": "Pesanan dine-in"
}
```

### 6. Dashboard Analytics (`/api/dashboard`)
| Method | Endpoint | Deskripsi |
|---|---|---|
| `GET` | `/api/dashboard/stats` | Mengembalikan agregasi omset total, jumlah transaksi, barang stok menipis, top selling products, dan grafik bulanan. |

---

## 📌 Catatan Pengajuan Repositori GitHub
Untuk mengirimkan proyek ini ke GitHub:
1. Inisialisasi Git di workspace:
   ```bash
   cd "E:\semester 7\project magang\project 2"
   git init
   git add .
   git commit -m "feat: complete Posify POS & Sales Management Dashboard project with Elysia.js and React"
   ```
2. Hubungkan ke repositori GitHub Anda dan lakukan push:
   ```bash
   git remote add origin https://github.com/USERNAME/posify-dashboard.git
   git branch -M main
   git push -u origin main
   ```
