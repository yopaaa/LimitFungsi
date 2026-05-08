import Link from 'next/link';
import styles from './styles/Navbar.module.css';

export default function Navbar() {
  return (
    <nav className={styles.nav}>
      <span className={styles.navLogo}>RP//DEV</span>
      <ul className={styles.navLinks}>
        <li><Link href="#about">Tentang</Link></li>
        <li><Link href="#articles">Artikel</Link></li>
        <li><Link href="#services">Servis</Link></li>
        <li><Link href="#social">Sosmed</Link></li>
        <li>
          <Link href="mailto:hello@yopaaa.dev" className={styles.contactBtn}>
            Kontak →
          </Link>
        </li>
      </ul>
    </nav>
  );
}