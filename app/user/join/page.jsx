"use client";

import React, { useState } from "react";
import styles from "./page.module.css";

const JoinClassPage = () => {
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isLoading, setIsLoading] = useState(false);


  const [classCode, setClassCode] = useState("");

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

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.topSection}>
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

       
      </div>
    </div>
  );
};

export default JoinClassPage;
