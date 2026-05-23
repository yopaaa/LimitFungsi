"use client";

import { useRouter } from "next/navigation";

import Header from "@/components/Layout/Header";
import Footer from "@/components/Layout/Footer";
import styles from "./page.module.css"; // Memakai layout.module.css

export default function RegisterLayout({ children }) {
  const router = useRouter();

  return (
    <div className={styles.pageWrapper}>
      {/* Ornamen Latar Belakang Tetap di Sini */}

      {/* Header Global */}
      <div className={styles.contentWrapper}>
        <Header />

        <div className={styles.container}>
          <div className={styles.center}>
            <h1 className={styles.title}>404</h1>
            <p className={styles.heading}>Halaman tidak ditemukan.</p>
            <p className={styles.description}>
              Sepertinya halaman yang Anda cari tidak ada atau telah dihapus.
            </p>

            <button className={styles.button} onClick={() => router.back()}>
              Kembali ke Sebelumnya
            </button>
          </div>

          <div className={styles.footer}>
            <p>.</p>
          </div>
        </div>
      </div>

      {/* Footer Global */}
      <Footer />
    </div>
  );
}
