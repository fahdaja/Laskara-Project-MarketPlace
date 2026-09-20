# Spesifikasi Integrasi API Verifikasi Vendor (Admin Validator)

Dokumen ini menjelaskan kebutuhan perubahan API backend untuk mendukung halaman **Antrian Verifikasi Vendor** pada panel Admin Validator, termasuk fitur tab status dan pagination.

---

## 1. Masalah Saat Ini
1. **Endpoint Hanya untuk Pending**: Backend baru menyediakan `GET /admin/validator/merchants/pending` yang mengembalikan *seluruh* data merchant berstatus `PENDING_VERIFICATION`.
2. **Tidak Ada Pagination**: Backend belum mendukung query `page` dan `limit` untuk data merchant.
3. **Tab Statis**: Frontend memiliki tab **All**, **Disetujui**, **Menunggu**, dan **Ditolak** tetapi belum bisa berfungsi karena keterbatasan filter dari API backend.

---

## 2. Usulan Perubahan API

### **GET `/admin/validator/merchants`**
Mengambil daftar merchant dengan dukungan filter status dan pagination.

* **Role yang Diizinkan**: `ADMIN_VALIDATOR`, `SUPER_ADMIN`
* **Headers**: `Authorization: Bearer <token>`
* **Query Parameters**:
  * `status` (opsional): Filter status merchant.
    * Nilai: `PENDING_VERIFICATION` | `ACTIVE` (Disetujui) | `REJECTED` (Ditolak) | `ALL` (default)
  * `page` (opsional): Halaman keberapa yang ingin diambil (default: `1`).
  * `limit` (opsional): Jumlah data per halaman (default: `10`).

#### **Contoh Request**:
```http
GET /admin/validator/merchants?status=PENDING_VERIFICATION&page=1&limit=10
Authorization: Bearer <token>
```

#### **Contoh Response (200 OK)**:
```json
{
  "data": [
    {
      "id": 1,
      "userId": 5,
      "shopName": "Creative Studio",
      "description": "Jasa desain grafis profesional",
      "logoUrl": "https://example.com/logo.png",
      "bannerUrl": "https://example.com/banner.png",
      "status": "PENDING_VERIFICATION",
      "kybDocuments": "{\"kybDocumentUrl\":\"https://example.com/doc.pdf\",\"portfolioUrl\":\"https://behance.net/creative\"}",
      "rejectionReason": null,
      "badge": "NEWCOMER",
      "createdAt": "2026-06-09T15:13:12.000Z",
      "user": {
        "fullName": "Budi Santoso",
        "email": "budi@example.com"
      }
    }
  ],
  "meta": {
    "total": 45,
    "page": 1,
    "lastPage": 5,
    "limit": 10
  }
}
```

---

## 3. Catatan Implementasi di Backend (`NestJS` / `Prisma`)

1. **Query di Controller**:
   Dapatkan query parameters menggunakan `@Query()` decorator di `admin-validator.controller.ts`.
   
2. **Prisma Query**:
   Gunakan properti `skip` dan `take` untuk pagination:
   ```typescript
   const skip = (page - 1) * limit;
   const take = limit;
   
   const whereClause: any = {};
   if (status && status !== 'ALL') {
     whereClause.status = status; // sesuaikan dengan enum MerchantStatus
   }
   
   const [data, total] = await this.prisma.$transaction([
     this.prisma.merchant.findMany({
       where: whereClause,
       skip,
       take,
       include: { user: { select: { fullName: true, email: true } } },
       orderBy: { createdAt: 'desc' }
     }),
     this.prisma.merchant.count({ where: whereClause })
   ]);
   ```
