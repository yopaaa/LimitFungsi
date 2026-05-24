"use client";

import React, { useState } from "react";
import { pb } from "@/utils/db";
import styles from "./page.module.css";
import Button from "@/components/UI/Button";
import InputField from "@/components/UI/InputField";

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
      // 1. Cek apakah kode kelas sudah ada
      try {
        const existingClass = await pb.collection('limit_classes').getFirstListItem(`code="${classData.code}"`);
        if (existingClass) {
          setMessage({ type: "error", text: "Kode kelas sudah digunakan." });
          setIsLoading(false);
          return;
        }
      } catch (err) {
        if (err.status !== 404) throw err;
      }

      // 2. Buat kelas baru di PocketBase
      if (!pb.authStore.isValid) {
        throw new Error("Sesi login berakhir. Silakan login kembali.");
      }

      await pb.collection('limit_classes').create({
        name: classData.name,
        code: classData.code,
        admin_id: pb.authStore.model.id,
      });

      setMessage({ type: "success", text: "Kelas berhasil dibuat!" });
      setClassData({ name: "", code: "" });
    } catch (error) {
      console.error("Error creating class:", error);
      const errorMsg = error.response?.message || error.message || "Gagal membuat kelas.";
      setMessage({ type: "error", text: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title} style={{ color: "var(--primary)" }}>Manajemen Kelas</h1>
        <p className={styles.subtitle}>Buat kelas baru untuk siswa Anda agar mereka dapat bergabung.</p>
      </div>

      <div className={styles.gridContainer}>
        <div className={styles.card}>
          <h2 className={styles.activityTitle} style={{ marginBottom: "1.5rem", borderBottom: "2px solid var(--border)", paddingBottom: "0.5rem" }}>
            Buat Kelas Baru
          </h2>
          
          {message.text && (
            <p style={{ 
              padding: "10px", 
              borderRadius: "var(--radius-sm)", 
              marginBottom: "1rem",
              backgroundColor: message.type === "error" ? "var(--error)" : "var(--success)",
              color: "white",
              fontSize: "14px"
            }}>
              {message.text}
            </p>
          )}

          <form onSubmit={handleCreateClass} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <InputField
              label="Nama Kelas"
              placeholder="Contoh: Kalkulus 1 - Teknik Informatika"
              value={classData.name}
              onChange={(e) => setClassData({ ...classData, name: e.target.value })}
            />

            <InputField
              label="Kode Kelas"
              placeholder="Contoh: KAL101"
              value={classData.code}
              onChange={(e) => setClassData({ ...classData, code: e.target.value })}
            />

            <Button 
              type="submit" 
              fullWidth 
              disabled={isLoading}
            >
              {isLoading ? "Memproses..." : "Buat Kelas Baru"}
            </Button>
          </form>
        </div>

        <div className={styles.card}>
          <h2 className={styles.activityTitle} style={{ color: "var(--primary)" }}>Informasi Bantuan</h2>
          <div style={{ marginTop: "1rem", color: "var(--text-muted)", lineHeight: "1.6" }}>
            <p style={{ marginBottom: "1rem" }}>
              <strong>Langkah-langkah:</strong>
            </p>
            <ol style={{ paddingLeft: "1.2rem" }}>
              <li>Tentukan nama kelas yang deskriptif.</li>
              <li>Buat kode kelas yang unik (maksimal 10 karakter).</li>
              <li>Bagikan kode tersebut kepada siswa Anda.</li>
            </ol>
            <p style={{ marginTop: "1.5rem", fontSize: "13px", fontStyle: "italic" }}>
              *Siswa akan memasukkan kode ini pada menu "Gabung Kelas" di dashboard mereka.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateClassPage;
