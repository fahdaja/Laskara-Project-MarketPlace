# Rencana Implementasi: Integrasi Backend Baru & Pembersihan Hardcoded Tersisa

## User Review Required

> [!IMPORTANT]
> - **Endpoint Baru untuk Detail Pesanan (`GET /orders/:id`)**: BE telah menambahkan endpoint ini untuk mengambil pesanan spesifik. Kita akan menggunakannya untuk Client dan Vendor (termasuk Associate) sehingga pemuatan data detail pesanan tidak perlu lagi mengambil semua pesanan (`/orders/my-orders` atau `/orders/incoming`) secara penuh.
> - **Analitik Finansial Finance Admin (`GET /transactions/financial-summary`)**: Kita akan menggunakannya pada `finance-admin/DashboardView.vue` untuk menyajikan data Escrow Balance, Revenue, dan Growth.
> - **Fitur Super Admin Baru (`/system-config/*`)**: BE menambahkan manajemen admin (create, suspend, delete) dan analitik transaksi. Kita akan mengintegrasikannya ke dashboard dan halaman manajemen user Super Admin.

## Proposed Changes

### Composables

#### [MODIFY] [useOrders.ts](file:///c:/Main/Projects/vendor_cci_project/vendor-marketplace-frontend/src/composables/useOrders.ts)
- Ganti implementasi `useOrderById` (client-side) dan `useOrderDetail` (vendor-side) agar langsung menembak ke `GET /orders/:id`.
- Terapkan invalidasi query pada key `['order', String(id)]` setelah mutasi.

#### [NEW] [useAdminAnalytics.ts](file:///c:/Main/Projects/vendor_cci_project/vendor-marketplace-frontend/src/composables/useAdminAnalytics.ts)
- Menyediakan query Tanstack untuk Super Admin analytics (`GET /system-config/analytics?period=...`) dan health check Midtrans (`GET /system-config/midtrans/health`).
- Menyediakan query untuk mengambil daftar pengguna admin/user (`GET /system-config/users`).
- Menyediakan mutasi untuk mengelola admin (`create-admin`, `suspend-admin`, `unsuspend-admin`, `delete-admin`).

---

### Client & Finance Admin Components

#### [MODIFY] [PaymentVerificationView.vue](file:///c:/Main/Projects/vendor_cci_project/vendor-marketplace-frontend/src/views/client/PaymentVerificationView.vue)
- Hapus pembacaan `localStorage` untuk `automated_chat_messages`.
- Ambil data requirement dari `order.value.requirements` setelah memuat pesanan untuk dipasang di simulated onboarding chat.

#### [MODIFY] [finance-admin/DashboardView.vue](file:///c:/Main/Projects/vendor_cci_project/vendor-marketplace-frontend/src/views/finance-admin/DashboardView.vue)
- Sambungkan query data finansial ke `GET /transactions/financial-summary` untuk mengisi total escrow, pendapatan platform (revenue), jumlah order terkirim, dan growth percentage secara dinamis.

#### [MODIFY] [finance-admin/ProfileView.vue](file:///c:/Main/Projects/vendor_cci_project/vendor-marketplace-frontend/src/views/finance-admin/ProfileView.vue)
- Ganti objek statis `adminInfo` dengan menggunakan data dari `useAuth()` composable.
- Ganti logout manual `localStorage.removeItem('userRole')` dengan memanggil metode `logout()` dari `useAuth()`.

---

### Associate Vendor Components

#### [MODIFY] [AssociateCatalogView.vue](file:///c:/Main/Projects/vendor_cci_project/vendor-marketplace-frontend/src/views/vendor/AssociateCatalogView.vue)
- Gunakan `useMyGigs()` dari `../../composables/useGigs`.
- Map daftar gig dinamis ke filter tab (`Semua`, `Menunggu`, `Disetujui`, `Ditolak`, `Draf`).

#### [MODIFY] [AssociateCatalogDetailView.vue](file:///c:/Main/Projects/vendor_cci_project/vendor-marketplace-frontend/src/views/vendor/AssociateCatalogDetailView.vue)
- Gunakan `useGigDetail(productId)` dan `useReviews(productId)`.
- Ganti plan name, compare table, review, dan detail layout agar menampilkan data dinamis dari API.

#### [MODIFY] [AssociateMessagesView.vue](file:///c:/Main/Projects/vendor_cci_project/vendor-marketplace-frontend/src/views/vendor/AssociateMessagesView.vue)
- Sambungkan dengan integrasi **StreamChat** riil (seperti `MessagesView.vue`) dan hubungkan pengiriman custom offer ke backend.

#### [MODIFY] [AssociateOrderDetailView.vue](file:///c:/Main/Projects/vendor_cci_project/vendor-marketplace-frontend/src/views/vendor/AssociateOrderDetailView.vue)
- Ekstrak numeric ID dari rute `route.params.id`.
- Gunakan `useOrderDetail(id)` yang kini menembak ke `GET /orders/:id`.
- Hubungkan aksi accept, decline, dan submit deliverables/proof ke endpoints backend.

---

### Super Admin Components

#### [MODIFY] [super-admin/DashboardView.vue](file:///c:/Main/Projects/vendor_cci_project/vendor-marketplace-frontend/src/views/super-admin/DashboardView.vue)
- Sambungkan dengan data analitik riil dari `GET /system-config/analytics`.
- Tampilkan indikator status kesehatan Midtrans secara dinamis dari `GET /system-config/midtrans/health`.

#### [MODIFY] [super-admin/UserManagementView.vue](file:///c:/Main/Projects/vendor_cci_project/vendor-marketplace-frontend/src/views/super-admin/UserManagementView.vue)
- Ganti pemuatan data `/users` dengan `GET /system-config/users`.
- Hubungkan aksi tambah admin, suspend/unsuspend, dan hapus admin dengan mutasi yang mengarah ke endpoint `/system-config/*`.

---

### Vendor Catalog Components

#### [MODIFY] [EditGigView.vue](file:///c:/Main/Projects/vendor_cci_project/vendor-marketplace-frontend/src/views/vendor/EditGigView.vue)
- Ganti `const reviews = ref([])` dengan `const { data: reviews } = useReviews(gigId)` untuk menampilkan review nyata.

## Verification Plan

### Automated/Build Verification
- Jalankan pemeriksaan compile/build untuk memastikan tidak ada kesalahan TypeScript:
  ```bash
  npm run build
  ```

### Manual Verification
- Masuk sebagai Super Admin, pastikan grafik dashboard dan manajemen admin berfungsi dengan data riil.
- Masuk sebagai Finance Admin, periksa rekap total escrow di dashboard.
- Masuk sebagai Vendor/Associate, pastikan operasional order dan katalog terisi dengan benar.
