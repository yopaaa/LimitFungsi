"use client";

import React from "react";
import styles from "./Footer.module.css";

// 1. Objek Data untuk Semua Teks Statis
const footerData = {
  brand: {
    imgSrc: "/app.png",
    logo: "LIMIT",
    tagline: `Building things for the web.
Based in Batam, Indonesia.
hello@yopaaa.dev`,
  },
  navigation: {
    title: "Navigasi",
    links: [
      { name: "Tentang Saya", href: "#about" },
      { name: "Artikel", href: "#articles" },
      { name: "Servis & Proyek", href: "#services" },
      { name: "Media Sosial", href: "#social" },
    ],
  },
  contact: {
    title: "Kontak",
    links: [
      { name: "hello@yopaaa.dev", href: "mailto:hello@yopaaa.dev" },
      {
        name: "Jadwalkan Meeting",
        href: "https://cal.com/yopa",
        target: "_blank",
        rel: "noreferrer",
      },
      { name: "Download CV", href: "#", download: "CV.pdf" }, // Tambahkan atribut download jika perlu
    ],
  },
  bottom: {
    copyText:
      "© 2025 Yopa Pitra R. — Dibuat dengan ☕ & terlalu banyak caffeine",
    scrollToTopAnchor: "↑",
  },
};

export default function Footer() {
  const scrollToTop = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        {/* Kolom 1: Brand */}
        <div className={styles.footerBrand}>
          <span className={styles.footerLogoContainer}>
            <img src={footerData.brand.imgSrc} alt="logo" className={styles.footerLogoImg} />
            <span className={styles.footerLogo}>{footerData.brand.logo}</span>
          </span>
          <p className={styles.footerTagline}>
            {footerData.brand.tagline.split("\n").map((line, index) => (
              <React.Fragment key={index}>
                {line}
                {index < footerData.brand.tagline.split("\n").length - 1 && (
                  <br />
                )}
              </React.Fragment>
            ))}
          </p>
        </div>

        {/* Kolom 2: Navigasi */}
        <div className={styles.footerCol}>
          <h4 className={styles.footerTitle}>{footerData.navigation.title}</h4>
          <ul className={styles.footerLinks}>
            {footerData.navigation.links.map((link) => (
              <li key={link.name} className={styles.footerLinkItem}>
                <a href={link.href}>{link.name}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Kolom 3: Kontak */}
        <div className={styles.footerCol}>
          <h4 className={styles.footerTitle}>{footerData.contact.title}</h4>
          <ul className={styles.footerLinks}>
            {footerData.contact.links.map((link, index) => (
              <li key={index} className={styles.footerLinkItem}>
                <a
                  href={link.href}
                  target={link.target || undefined}
                  rel={link.rel || undefined}
                  // Jika Anda ingin menambahkan logika khusus untuk download, Anda bisa menambahkannya di sini
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bagian Bawah */}
      <div className={styles.footerBottom}>
        <p className={styles.footerCopy}>{footerData.bottom.copyText}</p>
        <a
          href="#hero"
          className={styles.footerScrollTop}
          onClick={scrollToTop}
          title="Scroll ke atas"
        >
          {footerData.bottom.scrollToTopAnchor}
        </a>
      </div>
    </footer>
  );
}
