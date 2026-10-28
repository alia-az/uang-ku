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

Sesi login bertahan setelah browser ditutup (local persistence). Jika PIN aktif pada browser ini, pembukaan ulang meminta PIN sebelum membaca data keuangan. Data keuangan tidak disimpan sebagai cache IndexedDB aplikasi baru. Logout membersihkan tampilan; login lagi untuk membaca dari cloud.

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

## Perbaikan 23 Oktober 2026

Dropdown kategori kini memperbarui nilai form dan indikator pilihan langsung, tanpa mengganti elemen dropdown saat klik. Kontrol dropdown tidak lagi dibungkus label yang mengaktifkan kontrol ulang.

Login menggunakan browserLocalPersistence. Login sekali, lalu aktifkan PIN di Akun. Saat website dibuka kembali pada browser/domain yang sama, cukup masukkan PIN selama sesi Firebase masih valid. Login ulang tetap diperlukan setelah keluar akun, menghapus data browser, sesi dicabut, atau menggunakan browser/perangkat berbeda. Jangan gunakan incognito untuk sesi tetap. Rules Firestore tidak berubah.

## Tabungan & target dan detail kategori

Pembaruan 23 Oktober 2026. WAJIB publish ulang seluruh isi firestore.rules dari paket ini SEBELUM menggunakan versi baru. Rules baru menerima field goals opsional dan tetap menerima dokumen lama. Akun tetap terisolasi per UID. Jangan menjalankan source lama bersamaan saat mengubah data dengan source baru.

Tabungan ada di Beranda > Tabungan & target > + Target. Isi nama, target nominal, dan tenggat opsional. Ketuk target untuk alokasi/penarikan, riwayat, serta mengubah target. Setoran tidak boleh melebihi saldo bebas hari ini; penarikan tidak boleh melebihi alokasi target. Hapus target hanya jika saldo alokasinya nol. Saldo bebas = saldo aktual dari transaksi hingga hari ini dikurangi semua alokasi tabungan. Pengeluaran nyata tetap dicatat sebagai transaksi biasa; bila memakai dana tabungan, kembalikan alokasinya terlebih dahulu agar saldo bebas tetap jelas. Alokasi tidak memindahkan uang bank, tidak menambah pengeluaran, dan tidak mengubah total saldo. Saldo bebas tidak memperhitungkan tagihan masa depan. Kartu saldo bulanan tetap total saldo termasuk dana tabungan; target bersifat lintas bulan.

Detail kategori: ketuk nama kategori pada daftar Ke mana uangmu atau Distribusi pengeluaran. Pilih bulan atau Semua waktu untuk melihat total, jumlah transaksi, persentase pengeluaran, rata-rata per transaksi, transaksi terbesar, dan daftar transaksi. Perbandingan bulan sebelumnya memakai bulan penuh; bulan berjalan dapat belum lengkap.

Backup JSON kini menyertakan goals dengan riwayat alokasi. Impor menggabungkan target baru berdasarkan ID, mempertahankan target dengan ID yang sudah ada. Cadangan lama tanpa goals tetap diterima. Batas snapshot 800 KiB tetap berlaku untuk gabungan semua data. Tes lokal tidak menggantikan pengujian browser serta Firestore rules pada proyek Anda; rules baru belum diuji emulator/live.

## Tabungan Bersama — 23 Oktober 2026

WAJIB publish ulang SEMUA isi firestore.rules terbaru sebelum menjalankan versi ini. Koleksi baru: sharedGoals/{id}, sharedGoals/{id}/entries/{id}, sharedInvites/{kode}. Data pribadi users/{uid}/finance/state tetap terpisah.

1. Beranda > Tabungan bersama > Buat. Isi nama, nominal, tenggat opsional, tempat uang sebenarnya disimpan.
2. Buka target > Kelola undangan. Salin tautannya dan bagikan sendiri kepada calon anggota. Tautan berlaku 7 hari. Buat tautan baru untuk mencabut tautan lama; anggota yang sudah bergabung tidak keluar.
3. Penerima membuka aplikasi dan login dengan akun sendiri, lalu pilih Gabung lewat tautan undangan. Kode otomatis terisi jika URL memuat invite. Periksa nama target lalu Terima & gabung. Tautan adalah akses pembawa: siapa pun yang memegangnya dapat bergabung selama aktif. Tidak ada pengiriman email otomatis.
4. Anggota mencatat setoran. Status awal menunggu konfirmasi. Pemilik harus memastikan uang diterima lalu memilih Konfirmasi atau Tolak. Hanya setoran terkonfirmasi masuk saldo/progres dan kontribusi bersih.
5. Penarikan hanya dapat dicatat pemilik. Pemilik tetap mengonfirmasi catatan tersebut. Transaksi Firestore + rules memeriksa penarikan tidak membuat saldo negatif dan menautkan persetujuan dengan perubahan saldo.
6. Ringkasan target diperbarui realtime. Detail riwayat dimuat ulang saat dibuka atau melalui Muat ulang riwayat. Kontribusi bersih penarikan dibebankan ke pemilik yang mencatat penarikan; angka ini bukan pembagian hak kepemilikan dana.
7. Tidak ada penghapusan atau pengeditan catatan terkonfirmasi. Koreksi dengan catatan lawan bertanda jelas, lalu konfirmasi. Penarikan bersama tidak otomatis menambah saldo pribadi; catat transaksi pribadi jika uang nyata berpindah.

Batas awal: maksimum 50 anggota per target. Anggota yang sudah diterima belum dapat dikeluarkan melalui UI versi ini. Riwayat dimuat seluruhnya; paginasi diperlukan untuk histori besar. Backup JSON pribadi tidak mencakup koleksi bersama. Jangan menganggap backup pribadi mencadangkan target bersama. Undangan yang kedaluwarsa tetap dapat dilihat judul targetnya oleh pengguna login yang mengetahui kode, namun tidak dapat dipakai bergabung.

PIN hanya pengunci browser. Data bersama tidak dibaca ketika PIN terkunci dan listener dihentikan saat lock/logout. Keamanan server memakai keanggotaan UID dan Firestore Rules, bukan PIN.

Uji penerimaan sebelum penggunaan utama: buat target akun A, coba akses langsung dari akun B sebelum bergabung (harus ditolak), gabung B lewat undangan, buat setoran B (masih pending), konfirmasi A (saldo bertambah sekali), coba konfirmasi B (ditolak), coba konfirmasi ulang (ditolak), coba penarikan melebihi saldo (ditolak), lalu cabut undangan dan uji link lama. Rules baru belum diuji dengan emulator/live dalam sesi ini. Tes lokal memeriksa agregasi pending/confirmed/rejected dan kontribusi; bukan bukti otorisasi server.

## Grafik circle pada detail bersama
Grafik menunjukkan saldo terkonfirmasi / target; setoran pending tidak dihitung. Angka dapat melebihi 100% jika target terlampaui, lingkaran dibatasi penuh. Kontribusi bersih tetap ditampilkan per anggota; penarikan mengurangi saldo grafik. Rules sama dengan versi Tabungan Bersama sebelumnya.

## Identitas copia.
Nama tampilan diganti menjadi copia. Logo SVG monogram c + titik diterapkan pada header, kartu saldo, login, PIN dan favicon. SVG merupakan adaptasi vektor sederhana dari konsep logo, dengan wordmark font aplikasi. Penyimpanan tema/PIN lama tetap dipertahankan agar pengaturan tidak hilang. Proyek Firebase dan rules tidak berubah. Sertakan copia-icon.svg dan copia-logo.svg saat mengunggah ke GitHub.

## Halaman khusus Tabungan
Beranda tetap mempertahankan semua komponen sebelumnya; ditambahkan tombol Pusat tabungan sebelum ringkasan tabungan. Tekan tombol untuk membuka halaman khusus dengan tab Target pribadi dan Tabungan bersama. Tombol Kembali ke Beranda mengembalikan tampilan utama. Data, rules, alur undangan, PIN dan perhitungan saldo tidak berubah. Halaman memakai navigasi internal aplikasi tanpa path baru sehingga tetap cocok dengan GitHub Pages.

## Sembunyikan saldo — 26 Oktober 2026
Ikon mata di samping Saldo tersedia menyembunyikan nominal saldo, saldo awal, dan selisih pada seluruh kartu carousel. Pilihan diingat lokal per browser dengan kunci copia-hide-balance. Ikon mata ditekan lagi untuk menampilkan nominal. Ini privasi tampilan kartu saldo; nominal pada transaksi, grafik, analisis dan tabungan tetap terlihat. Tidak mengubah data/perhitungan dan tidak menggantikan PIN. Rules tidak berubah.


## Update: kode pendek & profil
- Publish ulang isi `firestore.rules` di Firebase Console → Firestore Database → Rules → Publish sebelum memakai kode 8 karakter.
- Undang anggota → Salin kode. Teman login → Tabungan → Gabung dengan kode → Periksa → Terima. Kode berlaku 7 hari; Buat kode baru mencabut yang lama. Undangan panjang sebelumnya tetap dapat dipakai; pemilik dapat menggantinya dengan kode pendek.
- Menu Akun → Nama tampilan → Simpan nama. Sapaan otomatis mengikuti nama Firebase Authentication; Google memakai nama akun awal. Perubahan tidak mengganti nama akun Google. Catatan kontribusi lama tetap memakai nama saat dicatat.
- Login email baru meminta nama tampilan. Akun lama tanpa nama memakai awalan email sampai diubah.


## Update beranda & anggaran
- Kartu utama selalu menampilkan saldo hari ini dikurangi alokasi target pribadi. Angka tidak berubah ketika memilih bulan rekap; transaksi bertanggal setelah hari ini belum masuk saldo hari ini. Nilai negatif tetap ditampilkan sebagai peringatan.
- Rekap pemasukan/pengeluaran, grafik, transaksi terbaru, dan anggaran mengikuti bulan pilihan. Riwayat saldo bulanan tetap tersedia melalui bagian “Saldo per bulan”. Saldo historis tidak dikurangi alokasi target saat ini.
- Beranda menampilkan tiga kategori anggaran dengan rasio pemakaian tertinggi. Buka Anggaran untuk seluruh kategori atau Atur anggaran untuk mengubah batas. Status: Aman <80%, Mendekati batas >=80% dan <100%, Batas tercapai =100%, Melebihi >100%.
- Total terpakai hanya mencakup kategori yang mempunyai anggaran. Pengeluaran kategori tanpa anggaran ditampilkan terpisah. Anggaran bukan pengurangan saldo.
- Target pribadi dan tabungan bersama berada di halaman Tabungan; distribusi kategori lengkap di Analisis. Fitur lama tetap tersedia. Tidak ada perubahan skema data atau Firestore Rules pada revisi ini.


## Penyempurnaan visual pintasan
Tiga pintasan beranda kini memakai kartu dengan ikon dan keterangan singkat. Pemasukan pada nominal, grafik bulanan, serta legenda memakai warna biru. Status anggaran dan warna kategori tetap terpisah. Tidak ada perubahan data atau Firestore Rules.


## Liquid Glass
Tema kaca tersedia melalui liquid-glass.css, dimuat setelah style.css. Efek blur memakai backdrop-filter dan -webkit-backdrop-filter, dengan fallback jika tidak didukung. Mode gelap, reduced motion, dan reduced transparency disertakan. Tidak ada animasi latar terus-menerus. Tidak ada perubahan perhitungan, penyimpanan, PIN, login, atau Firestore Rules. Untuk kembali ke tampilan sebelumnya, hapus link liquid-glass.css dari index.html.

Untuk mencoba tampilan tanpa login, buka preview.html. Data contoh tidak tersimpan dan tidak terhubung Firebase; aplikasi asli tetap index.html.


## PWA iPhone
Baca PANDUAN-PWA.md untuk langkah upload dan pemasangan. Manifest, ikon PNG, service worker khusus halaman offline publik, petunjuk instal, indikator offline, dan update dengan tombol persetujuan disertakan. Transaksi tetap membutuhkan internet.


## Fix menu pada login/PIN
Navigasi dimulai tersembunyi dan inert, dikosongkan saat sesi dibersihkan/dikunci, dan memakai aturan hidden yang mengalahkan display grid/flex. Membuka dan submit form transaksi juga memeriksa status kunci. Upload ulang seluruh source. Tidak ada perubahan Firestore Rules.


## Dark Glass netral
Dark mode memakai charcoal dan lapisan kaca abu-abu transparan. Warna dipakai terbatas sebagai aksen data. Tema terang tetap sama. Fix menu login/PIN serta fitur PWA tetap disertakan.


## Dark Glass pink–biru
Kartu saldo dark mode kembali pink dengan teks gelap. Pintasan, ringkasan, navigasi, dan grafik memakai aksen pink–biru lembut di atas charcoal. Tema terang tetap sama.
