"use client";

import React, { useState } from "react";
import axios from "axios";
import styles from "./page.module.css";
import authStyles from "../../auth/login/page.module.css";

const CreateClassPage = () => {
  const [classData, setClassData] = useState({
    name: "",
    code: "",
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateClass = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    setIsLoading(true);

    if (!classData.name || !classData.code) {
      setMessage({ type: "error", text: "Nama dan kode kelas wajib diisi." });
      setIsLoading(false);
      return;
    }

    try {
      const { data } = await axios.post("/api/classes/create", classData);
      setMessage({ type: "success", text: data.message });
      setClassData({ name: "", code: "" });
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Gagal membuat kelas.";
      setMessage({ type: "error", text: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Manajemen Kelas</h1>
        <p className={styles.subtitle}>Buat kelas baru untuk siswa Anda.</p>
      </div>

      <div className={styles.gridContainer}>
        <div className={styles.card}>
          <h2 className={styles.activityTitle} style={{ marginBottom: "1rem" }}>Buat Kelas Baru</h2>
          
          {message.text && (
            <p className={message.type === "error" ? authStyles.error : authStyles.success}>
              {message.text}
            </p>
          )}

          <form onSubmit={handleCreateClass} className={authStyles.form}>
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label className={styles.cardLabel}>Nama Kelas</label>
              <input
                className={authStyles.input}
                placeholder="Contoh: Kalkulus 1 - Teknik Informatika"
                value={classData.name}
                onChange={(e) => setClassData({ ...classData, name: e.target.value })}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label className={styles.cardLabel}>Kode Kelas</label>
              <input
                className={authStyles.input}
                placeholder="Contoh: KAL101"
                value={classData.code}
                onChange={(e) => setClassData({ ...classData, code: e.target.value })}
              />
            </div>

            <button type="submit" className={authStyles.button} disabled={isLoading}>
              {isLoading ? "Memproses..." : "Buat Kelas"}
            </button>
          </form>
        </div>

        <div className={styles.card}>
          <h2 className={styles.activityTitle}>Informasi</h2>
          <p className={styles.subtitle} style={{ marginTop: "1rem" }}>
            Berikan kode kelas kepada siswa Anda agar mereka dapat bergabung. 
            Setiap kode harus bersifat unik.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreateClassPage;
