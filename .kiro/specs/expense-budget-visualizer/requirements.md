# Requirements Document

## Introduction

Expense & Budget Visualizer adalah aplikasi web berbasis mobile-first yang membantu pengguna melacak pengeluaran harian. Aplikasi ini menampilkan saldo total, riwayat transaksi, dan grafik visual pengeluaran berdasarkan kategori, dengan antarmuka berbahasa Indonesia dan format mata uang Rupiah (IDR). Seluruh data disimpan di browser menggunakan LocalStorage tanpa memerlukan backend. Aplikasi dibangun menggunakan HTML, CSS, dan Vanilla JavaScript murni.

## Glossary

- **App**: Aplikasi web Expense & Budget Visualizer
- **Transaksi**: Catatan pemasukan atau pengeluaran yang dibuat oleh pengguna
- **Kategori**: Pengelompokan transaksi berdasarkan jenis (misalnya: Makanan, Transportasi, Hiburan)
- **Kategori_Kustom**: Kategori yang dibuat sendiri oleh pengguna di luar kategori bawaan
- **Saldo**: Jumlah total dari semua pemasukan dikurangi semua pengeluaran
- **LocalStorage**: API penyimpanan browser yang digunakan untuk menyimpan data secara lokal di perangkat pengguna
- **Ringkasan_Bulanan**: Tampilan agregat transaksi yang dikelompokkan per bulan
- **Grafik_Kategori**: Representasi visual (diagram) dari distribusi pengeluaran per kategori
- **Tema**: Mode tampilan aplikasi, yaitu mode terang (light) atau mode gelap (dark)
- **IDR**: Indonesian Rupiah, mata uang yang digunakan dalam aplikasi

---

## Requirements

### Requirement 1: Manajemen Transaksi

**User Story:** Sebagai pengguna, saya ingin menambah, melihat, dan menghapus transaksi pemasukan maupun pengeluaran, agar saya dapat mencatat keuangan harian saya dengan mudah.

#### Acceptance Criteria

1. WHEN pengguna mengisi formulir transaksi dengan jumlah, jenis (pemasukan/pengeluaran), kategori, tanggal, dan deskripsi opsional, lalu menekan tombol simpan, THE App SHALL menyimpan transaksi ke LocalStorage dan memperbarui tampilan secara langsung.
2. WHEN pengguna menekan tombol hapus pada sebuah transaksi di riwayat, THE App SHALL menghapus transaksi tersebut dari LocalStorage dan memperbarui tampilan saldo serta grafik secara langsung.
3. THE App SHALL memvalidasi bahwa kolom jumlah transaksi berisi angka positif lebih dari nol sebelum menyimpan transaksi.
4. IF pengguna mengirimkan formulir transaksi dengan kolom wajib yang kosong, THEN THE App SHALL menampilkan pesan kesalahan dalam bahasa Indonesia tanpa menyimpan data.
5. IF pengguna mengirimkan formulir transaksi dengan jumlah yang bukan angka valid atau bernilai nol atau negatif, THEN THE App SHALL menampilkan pesan kesalahan validasi dalam bahasa Indonesia.
6. THE App SHALL menampilkan tanggal transaksi dengan format hari/bulan/tahun (DD/MM/YYYY) di riwayat transaksi.
7. THE App SHALL menampilkan semua nilai uang dalam format Rupiah Indonesia (contoh: Rp 150.000).

---

### Requirement 2: Tampilan Saldo dan Ringkasan Keuangan

**User Story:** Sebagai pengguna, saya ingin melihat saldo terkini, total pemasukan, dan total pengeluaran secara sekilas, agar saya dapat memahami kondisi keuangan saya dengan cepat.

#### Acceptance Criteria

1. THE App SHALL menampilkan saldo terkini yang dihitung sebagai total pemasukan dikurangi total pengeluaran dari semua transaksi yang tersimpan.
2. THE App SHALL menampilkan total pemasukan dan total pengeluaran secara terpisah di bagian ringkasan.
3. WHEN transaksi baru ditambahkan atau dihapus, THE App SHALL memperbarui tampilan saldo, total pemasukan, dan total pengeluaran tanpa perlu memuat ulang halaman.
4. WHILE saldo bernilai negatif, THE App SHALL menampilkan nilai saldo dengan warna merah untuk memberi peringatan visual kepada pengguna.
5. WHILE saldo bernilai nol atau positif, THE App SHALL menampilkan nilai saldo dengan warna hijau atau netral.

---

### Requirement 3: Riwayat Transaksi

**User Story:** Sebagai pengguna, saya ingin melihat daftar seluruh transaksi saya, agar saya dapat meninjau dan mengelola riwayat keuangan saya.

#### Acceptance Criteria

1. THE App SHALL menampilkan semua transaksi yang tersimpan dalam daftar riwayat, diurutkan berdasarkan tanggal terbaru terlebih dahulu.
2. WHEN tidak ada transaksi yang tersimpan, THE App SHALL menampilkan pesan kosong dalam bahasa Indonesia yang menginstruksikan pengguna untuk menambahkan transaksi pertama.
3. THE App SHALL menampilkan untuk setiap transaksi: jumlah uang dalam format IDR, jenis transaksi (pemasukan/pengeluaran), nama kategori, tanggal, dan deskripsi (jika ada).
4. THE App SHALL membedakan tampilan visual antara transaksi pemasukan dan pengeluaran menggunakan warna yang berbeda (misalnya hijau untuk pemasukan, merah untuk pengeluaran).

---

### Requirement 4: Grafik Pengeluaran per Kategori

**User Story:** Sebagai pengguna, saya ingin melihat grafik visual distribusi pengeluaran saya per kategori, agar saya dapat mengetahui ke mana uang saya pergi.

#### Acceptance Criteria

1. THE App SHALL menampilkan Grafik_Kategori berupa diagram lingkaran (pie chart) atau diagram batang (bar chart) yang merepresentasikan persentase pengeluaran per kategori.
2. WHEN transaksi baru ditambahkan, diubah, atau dihapus, THE App SHALL memperbarui Grafik_Kategori secara langsung tanpa memuat ulang halaman.
3. WHEN tidak ada data pengeluaran yang tersedia, THE App SHALL menampilkan pesan informatif dalam bahasa Indonesia di area grafik sebagai pengganti grafik kosong.
4. THE App SHALL menampilkan legenda yang menunjukkan nama kategori beserta nilai persentase atau nominal di setiap segmen atau batang grafik.
5. THE App SHALL mengimplementasikan Grafik_Kategori menggunakan Canvas API atau SVG tanpa ketergantungan pada library grafik eksternal.

---

### Requirement 5: Manajemen Kategori Kustom

**User Story:** Sebagai pengguna, saya ingin menambahkan kategori pengeluaran sendiri di luar kategori bawaan, agar saya dapat menyesuaikan pencatatan dengan kebutuhan pribadi saya.

#### Acceptance Criteria

1. THE App SHALL menyediakan kategori bawaan minimal: Makanan & Minuman, Transportasi, Tagihan & Utilitas, Hiburan, Kesehatan, Belanja, Lain-lain.
2. WHEN pengguna mengisi nama Kategori_Kustom baru dan menekan tombol tambah kategori, THE App SHALL menyimpan kategori baru ke LocalStorage dan menampilkannya di daftar pilihan kategori.
3. IF pengguna mencoba menyimpan Kategori_Kustom dengan nama yang sama persis (case-insensitive) dengan kategori yang sudah ada, THEN THE App SHALL menampilkan pesan kesalahan duplikasi dalam bahasa Indonesia dan tidak menyimpan kategori tersebut.
4. IF pengguna mencoba menyimpan Kategori_Kustom dengan nama kosong atau hanya spasi, THEN THE App SHALL menampilkan pesan kesalahan validasi dalam bahasa Indonesia.
5. WHEN pengguna menghapus sebuah Kategori_Kustom, THE App SHALL menampilkan konfirmasi sebelum menghapus dan, jika dikonfirmasi, memindahkan semua transaksi yang menggunakan kategori tersebut ke kategori "Lain-lain".
6. THE App SHALL menyimpan semua Kategori_Kustom yang dibuat pengguna ke LocalStorage sehingga kategori tersebut tetap tersedia setelah halaman dimuat ulang.

---

### Requirement 6: Ringkasan Bulanan

**User Story:** Sebagai pengguna, saya ingin melihat ringkasan pemasukan dan pengeluaran per bulan, agar saya dapat memantau tren keuangan saya dari waktu ke waktu.

#### Acceptance Criteria

1. THE App SHALL menampilkan tampilan Ringkasan_Bulanan yang mengagregasi semua transaksi berdasarkan bulan dan tahun.
2. THE App SHALL menampilkan untuk setiap bulan: total pemasukan, total pengeluaran, dan saldo bersih bulan tersebut dalam format IDR.
3. WHEN pengguna memilih sebuah bulan di tampilan Ringkasan_Bulanan, THE App SHALL menampilkan daftar transaksi yang hanya berasal dari bulan tersebut.
4. THE App SHALL mengurutkan tampilan Ringkasan_Bulanan dari bulan paling baru ke bulan paling lama.
5. WHEN tidak ada transaksi yang tersimpan, THE App SHALL menampilkan pesan kosong dalam bahasa Indonesia di tampilan Ringkasan_Bulanan.

---

### Requirement 7: Toggle Mode Gelap dan Terang

**User Story:** Sebagai pengguna, saya ingin beralih antara mode terang dan mode gelap, agar tampilan aplikasi nyaman digunakan dalam berbagai kondisi pencahayaan.

#### Acceptance Criteria

1. THE App SHALL menyediakan tombol toggle untuk beralih antara Tema mode terang dan mode gelap.
2. WHEN pengguna menekan tombol toggle Tema, THE App SHALL mengubah tampilan seluruh antarmuka ke mode yang dipilih secara instan tanpa memuat ulang halaman.
3. THE App SHALL menyimpan preferensi Tema yang dipilih pengguna ke LocalStorage.
4. WHEN halaman dimuat ulang, THE App SHALL menerapkan Tema yang terakhir dipilih pengguna secara otomatis.
5. IF tidak ada preferensi Tema yang tersimpan di LocalStorage, THEN THE App SHALL menggunakan preferensi sistem operasi pengguna (prefers-color-scheme) sebagai Tema awal.

---

### Requirement 8: Persistensi Data dan Pemuatan Ulang

**User Story:** Sebagai pengguna, saya ingin data transaksi dan pengaturan saya tetap tersimpan saat halaman dimuat ulang atau browser ditutup, agar saya tidak kehilangan data keuangan saya.

#### Acceptance Criteria

1. THE App SHALL menyimpan semua transaksi ke LocalStorage setiap kali data diubah (ditambah atau dihapus).
2. WHEN halaman dimuat, THE App SHALL membaca semua data dari LocalStorage dan menampilkan transaksi, saldo, grafik, dan kategori kustom sesuai data yang tersimpan.
3. IF LocalStorage tidak tersedia di browser pengguna, THEN THE App SHALL menampilkan pesan peringatan dalam bahasa Indonesia bahwa data tidak dapat disimpan.
4. THE App SHALL menyimpan data dalam format JSON yang valid di LocalStorage.

---

### Requirement 9: Antarmuka Responsif dan Mobile-Friendly

**User Story:** Sebagai pengguna, saya ingin menggunakan aplikasi ini dengan nyaman di perangkat mobile maupun desktop, agar saya dapat mencatat pengeluaran kapan saja dan di mana saja.

#### Acceptance Criteria

1. THE App SHALL menggunakan tata letak responsif yang menyesuaikan tampilan untuk lebar layar mulai dari 320px (mobile kecil) hingga 1440px (desktop lebar).
2. THE App SHALL memastikan semua elemen interaktif (tombol, input, link) memiliki area sentuh minimal 44x44 piksel sesuai panduan aksesibilitas mobile.
3. THE App SHALL menampilkan navigasi antar bagian (ringkasan, riwayat, grafik, ringkasan bulanan) yang dapat diakses dengan mudah di layar kecil, misalnya dengan tab navigasi bawah atau menu sederhana.
4. THE App SHALL memuat seluruh antarmuka dalam waktu kurang dari 3 detik pada koneksi internet standar.
5. THE App SHALL dapat dijalankan sepenuhnya sebagai file HTML statis tanpa memerlukan server backend.
