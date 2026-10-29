# BAHASA INDONESIA — Genius Assessment

Aplikasi asesmen digital statis untuk Bahasa Indonesia SMK kelas XI, materi Teks Prosedur. Dibangun dengan HTML, CSS, JavaScript, dan Bootstrap 5; dapat dipublikasikan melalui GitHub Pages.

## Isi folder
- `index.html` — struktur halaman dan formulir identitas.
- `styles.css` — desain responsif biru, kuning, dan putih.
- `questions.js` — bank 25 soal, pilihan asli, indeks kunci, pembahasan, dan tingkat kesulitan.
- `app.js` — validasi, pengacakan soal dan pilihan, timer, penilaian, umpan balik, dan hasil.

## Jalankan secara lokal
Buka `index.html` di peramban. Karena semua aset aplikasi dimuat dari folder lokal kecuali Bootstrap CDN, aplikasi umumnya dapat dijalankan langsung dengan membuka berkas. Koneksi internet diperlukan untuk memuat Bootstrap dari CDN. Untuk pengujian lebih konsisten, jalankan server lokal seperti ekstensi Live Server di VS Code.

## Publikasi ke GitHub Pages
1. Masuk ke GitHub dan buat repositori baru, misalnya `bahasa-indonesia-assessment`.
2. Unggah ke direktori utama repositori keempat berkas: `index.html`, `styles.css`, `questions.js`, dan `app.js` (README boleh disertakan).
3. Buka **Settings → Pages**.
4. Pada **Build and deployment**, pilih **Deploy from a branch**.
5. Pilih branch `main` dan folder `/(root)`, lalu klik **Save**.
6. Tunggu proses deployment selesai. URL situs akan tampil di halaman Pages, biasanya berbentuk `https://USERNAME.github.io/REPOSITORY/`.
7. Uji formulir, timer, pengacakan, semua jawaban, tampilan HP, dan cetak hasil pada URL publik.

## Catatan penting
- Aplikasi ini berjalan sepenuhnya di peramban. Hasil siswa tidak otomatis dikirim ke guru atau disimpan ke server.
- Karena GitHub Pages adalah hosting statis, kode bank soal dan kunci jawaban dapat dilihat oleh orang yang membuka sumber halaman. Jangan gunakan untuk ujian berisiko tinggi atau ujian yang memerlukan kerahasiaan kunci.
- Jika hasil harus direkap lintas perangkat, dibatasi per siswa, atau dikirim ke guru, tambahkan backend/database atau integrasi layanan formulir/spreadsheet dengan kontrol akses yang sesuai.
- Saat waktu habis, aplikasi menghentikan sesi. Soal yang belum dijawab dihitung sebagai “belum dijawab” dan tidak mendapat poin; nilai tetap dihitung dari jumlah benar dibagi 25.
- Setiap jawaban langsung terkunci. Umpan balik menampilkan status benar/salah dan pembahasan sebelum siswa dapat melanjutkan.
