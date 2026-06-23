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

# 22-06-2026 : Penambahan Fitur Kuis Admin dan Siswa

- **Rancangan Database (PocketBase)**:
    - Menambahkan skema koleksi `limit_quizzes` (menyimpan data judul, deskripsi, relasi kelas, batas waktu pengerjaan, pembuat kuis, serta JSON daftar pertanyaan, opsi pilihan ganda A-D, dan kunci jawaban).
    - Menambahkan skema koleksi `limit_quiz_results` (menyimpan data relasi kuis, relasi siswa, skor perolehan, dan JSON pilihan jawaban siswa) pada dokumen [POCKETBASE_SCHEMA.md](file:///home/yopa/Kuliah/SubGraph/LimitFungsi/POCKETBASE_SCHEMA.md).
- **Manajemen Kuis Sisi Admin**:
    - Menambahkan menu navigasi **"Quiz"** di sidebar admin (`app/admin/layout.jsx`).
    - Membuat halaman manajemen kuis admin (`app/admin/quizzes/page.jsx`) untuk melihat daftar kuis, menghapusnya, dan menambahkan/mengedit kuis menggunakan modal form interaktif.
    - Form admin dilengkapi fungsionalitas tambah/kurang pertanyaan kuis secara dinamis dengan input opsi jawaban A, B, C, D dan pemilihan kunci jawaban kuis.
    - Membuat halaman detail pengerjaan kuis admin (`app/admin/quizzes/[id]/page.jsx`) untuk memantau data pengerjaan siswa. Dilengkapi dengan tabel daftar nilai siswa serta modal detail analisis jawaban per pertanyaan untuk meninjau secara rinci kesalahan/kebenaran jawaban siswa.
- **Pengerjaan Kuis Sisi Siswa (User)**:
    - Menambahkan menu navigasi **"Quiz"** di sidebar user (`app/user/layout.jsx`).
    - Membuat halaman kuis user (`app/user/quizzes/page.jsx`) untuk menampilkan daftar kuis yang tersedia bagi kelas yang telah diikuti oleh siswa beserta status kelulusan/nilainya.
    - Mengimplementasikan antarmuka pengerjaan kuis interaktif yang dilengkapi dengan:
        - **Timer Kuis**: Batas waktu otomatis (waktu habis memicu auto-submit).
        - **Navigasi Soal**: Panel grid nomor soal untuk melompat antar pertanyaan secara acak serta penanda status soal (sudah dijawab, aktif, belum dijawab).
        - **Kalkulasi & Submission**: Penilaian kuis secara otomatis saat dikumpulkan dan pencatatan hasil pengerjaan di database PocketBase.
- **Styling UI/UX**:
    - Menerapkan desain bernuansa **neo-brutalism** yang konsisten dengan sisa aplikasi menggunakan CSS Module di halaman kuis admin & user.

# 23-06-2026 : Penambahan Fitur Video Kelas, Animasi Chatbot, dan Log Aktivitas Admin

- **Manajemen Video Kelas (Admin & User)**:
    - Membuat halaman manajemen video admin ([app/admin/videos/page.jsx](file:///home/yopa/Kuliah/SubGraph/LimitFungsi/app/admin/videos/page.jsx)) untuk menambah, mengedit, dan menghapus video pembelajaran berbasis link YouTube.
    - Menambahkan skema koleksi `limit_videos` di PocketBase untuk menyimpan metadata video (judul, deskripsi, YouTube URL, dan kelas terkait) serta mendokumentasikannya di [POCKETBASE_SCHEMA.md](file:///home/yopa/Kuliah/SubGraph/LimitFungsi/POCKETBASE_SCHEMA.md).
    - Membuat halaman video untuk siswa ([app/user/videos/page.jsx](file:///home/yopa/Kuliah/SubGraph/LimitFungsi/app/user/videos/page.jsx)) yang menampilkan video pembelajaran berdasarkan kelas yang sedang diikuti oleh siswa.
- **Peningkatan Chatbot (Animasi Thinking & Persistensi Cookie)**:
    - Menambahkan animasi indikator *thinking* (3 titik memantul) saat bot sedang memproses jawaban di [/user/chatbot](file:///home/yopa/Kuliah/SubGraph/LimitFungsi/app/user/chatbot/page.jsx) dan [/admin/chatbot](file:///home/yopa/Kuliah/SubGraph/LimitFungsi/app/admin/chatbot/page.jsx).
    - Mengimplementasikan persistensi riwayat obrolan admin menggunakan cookie `admin_chat_history` di [/admin/chatbot](file:///home/yopa/Kuliah/SubGraph/LimitFungsi/app/admin/chatbot/page.jsx), sehingga chat admin tetap tersimpan saat halaman direfresh.
- **Sistem Pelacakan Aktivitas Admin (Recent Activity)**:
    - Membuat utilitas [utils/activityLog.js](file:///home/yopa/Kuliah/SubGraph/LimitFungsi/utils/activityLog.js) untuk mencatat dan mengelola log aktivitas admin (maksimal 20 item, tersimpan di cookie `admin_activity_log` selama 7 hari).
    - Menghubungkan log aktivitas ke seluruh operasi CRUD pada admin: kuis (`quizzes`), materi (`materials`), video (`videos`), kelas (`classes`), dan tugas (`tasks`).
    - Memperbarui halaman dashboard admin ([app/admin/page.jsx](file:///home/yopa/Kuliah/SubGraph/LimitFungsi/app/admin/page.jsx) dan [page.module.css](file:///home/yopa/Kuliah/SubGraph/LimitFungsi/app/admin/page.module.css)) untuk memuat dan menampilkan log aktivitas terbaru secara dinamis lengkap dengan ikon representatif dan tombol hapus riwayat.

# 23-06-2026 [1] : Implementasi Verifikasi Bukan Robot (CAPTCHA)

- **Sistem Keamanan Login**:
    - Membuat widget "Saya bukan robot" interaktif kustom berbasis Next.js dan React State di halaman login ([app/auth/login/page.jsx](file:///home/yopa/Kuliah/SubGraph/LimitFungsi/app/auth/login/page.jsx)).
    - Mengintegrasikan generator alfanumerik acak 5 karakter serta render grafis ke `<canvas>` HTML5 dengan efek rotasi karakter, gradasi latar belakang, dan *noise lines/dots* untuk mempersulit pembacaan otomatis oleh bot.
    - Menambahkan transisi status *loading spinner* pada checkbox CAPTCHA untuk memberikan kesan interaktif yang mulus.
    - Menambahkan penanganan tombol **Enter** (`onKeyDown`) pada input captcha untuk melakukan verifikasi kode tanpa men-submit formulir login utama.
    - Menambahkan CSS Module styling neobrutalism yang konsisten untuk widget captcha, box tantangan, dan tombol refresh/verifikasi ([app/auth/login/page.module.css](file:///home/yopa/Kuliah/SubGraph/LimitFungsi/app/auth/login/page.module.css)).


