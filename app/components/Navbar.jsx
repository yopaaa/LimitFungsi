"use client";

import { useState } from 'react';
import Link from 'next/link';
import styles from './styles/Navbar.module.css';

const data = {
  logo: "DEV",
  data: [
    { name: "Tentang", href: "#about" },
    { name: "Artikel", href: "#articles" },
    { name: "Servis", href: "#services" },
    { name: "Sosmed", href: "#social" },
    {
      name: "Kontak",
      href: "mailto:hello@yopaaa.dev",
      btnClass: "contactBtn",
    },
  ],
};

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className={styles.nav}>
      <span className={styles.navLogo}>{data.logo}</span>
      
      {/* Hamburger Menu Button */}
      <button 
        className={`${styles.hamburger} ${isMenuOpen ? styles.active : ''}`}
        onClick={toggleMenu}
        aria-label="Toggle menu"
      >
        <span className={styles.line1}></span>
        <span className={styles.line2}></span>
        <span className={styles.line3}></span>
      </button>

      {/* Navigation Links */}
      <ul className={`${styles.navLinks} ${isMenuOpen ? styles.menuOpen : ''}`}>
        {data.data.map((link) => (
          <li key={link.name}>
            <Link 
              href={link.href} 
              className={link.btnClass || null}
              onClick={closeMenu}
            >
              {link.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}