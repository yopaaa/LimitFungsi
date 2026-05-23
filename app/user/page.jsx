"use client";

import React, { useEffect, useState } from "react";
import { pb } from "@/utils/db";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

const UserDashboard = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [classCode, setClassCode] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (pb.authStore.isValid) {
      setUser(pb.authStore.model);
      fetchSubscriptions();
    } else {
      router.push("/auth/login");
    }
  }, [router]);

  const fetchSubscriptions = async () => {
    try {
      // Mengambil data subscription dan melakukan expand ke class_id
      const records = await pb.collection('limit_subscriptions').getFullList({
        filter: `user_id = "${pb.authStore.model.id}"`,
        expand: 'class_id',
      });
      setSubscriptions(records);
    } catch (error) {
      console.error("Gagal memuat daftar kelas:", error);
    }
  };

  const handleJoinClass = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    setIsLoading(true);

    if (!classCode) {
      setMessage({ type: "error", text: "Kode kelas wajib diisi." });
      setIsLoading(false);
      return;
    }

    try {
      // 1. Cari kelas berdasarkan kode
      const targetClass = await pb.collection('limit_classes').getFirstListItem(`code="${classCode}"`);

      // 2. Cek apakah sudah subscribe
      try {
        const existingSub = await pb.collection('limit_subscriptions').getFirstListItem(
          `user_id="${user.id}" && class_id="${targetClass.id}"`
        );
        if (existingSub) {
          setMessage({ type: "error", text: "Anda sudah terdaftar di kelas ini." });
          setIsLoading(false);
          return;
        }
      } catch (err) {
        if (err.status !== 404) throw err;
      }

      // 3. Buat subscription baru
      await pb.collection('limit_subscriptions').create({
        user_id: user.id,
        class_id: targetClass.id,
      });

      setMessage({ type: "success", text: "Berhasil bergabung ke kelas!" });
      setClassCode("");
      fetchSubscriptions(); // Refresh daftar kelas
    } catch (error) {
      console.error("Gagal bergabung ke kelas:", error);
      const errorMsg = error.status === 404 ? "Kelas tidak ditemukan." : "Gagal bergabung ke kelas.";
      setMessage({ type: "error", text: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    pb.authStore.clear();
    document.cookie = "pb_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    localStorage.removeItem('userInfo');
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
        {/* Baris Atas: Profil & Tambah Kelas */}
        <div className={styles.grid}>
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
              <label>Instansi:</label>
              <p>{user.instansi || "-"}</p>
            </div>
          </div>

          <div className={styles.card}>
            <h2>Tambah Kelas Baru</h2>
            {message.text && (
              <p className={message.type === "error" ? styles.errorMsg : styles.successMsg}>
                {message.text}
              </p>
            )}
            <form onSubmit={handleJoinClass} className={styles.joinForm}>
              <input
                className={styles.input}
                placeholder="Masukkan Kode Kelas"
                value={classCode}
                onChange={(e) => setClassCode(e.target.value)}
              />
              <button type="submit" className={styles.joinBtn} disabled={isLoading}>
                {isLoading ? "Memproses..." : "Gabung Kelas"}
              </button>
            </form>
          </div>
        </div>

        {/* Bagian Bawah: Daftar Kelas yang Diikuti */}
        <div className={styles.fullCard}>
          <h2>Kelas yang Diikuti</h2>
          {subscriptions.length === 0 ? (
            <p className={styles.emptyText}>Anda belum mengikuti kelas manapun.</p>
          ) : (
            <div className={styles.classList}>
              {subscriptions.map((sub) => (
                <div key={sub.id} className={styles.classItem}>
                  <div className={styles.classInfo}>
                    <h3>{sub.expand?.class_id?.name}</h3>
                    <code>#{sub.expand?.class_id?.code}</code>
                  </div>
                  <button className={styles.viewBtn}>Lihat Materi</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;
