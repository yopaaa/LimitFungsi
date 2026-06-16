import Header from "@/components/Layout/Header";
import Footer from "@/components/Layout/Footer";
import styles from "./page.module.css"; // Memakai layout.module.css
import Social from "@/components/Layout/Social";
import Team from "../components/Layout/Team";
import MaterialList from "@/components/UI/MaterialList";
import HeroSection from "@/components/UI/HeroSection";

export default function RegisterLayout({ children }) {
  return (
    <div className={styles.pageWrapper}>
      {/* Ornamen Latar Belakang Tetap di Sini */}


      {/* Header Global */}
      <div className={styles.contentWrapper}>
        <Header />

        <main className={styles.mainContent}>
          <HeroSection />
        </main>

        {/* Konten Halaman akan Masuk ke Sini */}
      </div>
          <MaterialList />
      <Team /> {/* Komponen Groups Tetap di Sini */}
      <Social /> {/* Komponen Social Tetap di Sini */}
      {/* Footer Global */}
      <Footer />
    </div>
  );
}
