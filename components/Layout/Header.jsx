"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Header.module.css";
import layoutData from "../../data/layout.json";
import { pb } from "@/utils/db";

const Header = () => {
  const pathname = usePathname();
  const { header } = layoutData;
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (pb.authStore.isValid && pb.authStore.model) {
      setUser(pb.authStore.model);
      setIsLoggedIn(true);
    }
  }, []);

  // Logika penentuan teks tombol dan tujuan link berdasarkan router aktif
  const isLoginPage = pathname?.includes("login");

  const buttonText = isLoginPage ? "Daftar" : "Login";
  const buttonLink = isLoginPage ? "/auth/register" : "/auth/login";

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Link Logo kembali ke halaman utama */}
        <Link href="/" className={styles.logo}>
          <img src={header.logo.imgSrc} alt="logo" className={styles.logoImg} />
          {header.logo.text}
        </Link>

        <div className={styles.nav}>
          {header.links.map((link) => (
            <Link key={link.name} href={link.href} className={styles.navText}>
              {link.name}
            </Link>
          ))}

          {isLoggedIn && user ? (
            <Link href={user.role === "admin" ? "/admin" : "/user"} className={styles.profileLink}>
              <div className={styles.avatar}>
                {user.profile ? (
                  <img
                    src={pb.files.getURL(user, user.profile)}
                    alt="Profile"
                    className={styles.avatarImg}
                  />
                ) : (
                  user.nama?.charAt(0).toUpperCase() ||
                  user.username?.charAt(0).toUpperCase() ||
                  "U"
                )}
              </div>
              {/* <span className={styles.dashboardText}>Dashboard</span> */}
            </Link>
          ) : (
            <Link href={buttonLink} className={styles.navBtn}>
              {buttonText}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
