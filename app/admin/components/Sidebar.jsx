'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Sidebar.module.css'; // Import CSS Module
import Cookie from 'js-cookie';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const user = Cookie.get('userInfo') ? JSON.parse(Cookie.get('userInfo')) : null;

  const menuItems = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Users', href: '/admin/users' },
    { label: 'Posts', href: '/admin/posts' },
    { label: 'Settings', href: '/admin/settings' },
  ];

  console.log('User Info from Cookie:', user);

  const toggleSidebar = () => setIsOpen(!isOpen);

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
             onClick={() => {
               fetch('/api/logout', { method: 'POST' })
                 .then(() => {
                   Cookie.remove('userInfo');
                   window.location.href = '/';
                 })
                 .catch((error) => console.error('Logout error:', error));
             }}
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
        