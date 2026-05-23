"use client";

import React, { useState } from "react";
import axios from "axios";
import styles from "./page.module.css";

const JoinClassPage = () => {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleJoinClass = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    setIsLoading(true);

    if (!code) {
      setMessage({ type: "error", text: "Kode kelas wajib diisi." });
      setIsLoading(false);
      return;
    }

    try {
      const { data } = await axios.post("/api/classes/subscribe", { code });
      setMessage({ type: "success", text: data.message });
      setCode("");
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Gagal bergabung ke kelas.";
      setMessage({ type: "error", text: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h2 className={styles.title}>Gabung Kelas</h2>
        <p className={styles.linkText} style={{ color: "#666", marginBottom: "20px" }}>
          Masukkan kode kelas yang diberikan oleh guru/admin Anda.
        </p>

        {message.text && (
          <p className={message.type === "error" ? styles.error : styles.success} style={{ textAlign: "center", marginBottom: "10px" }}>
            {message.text}
          </p>
        )}

        <form onSubmit={handleJoinClass} className={styles.form}>
          <input
            className={styles.input}
            placeholder="Kode Kelas (Contoh: KAL101)"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />

          <button 
            type="submit" 
            className={styles.button}
            disabled={isLoading}
          >
            {isLoading ? "Memproses..." : "Gabung Sekarang"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default JoinClassPage;
