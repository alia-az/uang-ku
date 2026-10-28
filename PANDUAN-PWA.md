# copia. PWA untuk iPhone

## 1. Update website GitHub Pages
1. Ekstrak ZIP dan buka folder `uang-firebase`.
2. Upload seluruh ISI folder itu ke lokasi website GitHub Pages yang sekarang. `index.html`, `manifest.webmanifest`, `sw.js`, dan folder `icons` harus sejajar. Jangan hanya upload `index.html`.
3. Commit perubahan, tunggu deployment Pages selesai, kemudian buka URL HTTPS website. Gunakan URL website, bukan URL halaman repository atau preview.html.
4. Domain website tetap harus terdaftar di Firebase Authentication → Settings → Authorized domains. Jika domain sama seperti sebelumnya, tidak perlu ditambah ulang. Firestore Rules tidak berubah.

Tidak perlu npm build, MacBook, Xcode, atau akun Apple Developer. `npm test` hanya untuk pengembang yang ingin menjalankan tes lokal.

## 2. Pasang di iPhone
1. Buka URL HTTPS website di Safari.
2. Tekan Bagikan → Tambahkan ke Layar Utama.
3. Jika tersedia, aktifkan Buka sebagai App Web, lalu Tambah.
4. Buka ikon copia. yang baru terpasang.
5. Login melalui Google atau akun email yang sama. Sesi Safari dan web app bisa terpisah; login di Safari tidak dijamin langsung terbawa.
6. Atur PIN melalui Akun pada web app terpasang. Pengaturan PIN bisa terpisah dari Safari karena penyimpanannya per browser/aplikasi.

Tombol ikon unduh di header membuka petunjuk pemasangan. Tombol ini disembunyikan ketika aplikasi sudah dibuka dalam mode standalone. iPhone tidak memakai tombol instal otomatis browser seperti Android.

## 3. Batas offline versi pertama
- Data keuangan tetap memerlukan internet, termasuk login, memuat data, setoran, dan penyimpanan.
- Saat aplikasi dibuka tanpa koneksi setelah service worker berhasil dipasang, muncul halaman offline dengan tombol coba kembali.
- Jika koneksi putus saat aplikasi sudah terbuka, banner offline muncul. Data yang sudah ada di layar mungkin tetap terlihat sampai PIN mengunci aplikasi. Versi ini tidak menyediakan mode input dan sinkronisasi offline.
- Notifikasi berhasil hanya muncul setelah penyimpanan diakui Firebase. Tindakan yang gagal perlu dicoba lagi setelah tersambung.
- Cache aplikasi hanya menyimpan halaman offline dan ikon publik. Service worker tidak menyimpan respons Firebase, token, halaman login, atau data keuangan. SDK/browser tetap memakai penyimpanan sesinya sendiri sesuai implementasi sebelumnya.
- Offline fallback belum tersedia sebelum kunjungan online pertama berhasil memasang service worker. Perangkat dapat menghapus cache/storage menurut kebijakannya.

## 4. Pembaruan aplikasi
HTML, JavaScript dan CSS aplikasi diambil dari jaringan agar tidak tertinggal di cache service worker.
Jika sw.js berubah, versi baru menunggu. Tombol Perbarui tidak melanjutkan saat formulir terbuka atau penyimpanan berjalan. Tab lain tidak dipaksa reload di tengah pencatatan.
Untuk rilis yang mengubah halaman offline atau ikon, naikkan nama CACHE pada sw.js (contoh v1 → v2). Jangan mengubah ID manifest atau scope jika tetap aplikasi yang sama.

## 5. Login Google
Metode popup Firebase yang sekarang dipertahankan, langsung dari ketukan pengguna. Jika diblokir, izinkan popup untuk website lalu coba lagi dari ikon aplikasi terpasang. Login email tetap tersedia untuk akun yang sudah memiliki metode email/password.
Jangan mengganti ke redirect secara sembarang pada GitHub Pages: Firebase punya persyaratan domain/penyimpanan tambahan. Alur Google pada Safari dan PWA iPhone perlu diuji langsung di perangkat Anda; build ini belum diuji pada iPhone fisik.

## 6. Checklist setelah publish
- Ikon copia. tampil tajam dan membuka halaman tanpa address bar Safari.
- Login di web app, aktifkan PIN, tutup dan buka kembali; periksa sesi dan PIN.
- Nominal, kategori, tabungan pribadi dan bersama berfungsi saat online.
- Matikan koneksi dan buka ulang: halaman offline muncul. Sambungkan dan tekan coba lagi.
- Coba sekali save nominal kecil saat online, pastikan data muncul kembali setelah reload. Hapus catatan uji melalui aplikasi jika sudah selesai.

`preview.html` memakai data contoh, tidak login dan tidak mendaftarkan service worker. Gunakan `index.html` yang sudah di-host HTTPS untuk pemasangan PWA sebenarnya.
