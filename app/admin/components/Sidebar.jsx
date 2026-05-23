'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Sidebar.module.css'; // Import CSS Module
import { pb } from '@/utils/db';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  // Mengambil user info dari pb.authStore.model atau localStorage sebagai fallback
  const user = pb.authStore.model || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('userInfo')) : null);

  const menuItems = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Classes', href: '/admin/classes' }, // Updated to match context
  ];

  console.log('User Info:', user);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    pb.authStore.clear();
    document.cookie = "pb_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    localStorage.removeItem('userInfo');
    window.location.href = '/auth/login';
  };

  return (
    <>
      {/* Button Mobile */}
      <button className={styles.toggleBtn} onClick={toggleSidebar}>
        {isOpen ? '✕' : '☰'}
      </button>

      {/* Overlay */}
      {isOpen && <div className={styles.overlay} onClick={toggleSidebar} />}

      {/* Sidebar */}
      <aside className={`${styles.sidebarContainer} ${isOpen ? styles.visible : styles.hidden}`}>
        <div className={styles.header}>
          <h1 className="text-2xl font-bold">{user ? user.nama : 'Admin'}</h1>
        </div>

        <nav className={styles.nav}>
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`${styles.link} ${isActive ? styles.activeLink : ''}`}
              >
                {item.label}
              </Link>
            );
          })}

           <button
             onClick={handleLogout}
             className={`${styles.link} ${styles.logoutBtn}`}
           >
             Logout
           </button>
        </nav>

        <div className={styles.footer}>
          <Link href="/" className={styles.backBtn}>
            Back to Home
          </Link>
        </div>
      </aside>
    </>
  );
}
        