import Header from "@/components/Layout/Header";
import Footer from "@/components/Layout/Footer";
import styles from "./layout.module.css"; // Memakai layout.module.css

export default function RegisterLayout({ children }) {
  return (
    <div className={styles.pageWrapper}>
      {/* Ornamen Latar Belakang Tetap di Sini */}
     

      {/* Header Global */}
      <div className={styles.contentWrapper}>
        <Header />

        {/* Konten Halaman akan Masuk ke Sini */}
        <main className={styles.mainContent}>{children}</main>
      </div>

      {/* Footer Global */}
      <Footer />
    </div>
  );
}
