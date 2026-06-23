"use client";

import React from "react";
import styles from "./Footer.module.css";
import layoutData from "../../data/layout.json";

const Footer = () => {
  const { footer: footerData } = layoutData;

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
};

export default Footer;
