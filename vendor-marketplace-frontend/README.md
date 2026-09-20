# Vendor Marketplace Frontend

## Requirements

Sebelum memulai, pastikan perangkat sudah terinstal dengan software ini:
- Node.js (disarankan versi 18 atau yang lebih baru)
- npm (biasanya terinstal bersama Node.js)
- Git (untuk manajemen repositori)

## Langkah Instalasi dan Penggunaan

1. Lakukan clone repositori proyek ini ke direktori perangkat Anda menggunakan perintah berikut:
   ```bash
   git clone <URL_REPOSITORI>
   ```

2. Pindah ke dalam folder proyek melalui terminal:
   ```bash
   cd vendor-marketplace
   ```

3. Instal seluruh dependensi yang dibutuhkan oleh proyek:
   ```bash
   npm install
   ```

4. Jalankan server pengembangan lokal (development server):
   ```bash
   npm run dev
   ```

Setelah perintah dijalankan dan berhasil, aplikasi akan dapat diakses secara lokal. Silakan buka tautan yang muncul pada terminal (biasanya berada di `http://localhost:5173`) menggunakan peramban (browser) Anda.

## Pembuatan Build Produksi

Apabila pengembangan telah selesai dan Anda ingin menyiapkan aplikasi untuk environment produksi, buat build statis dengan perintah:
```bash
npm run build
```

Hasil kompilasi file yang telah teroptimasi akan berada di dalam folder `dist`. Anda dapat menguji pratinjau hasil build secara lokal dengan perintah:
```bash
npm run preview
```

## Gambaran Struktur Direktori

Berikut adalah struktur direktori utama yang sering dikelola selama proses pengembangan:
- `src/assets`     : Tempat untuk meletakkan file statis seperti CSS global.
- `src/components` : Tempat menyimpan bagian-bagian UI yang dapat digunakan kembali (reusable components).
- `src/layouts`    : Berisi template dasar kerangka halaman aplikasi, contohnya tampilan sidebar dan header untuk Super Admin.
- `src/views`      : Menyimpan halaman-halaman utuh dari sistem aplikasi.
- `src/router`     : Logic dan pendaftaran navigasi halaman menggunakan Vue Router.
