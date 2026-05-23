"use client";

import React, { useEffect, useState } from "react";
import { pb } from "@/utils/db";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

const UserDashboard = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Ambil data user dari PocketBase authStore
    if (pb.authStore.isValid) {
      setUser(pb.authStore.model);
    } else {
      router.push("/auth/login");
    }
  }, [router]);

  const handleLogout = () => {
    // 1. Hapus auth store dari memori
    pb.authStore.clear();
    
    // 2. Hapus cookie secara manual (untuk memastikan Middleware mendeteksi logout segera)
    document.cookie = "pb_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    
    // 3. Bersihkan localStorage
    localStorage.removeItem('userInfo');
    
    // 4. Redirect ke login
    router.push("/auth/login");
  };

  if (!user) {
    return <div className={styles.loading}>Memuat data...</div>;
  }

  return (
    <div className={styles.container}>
      <nav className={styles.navbar}>
        <h1>Dashboard Siswa</h1>
        <button onClick={handleLogout} className={styles.logoutBtn}>Keluar</button>
      </nav>

      <main className={styles.main}>
        <div className={styles.card}>
          <h2>Profil Pengguna</h2>
          <div className={styles.infoGroup}>
            <label>Nama Lengkap:</label>
            <p>{user.nama || "Belum diatur"}</p>
          </div>
          <div className={styles.infoGroup}>
            <label>Email:</label>
            <p>{user.email}</p>
          </div>
          <div className={styles.infoGroup}>
            <label>Nomor Telepon:</label>
            <p>{user.nomor || "-"}</p>
          </div>
          <div className={styles.infoGroup}>
            <label>Instansi:</label>
            <p>{user.instansi || "-"}</p>
          </div>
          <div className={styles.infoGroup}>
            <label>Role:</label>
            <span className={styles.badge}>{user.role}</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;
