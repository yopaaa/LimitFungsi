# 15-06-2026 : Penambahan Fitur Chat Bot dan Integrasi Google Login

- Mengimplementasikan fitur **Chat Bot** interaktif untuk user di `app/user/chatbot/`.
- Menambahkan API route `app/api/chat/route.js` untuk menangani logika percakapan AI.
- Mengintegrasikan **Google OAuth2** pada halaman login menggunakan SDK PocketBase.
- Menambahkan tombol "Login dengan Google" dan komponen *divider* pada UI login.
- Memperbarui `app/user/layout.jsx` dengan sistem menu yang lebih dinamis dan penambahan menu Chat Bot.

# 15-06-2026 [1] : Pembersihan Kode dan Peningkatan UI/UX

- Melakukan refactor pada `app/user/layout.jsx` untuk mendukung properti `title` pada navigasi sidebar.
- Menyederhanakan logika validasi captcha manual ("Saya bukan robot") di halaman login.
- Menambahkan styling neobrutalism (border tebal & shadow) pada komponen baru untuk menjaga konsistensi desain.
- Membersihkan komentar-komentar kode yang tidak diperlukan di seluruh file autentikasi.
- Memastikan navigasi *redirect* setelah login (Admin vs User) berjalan lancar dengan data dari localStorage.

# 15-06-2026 [2] : Keamanan API dan Personalisasi Chat Bot

- Mengimplementasikan validasi autentikasi pada `app/api/chat/route.js` menggunakan cookie `pb_auth` dan instance `pb` dari `utils/db`.
- Memperbaiki pengiriman prompt ke Gemini API agar mendukung riwayat percakapan yang terstruktur (format `user` & `model`).
- Menambahkan **System Instruction** resmi untuk memberikan identitas "Limit Bot" dan mengenali user sebagai "Rizka dari Polman Babel".
- Mengonfigurasi kepribadian bot agar memberikan respon yang "ramah namun kritis" terkait materi matematika.
- Mengimplementasikan fitur **Persistensi Chat** menggunakan cookie `chat_history` di frontend, sehingga riwayat percakapan tetap ada saat halaman direfresh.

# 15-06-2026 [3] : Implementasi Fitur Materi/Jurnal berbasis Markdown

- Menginstal library `react-markdown`, `remark-gfm`, dan `react-syntax-highlighter` untuk pendukung fitur materi.
- Menambahkan koleksi `limit_materials` pada skema database PocketBase.
- Membuat halaman manajemen materi admin (`app/admin/materials/page.jsx`) untuk operasi CRUD.
- Membuat editor materi dengan fitur **live preview** Markdown (`app/admin/materials/new/page.jsx` & `edit/page.jsx`).
- Mengimplementasikan halaman tampilan materi untuk user (`app/user/materials/[slug]/page.jsx`) dengan dukungan tabel dan syntax highlighting kode.
- Menambahkan link menu "Materi" pada Sidebar Admin.
- Membuat halaman daftar materi untuk user (`app/user/materials/page.jsx`) dengan tampilan **grid 2 kolom** dan pengurutan dari yang terbaru.

# 15-06-2026 [4] : Penyempurnaan Visual dan Keamanan Materi

- Mengimplementasikan fitur **Unggah Thumbnail** (gambar sampul) untuk materi menggunakan `FormData`.
- Sinkronisasi **Live Preview** di panel Admin agar menggunakan styling dan syntax highlighter yang identik dengan tampilan User.
- Menambahkan proteksi keamanan pada `app/user/materials/[slug]/page.jsx` agar materi berstatus **Draft** tidak bisa diakses oleh non-admin.
- Memperbarui `POCKETBASE_SCHEMA.md` dengan **API Rules** yang menyertakan filter status materi.
- Peningkatan UI kartu materi user dengan integrasi gambar thumbnail dan transisi hover.

# 15-06-2026 [5] : Penambahan Navigasi Daftar Isi (Table of Contents)

- Memindahkan fitur materi dari `/user` ke root `/materials` agar bersifat publik.
- Mengimplementasikan fitur **Daftar Isi (ToC)** otomatis pada halaman detail materi.
- Menambahkan logika ekstraksi heading (`h1`, `h2`, `h3`) dari konten Markdown untuk dijadikan navigasi sidebar.
- Memperbarui layout halaman materi menjadi dua kolom dengan sidebar yang bersifat **sticky** di sisi kiri.
- Mengintegrasikan navigasi jangkar (anchor links) dengan memberikan ID otomatis pada setiap elemen heading di artikel.

# 15-06-2026 [6] : Penambahan Field Deskripsi pada Materi

- Menambahkan field **description** pada form pembuatan (`new`) dan edit materi di sisi Admin.
- Memperbarui state dan logika pengiriman data menggunakan `FormData` agar menyertakan deskripsi.
- Menampilkan deskripsi singkat pada kartu materi di halaman manajemen materi Admin.
- Menambahkan styling CSS untuk membatasi tampilan deskripsi agar rapi (max-lines: 2) pada dashboard admin.
- Mengoptimalkan pengambilan data materi dengan filter field yang lebih spesifik pada list view.

# 16-06-2026 : Peningkatan Sistem Penilaian AI dan Manajemen Tugas

- **Optimasi Penilaian AI**:
    - Memperbarui prompt Gemini AI untuk penilaian yang lebih objektif menggunakan rumus matematika absolut `(Benar / Total Soal) * 100`.
    - Menambahkan tahap validasi konten sebelum penilaian untuk mendeteksi file yang tidak relevan.
    - Menghapus pembungkus Markdown pada output JSON AI untuk stabilitas parsing.
- **Manajemen Deadline & Kategorisasi Tugas**:
    - Memisahkan input **Tanggal** dan **Waktu** deadline pada form pembuatan tugas admin untuk presisi lebih baik.
    - Mengimplementasikan kategorisasi tugas pada Dashboard Admin dan User: **Tugas Aktif** vs **Tugas Terlewat/Selesai**.
    - Menambahkan pengecekan deadline ketat pada sisi client dan server sebelum proses pengumpulan tugas.
- **Fitur Admin & Penilaian Manual**:
    - Memperbaiki **Error 404** pada update nilai dengan memindahkan logika ke API route server-side `app/api/submissions/update-grade/route.js`.
    - Menambahkan **Modal Detail Jawaban** siswa yang dilengkapi dengan preview Markdown dan syntax highlighting.
    - Integrasi `ReactMarkdown` untuk menampilkan kunci jawaban tugas di panel admin.
- **Perbaikan Bug & UI/UX**:
    - Sinkronisasi penggunaan `pb.files.getURL()` (case-sensitive) di seluruh komponen untuk memastikan file lampiran dan profil tampil dengan benar.
    - Memberikan styling khusus (neobrutalism muted) untuk tugas-tugas yang sudah melewati batas waktu (overdue).
    - Memperbaiki filter tugas di dashboard user agar hanya menampilkan tugas yang masih aktif.

# 16-06-2026 [1] : Revitalisasi Landing Page (Halaman Utama)

- Membuat komponen `HeroSection` sebagai penyambut dengan judul yang dinamis dan elemen visual neobrutalism.
- Membuat komponen `MaterialList` yang menampilkan 4 materi terbaru secara otomatis dari database.
- Sinkronisasi warna desain agar konsisten menggunakan variabel `--primary` (biru) di seluruh elemen Hero Section.
- Implementasi layout responsif pada halaman utama untuk mendukung tampilan mobile dan desktop.
