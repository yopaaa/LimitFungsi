"use client";

import styles from './styles/Footer.module.css';

export default function Footer() {
  const scrollToTop = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        {/* Kolom 1: Brand */}
        <div className={styles.footerBrand}>
          <span className={styles.footerLogo}>RP</span>
          <p className={styles.footerTagline}>
            Building things for the web.<br />
            Based in Batam, Indonesia.<br />
            hello@yopaaa.dev
          </p>
        </div>

        {/* Kolom 2: Navigasi */}
        <div className={styles.footerCol}>
          <h4>Navigasi</h4>
          <ul className={styles.footerLinks}>
            <li><a href="#about">Tentang Saya</a></li>
            <li><a href="#articles">Artikel</a></li>
            <li><a href="#services">Servis & Proyek</a></li>
            <li><a href="#social">Media Sosial</a></li>
          </ul>
        </div>

        {/* Kolom 3: Kontak */}
        <div className={styles.footerCol}>
          <h4>Kontak</h4>
          <ul className={styles.footerLinks}>
            <li><a href="mailto:hello@yopaaa.dev">hello@yopaaa.dev</a></li>
            <li><a href="https://cal.com/rizkypratama" target="_blank" rel="noreferrer">Jadwalkan Meeting</a></li>
            <li><a href="#">Download CV</a></li>
          </ul>
        </div>
      </div>

      {/* Bagian Bawah */}
      <div className={styles.footerBottom}>
        <p className={styles.footerCopy}>
          © 2025 <span>Yopa Pitra R.</span> — Dibuat dengan ☕ & terlalu banyak caffeine
        </p>
        <a 
          href="#hero" 
          className={styles.footerScrollTop} 
          onClick={scrollToTop}
          title="Scroll ke atas"
        >
          ↑
        </a>
      </div>
    </footer>
  );
}