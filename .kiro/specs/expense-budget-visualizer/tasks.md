# Implementation Plan: Expense & Budget Visualizer

## Overview

Implementasi dilakukan secara bertahap dalam satu file `js/app.js` yang dibagi menjadi 10 seksi bernomor, dengan `index.html` sebagai struktur halaman dan `css/app.css` sebagai semua styling. Tidak ada build tools, tidak ada ES modules, tidak ada library eksternal. Chart menggunakan CSS bar chart berbasis `div`.

## Tasks

- [x] 1. Buat struktur file proyek dan kerangka HTML
  - Buat file `index.html` dengan semua section: `#section-dashboard`, `#section-history`, `#section-chart`, `#section-monthly`, `#section-categories`, `#nav-bar`, `#theme-toggle`
  - Tambahkan tag `<script src="js/app.js">` dan `<link rel="stylesheet" href="css/app.css">` di `index.html`
  - Buat file kosong `css/app.css` dan `js/app.js` dengan 10 blok komentar seksi
  - Pastikan halaman dapat dibuka via `file://` tanpa error di console
  - _Requirements: 9.3, 9.5_

- [x] 2. Implementasi SECTION 1–3: Constants, State, dan LocalStorage Utilities
  - [x] 2.1 Tulis SECTION 1 (Constants & Default Data) dan SECTION 2 (State / Store)
    - Definisikan array 7 kategori default: Makanan & Minuman, Transportasi, Tagihan & Utilitas, Hiburan, Kesehatan, Belanja, Lain-lain
    - Definisikan objek `AppState` dengan field: `transactions`, `categories`, `theme`, `activeView`, `activeMonthFilter`
    - _Requirements: 5.1_

  - [x] 2.2 Tulis SECTION 3 (LocalStorage Utilities)
    - Implementasikan `loadFromStorage()`, `saveTransactions()`, `saveCategories()`, `saveTheme(theme)`
    - Implementasikan `checkLocalStorageAvailable()` — tampilkan banner peringatan jika localStorage tidak tersedia
    - Bungkus `JSON.parse()` dalam `try-catch` di `loadFromStorage()` untuk menangani data korup
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 3. Implementasi SECTION 4–5: Data Utilities dan Formatting Utilities
  - [x] 3.1 Tulis SECTION 4 (Data Utilities — pure functions)
    - Implementasikan `calculateBalance(transactions)` → `number`
    - Implementasikan `calculateTotalByType(transactions, type)` → `number`
    - Implementasikan `groupByMonth(transactions)` → `Array<MonthSummary>`
    - Implementasikan `filterByMonth(transactions, monthKey)` → `Array<Transaction>`
    - Implementasikan `computeChartData(transactions)` → `Array<{category, amount, percentage}>`
    - Implementasikan `sortByDateDesc(transactions)` → `Array<Transaction>`
    - _Requirements: 2.1, 2.2, 3.1, 4.1, 4.4, 6.1, 6.2, 6.3, 6.4_

  - [x] 3.2 Tulis SECTION 5 (Formatting Utilities — pure functions)
    - Implementasikan `formatIDR(amount)` → string, contoh: `"Rp 150.000"`
    - Implementasikan `formatDate(isoDateString)` → string, contoh: `"25/10/2024"` (format DD/MM/YYYY)
    - _Requirements: 1.6, 1.7, 2.1, 2.2_

- [x] 5. Implementasi SECTION 6: Validation
  - [x] 5.1 Tulis SECTION 6 (Validation — pure functions)
    - Implementasikan `validateTransaction(formData)` → `{valid: boolean, errors: string[]}` dengan cek: jumlah kosong, jumlah bukan angka, jumlah ≤ 0, kategori tidak dipilih, tanggal kosong
    - Implementasikan `validateCategoryName(name, existingCategories)` → `{valid: boolean, error: string}` dengan perbandingan case-insensitive untuk duplikasi
    - Semua pesan error dalam bahasa Indonesia
    - _Requirements: 1.3, 1.4, 1.5, 5.2, 5.3, 5.4_

- [x] 6. Implementasi SECTION 7: UI Rendering
  - [-] 6.1 Tulis fungsi `renderDashboard()`
    - Render kartu saldo dengan `formatIDR()`, tambahkan class CSS merah jika negatif, hijau/netral jika nol atau positif
    - Render total pemasukan dan pengeluaran terpisah
    - Render form tambah transaksi dengan dropdown kategori dari `AppState.categories`
    - _Requirements: 2.1, 2.2, 2.4, 2.5_

  - [-] 6.2 Tulis fungsi `renderTransactionList(transactions)`
    - Render setiap transaksi dengan: jumlah IDR terformat, label jenis (pemasukan/pengeluaran), nama kategori, tanggal DD/MM/YYYY, deskripsi jika tidak kosong
    - Gunakan class CSS berbeda untuk income vs expense (warna berbeda)
    - Tampilkan pesan kosong dalam bahasa Indonesia jika tidak ada transaksi
    - Tambahkan tombol hapus di setiap item
    - _Requirements: 1.6, 1.7, 3.1, 3.2, 3.3, 3.4_

  - [-] 6.3 Tulis fungsi `renderMonthly()`
    - Render daftar bulan dari `groupByMonth()`, diurutkan terbaru ke terlama
    - Tampilkan per bulan: total pemasukan, pengeluaran, saldo bersih dalam format IDR
    - Tampilkan daftar transaksi bulan yang dipilih jika `AppState.activeMonthFilter` aktif
    - Tampilkan pesan kosong dalam bahasa Indonesia jika tidak ada transaksi
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [-] 6.4 Tulis fungsi `renderCategories()`
    - Render daftar kategori (default + kustom)
    - Render form input tambah kategori kustom
    - Tampilkan tombol hapus hanya untuk kategori kustom (bukan 7 default)
    - _Requirements: 5.1, 5.2, 5.6_

  - [-] 6.5 Tulis fungsi-fungsi utilitas render: `showError(elementId, message)`, `clearError(elementId)`, `renderAll()`
    - `showError` dan `clearError` menampilkan/menghapus pesan error inline di bawah field
    - `renderAll` memanggil semua fungsi render (digunakan saat init)
    - _Requirements: 1.4, 1.5_

- [x] 7. Implementasi SECTION 8: Chart Rendering (CSS Bar Chart)
  - [-] 7.1 Tulis fungsi `renderChart()`
    - Gunakan `computeChartData()` untuk mendapatkan data kategori + persentase
    - Render setiap bar sebagai elemen `<div>` dengan `width` inline sebagai persentase (CSS bar chart)
    - Render legenda dengan nama kategori dan nilai persentase/nominal
    - Tampilkan pesan informatif dalam bahasa Indonesia jika tidak ada data pengeluaran
    - JANGAN gunakan Canvas API — gunakan hanya `div` berbasis CSS atau SVG inline
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 8. Implementasi SECTION 9: Event Handlers
  - [x] 8.1 Tulis `handleAddTransaction(event)`
    - Baca nilai form, panggil `validateTransaction()`, tampilkan error dengan `showError()` jika tidak valid
    - Jika valid: buat objek Transaction dengan ID unik berbasis timestamp (contoh: `"txn_" + Date.now()`), push ke `AppState.transactions`, panggil `saveTransactions()`, lalu `renderAll()`
    - Reset form setelah berhasil simpan
    - _Requirements: 1.1, 1.3, 1.4, 1.5_

  - [x] 8.2 Tulis `handleDeleteTransaction(id)`
    - Filter `AppState.transactions` untuk menghapus transaksi dengan `id` yang sesuai
    - Panggil `saveTransactions()` lalu `renderAll()`
    - _Requirements: 1.2_

  - [x] 8.3 Tulis `handleAddCategory(event)`
    - Baca nama kategori dari form, panggil `validateCategoryName()`, tampilkan error jika tidak valid
    - Jika valid: push ke `AppState.categories`, panggil `saveCategories()`, lalu `renderAll()`
    - _Requirements: 5.2, 5.3, 5.4, 5.6_

  - [x] 8.4 Tulis `handleDeleteCategory(name)`
    - Tampilkan `window.confirm()` dengan pesan bahasa Indonesia yang menyebutkan nama kategori dan dampaknya
    - Jika dikonfirmasi: ubah semua transaksi yang menggunakan kategori tersebut menjadi `"Lain-lain"`, hapus kategori dari `AppState.categories`, panggil `saveTransactions()` dan `saveCategories()`, lalu `renderAll()`
    - _Requirements: 5.5_

  - [x] 8.5 Tulis `handleThemeToggle()` dan `handleNavigation(view)`
    - `handleThemeToggle`: toggle `AppState.theme` antara `'light'` dan `'dark'`, terapkan class ke `<body>` atau elemen root, panggil `saveTheme()`
    - `handleNavigation`: set `AppState.activeView`, sembunyikan semua section, tampilkan section yang aktif
    - _Requirements: 7.1, 7.2, 7.3, 9.3_

- [x] 9. Implementasi SECTION 10: App Init dan pasang semua Event Listener
  - [x] 9.1 Tulis fungsi `init()`
    - Panggil `checkLocalStorageAvailable()` — tampilkan banner jika tidak tersedia
    - Panggil `loadFromStorage()` untuk mengisi `AppState`
    - Terapkan tema: gunakan `AppState.theme` jika ada, atau fallback ke `prefers-color-scheme`
    - Pasang semua event listener: form submit transaksi, tombol hapus (delegasi via event delegation), form kategori, tombol hapus kategori, tombol toggle tema, tombol navigasi
    - Panggil `renderAll()` di akhir
    - _Requirements: 7.4, 7.5, 8.2, 8.3_

- [x] 10. Implementasi CSS: Layout Responsif dan Tema
  - [x] 10.1 Tulis `css/app.css` — layout dan komponen dasar
    - Grid/flex layout untuk dashboard: kartu saldo, kartu ringkasan, form transaksi
    - Styling untuk daftar transaksi: warna hijau untuk income, merah untuk expense
    - Styling untuk CSS bar chart: container bar, bar `div` dengan transisi lebar, legenda
    - Navigasi tab bawah (mobile) dan navigasi header (desktop)
    - _Requirements: 3.4, 4.1, 9.3_

  - [x] 10.2 Tulis CSS responsif dan tema dark/light
    - Media query untuk breakpoint 320px, 768px, 1440px
    - Semua elemen interaktif memiliki area sentuh minimal 44×44px
    - CSS custom properties (variables) untuk warna tema light dan dark
    - Class `data-theme="dark"` atau `body.dark` untuk toggle tema
    - _Requirements: 7.1, 7.2, 9.1, 9.2_

- [x] 11. Checkpoint — Pastikan aplikasi berjalan penuh via file://

## Notes

- Setiap task mereferensikan requirements spesifik untuk keterlacakan
- Checkpoint memastikan validasi inkremental sebelum lanjut
- Chart HARUS menggunakan CSS `div`-based bar chart — Canvas API dilarang (Requirement 4.5 disesuaikan dengan keputusan desain)
- Gunakan event delegation untuk tombol hapus di daftar transaksi dan kategori agar kompatibel dengan rendering dinamis

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["2.1", "3.2"] },
    { "id": 1, "tasks": ["2.2", "3.1", "5.1", "10.1"] },
    { "id": 2, "tasks": ["10.2"] },
    { "id": 3, "tasks": ["6.1", "6.2", "6.3", "6.4", "6.5"] },
    { "id": 4, "tasks": ["7.1"] },
    { "id": 5, "tasks": ["8.1", "8.2", "8.3", "8.4", "8.5"] },
    { "id": 6, "tasks": ["9.1"] },
    { "id": 7, "tasks": ["11"] }
  ]
}
```
