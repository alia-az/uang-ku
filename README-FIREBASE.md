# uang. — versi Firebase

Source HTML/CSS/JS untuk GitHub Pages + Firebase Authentication + Cloud Firestore.
Tema pink–biru–putih, logo uang., dan sapaan Alia dipertahankan.

## Status

Konfigurasi Web App proyek `uang-ku-b3065` sudah dimasukkan. Tampilan mengikuti revisi terbaru: pink #FFCED8, teks kartu hitam, dark mode, sapaan tanpa panel/tanggal dengan ilustrasi dompet besar. Authentication dan Firestore harus diaktifkan melalui console Anda. Belum diuji login/simpan di proyek nyata dan belum menggantikan website lama. Analytics tidak diaktifkan karena tidak diperlukan untuk penyimpanan.

## 1. Siapkan Firebase

1. Buka https://console.firebase.google.com/ dan buat/pilih proyek.
2. Project settings > General > Your apps > tambahkan aplikasi Web (`</>`).
3. Salin nilai konfigurasi Web App ke `firebase-config.js`: `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`.
4. Build > Authentication > Get started > Sign-in method > aktifkan **Email/Password**.
5. Build > Firestore Database > buat database default, pilih lokasi yang sesuai dan mode production.
6. Firestore > Rules: ganti isinya dengan seluruh isi `firestore.rules`, lalu **Publish**. Jangan menggunakan test mode/allow all.
7. Authentication > Settings > Authorized domains: tambahkan `USERNAME.github.io` (tanpa https atau nama repository), serta `localhost` untuk uji lokal bila belum tersedia.

Konfigurasi Web Firebase boleh berada dalam kode frontend. Jangan pernah memasukkan service-account JSON, Admin SDK credentials, atau private key ke repository. Akses data dilindungi Authentication dan Firestore Rules.

## 2. Jalankan lokal

Dari folder ini:

```bash
python -m http.server 8080
```

Buka http://localhost:8080. Bisa juga memakai VS Code Live Server.
Jangan membuka melalui `file://`. Internet dibutuhkan untuk SDK Firebase dan penyimpanan cloud.
Tidak perlu npm install/build untuk menjalankan aplikasi; SDK browser modular dimuat dari CDN resmi, versi 13.1.0.

Jika konfigurasi masih `ISI_...`, aplikasi menampilkan petunjuk konfigurasi, bukan diam-diam memakai data lokal.

## 3. Buat akun dan verifikasi

1. Buka aplikasi > Daftar, gunakan email Anda dan password minimal 8 karakter.
2. Login; akun baru mulai dengan data kosong, tanpa data demo otomatis.
3. Atur saldo awal dan tanggal mulai di Akun.
4. Tambahkan pemasukan/pengeluaran, budget, dan kategori.
5. Periksa Firebase Console > Firestore > `users/{uid}/finance/state`.
6. Login pada HP/laptop kedua dengan akun yang sama; data harus sama.
7. Login memakai akun berbeda; data harus kosong/berbeda dan tidak dapat mengakses UID akun pertama.
8. Coba membuka form di dua perangkat lalu simpan dari keduanya. Perangkat dengan revisi lama harus menampilkan konflik; periksa data terbaru dan simpan ulang.
9. Coba putuskan internet saat menyimpan: aplikasi tidak menampilkan sukses palsu dan tidak menimpa state lama.

Sesi login disimpan selama sesi browser (session persistence). Data keuangan tidak disimpan sebagai cache IndexedDB aplikasi baru. Logout membersihkan tampilan; login lagi untuk membaca dari cloud.

## 4. Deploy GitHub Pages

1. Upload isi folder ini ke root repository: `index.html`, `app.js`, `style.css`, `firebase-config.js`, `firebase-bootstrap.mjs`, `state-validation.mjs`, serta file lainnya.
2. Pastikan `firebase-config.js` sudah berisi konfigurasi proyek Anda.
3. Repository Settings > Pages > Deploy from a branch > main > / (root) > Save.
4. Buka URL Pages yang diberikan GitHub.
5. Pastikan domain tersebut ada pada Authorized domains Firebase Authentication.

File rules hanya di-upload ke GitHub tidak akan memasang rules Firebase. Publish rules dari Firebase Console seperti langkah 1.6.

## 5. Migrasi transaksi lama

1. Sebelum mengganti website lama, buka versi IndexedDB lama dan pilih Akun > Ekspor cadangan JSON.
2. Simpan backup. Data lokal tidak otomatis berpindah alamat/domain dan tidak diunggah otomatis.
3. Buka versi Firebase, buat akun/login, lalu Akun > Impor cadangan JSON.
4. Pilih backup lama. Jika akun masih kosong, saldo awal dan tanggal mulai dari backup ikut digunakan.
5. Cek saldo, jumlah transaksi, dan budget. Pada penggabungan, ID yang sama dilewati; data lama tidak dihapus.
6. Pertahankan file backup sampai hasil migrasi terverifikasi.

Jika format/ID transaksi lama tidak lolos validasi, impor dibatalkan agar tidak memasukkan data rusak. Backup dari source uang. sebelumnya menggunakan ID yang kompatibel.

## Penyimpanan dan batas versi ini

- Lokasi: satu dokumen snapshot per pengguna, `users/{uid}/finance/state`.
- Isi: `schemaVersion`, `state` (transactions/categories/opening/start/budgets), `revision`, `updatedAt`.
- Setiap perubahan memakai transaksi Firestore dan pemeriksaan revision. Perubahan perangkat lain tidak ditimpa diam-diam; form terbuka harus diperiksa ulang jika terjadi konflik.
- Pembaruan langsung memakai onSnapshot. Pembaruan remote ditunda selama formulir terbuka.
- Penyimpanan memerlukan koneksi internet; tidak ada antrean offline otomatis.
- Versi personal ini membatasi snapshot JSON sampai 800 KiB dan 5.000 transaksi (batas ukuran dapat tercapai lebih dulu), di bawah batas dokumen Firestore. Penambahan yang melewati batas ditolak, data sebelumnya tetap tersimpan. Jika perlu histori lebih besar, migrasikan transaksi ke koleksi dokumen terpisah sebelum mencapai batas; jangan menghapus histori untuk mengatasinya.
- Pembacaan/penulisan mengikuti pemakaian dan kuota proyek Firebase; periksa Usage di console.
- Rules mengisolasi pengguna dan memvalidasi envelope/schema dasar; validasi detail transaksi/budget ada di aplikasi. Pengguna pemilik akun tetap dapat menulis data miliknya lewat SDK sendiri; versi ini bukan ledger audit yang tahan manipulasi oleh pemilik akun.
- Tidak ada integrasi bank, pembayaran, atau transfer uang sungguhan.

## Pengujian

Dengan Node.js yang mendukung node:test:

```bash
npm test
```

9 tes lokal mencakup validasi data, batas ukuran, revisi konflik, formatting nominal, serta jalur commit berhasil/gagal menggunakan mock penyimpanan. Pemeriksaan sintaks juga sudah dilakukan.

Tes lokal tidak menggantikan uji Firebase: koneksi SDK, provider login, Firestore Rules dan otorisasi lintas akun belum diuji pada proyek nyata karena konfigurasinya belum tersedia. Jalankan checklist pada bagian 3 sebelum penggunaan utama.

## File utama

- `firebase-config.js`: konfigurasi proyek Anda.
- `firebase-bootstrap.mjs`: auth, pembacaan, transaksi revision, realtime listener, halaman login.
- `state-validation.mjs`: validasi snapshot dan konflik.
- `firestore.rules`: akses hanya pemilik UID.
- `app.js`: UI/logika keuangan, adapter cloud.
- `firebase.json`: lokasi rules dan port emulator jika kelak menggunakan Firebase CLI.
- `tests/`: pengujian lokal.

Dokumentasi resmi:
- https://firebase.google.com/docs/web/setup
- https://firebase.google.com/docs/auth/web/password-auth
- https://firebase.google.com/docs/firestore/security/get-started
- https://firebase.google.com/docs/firestore/manage-data/transactions

## Login Google dan PIN (pembaruan)

1. Firebase Console > Authentication > Sign-in method > Add new provider > Google > Enable. Pilih support email, lalu Save.
2. Authentication > Settings > Authorized domains: tambahkan hostname GitHub Pages Anda dan localhost untuk uji lokal. Tanpa https atau path repository.
3. Gunakan tombol Lanjutkan dengan Google. Izinkan popup di browser; gunakan Chrome/Safari langsung bila browser dalam aplikasi memblokir login.
4. Untuk akun email/password yang sudah memiliki data, masuk dulu dengan akun tersebut lalu pilih Akun > Hubungkan akun Google. Jangan membuat akun terpisah untuk memindahkan data.
5. Akun > Keamanan aplikasi > Buat PIN 6 digit. Masukkan dan ulangi PIN.
6. PIN diminta pada pembukaan/reload berikutnya; kunci otomatis setelah 5 menit tidak aktif, atau pilih Kunci sekarang. Penyimpanan yang sedang berlangsung diselesaikan sebelum auto-lock.
7. PIN berlaku per UID dan per browser/perangkat. Atur lagi di HP lain. Hanya hash PBKDF2-SHA256 dengan salt acak yang disimpan lokal, bukan PIN asli. Lima kesalahan membuka PIN memberi jeda lokal 60 detik.
8. Ubah/nonaktifkan PIN memerlukan PIN saat ini. Lupa PIN memerlukan verifikasi ulang akun Google atau kata sandi Firebase; reset tidak menghapus transaksi.

PIN adalah pengunci tampilan untuk privasi kasual, bukan autentikasi Firebase kedua, enkripsi database, atau perlindungan dari pemilik browser yang dapat mengubah kode/localStorage. Pengaturan PIN hilang jika data browser dihapus. Akses cloud tetap diatur Firebase Auth + Firestore Rules; rules sebelumnya tidak berubah. Untuk PIN yang dipaksakan server diperlukan backend tersendiri.

Tes lokal mencakup format PIN dan derivasi salted hash. Login Google, recovery, dan auto-lock pada browser/proyek nyata tetap perlu diuji. Analytics tidak diaktifkan.
