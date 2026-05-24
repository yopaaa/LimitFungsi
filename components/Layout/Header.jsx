"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Header.module.css";

export default function Header() {
  const pathname = usePathname();

  // Logika penentuan teks tombol dan tujuan link berdasarkan router aktif
  // Jika path saat ini adalah /auth/login (atau mengandung 'login'), arahkan ke register/signup, begitu juga sebaliknya
  const isLoginPage = pathname?.includes("login");

  const buttonText = isLoginPage ? "Daftar" : "Login";
  const buttonLink = isLoginPage ? "/auth/register" : "/auth/login"; // sesuaikan dengan struktur folder auth Anda

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Link Logo kembali ke halaman utama */}
        <Link href="/" className={styles.logo}>
          <img src="/app.png" alt="logo" className={styles.logoImg} />
          LIMIT
        </Link>

        <div className={styles.nav}>
          <Link href="/#team" className={styles.navText}>
            Team
          </Link>

          <Link href="/#social" className={styles.navText}>
            Sosmed
          </Link>

          {/* Menggunakan Link bawaan Next.js agar navigasi instant / SPA */}
          <Link href={buttonLink} className={styles.navBtn}>
            {buttonText}
          </Link>
        </div>
      </div>
    </header>
  );
}
