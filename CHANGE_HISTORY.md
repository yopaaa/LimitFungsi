# 15-06-2026 : Penambahan Fitur Chat Bot dan Integrasi Google Login

- Mengimplementasikan fitur **Chat Bot** interaktif untuk user di `app/user/chatbot/`.
- Menambahkan API route `app/api/chat/route.js` untuk menangani logika percakapan AI.
- Mengintegrasikan **Google OAuth2** pada halaman login menggunakan SDK PocketBase.
- Menambahkan tombol "Login dengan Google" dan komponen *divider* pada UI login.
- Memperbarui `app/user/layout.jsx` dengan sistem menu yang lebih dinamis dan penambahan menu Chat Bot.

# 15-06-2026 : Pembersihan Kode dan Peningkatan UI/UX

- Melakukan refactor pada `app/user/layout.jsx` untuk mendukung properti `title` pada navigasi sidebar.
- Menyederhanakan logika validasi captcha manual ("Saya bukan robot") di halaman login.
- Menambahkan styling neobrutalism (border tebal & shadow) pada komponen baru untuk menjaga konsistensi desain.
- Membersihkan komentar-komentar kode yang tidak diperlukan di seluruh file autentikasi.
- Memastikan navigasi *redirect* setelah login (Admin vs User) berjalan lancar dengan data dari localStorage.

# 15-06-2026 [1] : Keamanan API dan Personalisasi Chat Bot

- Mengimplementasikan validasi autentikasi pada `app/api/chat/route.js` menggunakan cookie `pb_auth` dan instance `pb` dari `utils/db`.
- Memperbaiki pengiriman prompt ke Gemini API agar mendukung riwayat percakapan yang terstruktur (format `user` & `model`).
- Menambahkan **System Instruction** resmi untuk memberikan identitas "Limit Bot" dan mengenali user sebagai "Rizka dari Polman Babel".
- Mengonfigurasi kepribadian bot agar memberikan respon yang "ramah namun kritis" terkait materi matematika.
- Mengimplementasikan fitur **Persistensi Chat** menggunakan cookie `chat_history` di frontend, sehingga riwayat percakapan tetap ada saat halaman direfresh.
