"use client";

import React, { use, useEffect, useState } from "react";
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
  const [classCode, setClassCode] = useState("");

  const [user, setUser] = useState(null);

  const [totalClasses, setTotalClasses] = useState(0);
  const [ClassInfo, setClassInfo] = useState({});

  useEffect(() => {
    const fetchClasses = async () => {
      // Pastikan user sudah login di PocketBase sebelum fetch data
      if (!pb.authStore.isValid || !pb.authStore.model) {
        console.log("User belum login di PocketBase");
        return;
      }

      try {
        const classes = await pb.collection("limit_classes").getFullList(200, {
          filter: `admin_id = "${pb.authStore.model.id}"`,
        });
        setClassInfo(classes);
        setTotalClasses(classes.length);
      } catch (err) {
        console.error("Gagal mengambil data kelas:", err);
      }
    };

    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }

    fetchClasses();
  }, []);

  const handleCreateClass = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    setIsLoading(true);

    // 1. Ambil code langsung dari state user yang sudah di-load di useEffect
    const currentClassCode = user?.classCode;

    // Validasi: Pastikan nama diisi dan kode kelas user ada
    if (!classData.name || !currentClassCode) {
      setMessage({
        type: "error",
        text: "Nama kelas wajib diisi dan kode kelas tidak ditemukan.",
      });
      setIsLoading(false);
      return;
    }

    try {
      // 2. Sesi login check
      if (!pb.authStore.isValid || !pb.authStore.model) {
        throw new Error("Sesi login berakhir. Silakan login kembali.");
      }

      // 3. Cek apakah kelas dengan kode ini sudah pernah dibuat di database
      try {
        const existingClass = await pb
          .collection("limit_classes")
          .getFirstListItem(`code="${currentClassCode}"`);
        if (existingClass) {
          setMessage({
            type: "error",
            text: "Kelas dengan kode ini sudah pernah dibuat sebelumnya.",
          });
          setIsLoading(false);
          return;
        }
      } catch (err) {
        // Jika error 404 (tidak ditemukan), berarti aman untuk lanjut buat baru
        if (err.status !== 404) throw err;
      }

      // 4. Buat kelas baru ke PocketBase memakai kode milik admin tersebut
      await pb.collection("limit_classes").create({
        name: classData.name,
        code: currentClassCode, // <-- Menggunakan kode milik admin
        admin_id: pb.authStore.model.id,
      });

      setMessage({ type: "success", text: "Kelas berhasil dibuat!" });
      setClassData({ name: "", code: "" });

      // Opsional: Langsung ubah totalClasses jadi 1 agar tampilan form langsung hilang
      setTotalClasses(1);
    } catch (error) {
      console.error("Error creating class:", error);
      const errorMsg =
        error.response?.message || error.message || "Gagal membuat kelas.";
      setMessage({ type: "error", text: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  const formAddClass = () => {
    return (
      <div className={styles.gridContainer}>
        <div className={styles.card}>
          <h2
            className={styles.activityTitle}
            style={{
              marginBottom: "1.5rem",
              borderBottom: "2px solid var(--border)",
              paddingBottom: "0.5rem",
            }}
          >
            Buat Kelas Baru
          </h2>

          {message.text && (
            <p
              style={{
                padding: "10px",
                borderRadius: "var(--radius-sm)",
                marginBottom: "1rem",
                backgroundColor:
                  message.type === "error" ? "var(--error)" : "var(--success)",
                color: "white",
                fontSize: "14px",
              }}
            >
              {message.text}
            </p>
          )}

          <form
            onSubmit={handleCreateClass}
            style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
          >
            <InputField
              label="Nama Kelas"
              placeholder="Contoh: Kalkulus 1 - Teknik Informatika"
              value={classData.name}
              onChange={(e) =>
                setClassData({ ...classData, name: e.target.value })
              }
            />

            <InputField
              label="Kode Kelas"
              value={user ? user["classCode"] : ""}
              readOnly={true}
            />

            <Button type="submit" fullWidth disabled={isLoading}>
              {isLoading ? "Memproses..." : "Buat Kelas Baru"}
            </Button>
          </form>
        </div>

        <div className={styles.card}>
          <h2
            className={styles.activityTitle}
            style={{ color: "var(--primary)" }}
          >
            Informasi Bantuan
          </h2>
          <div
            style={{
              marginTop: "1rem",
              color: "var(--text-muted)",
              lineHeight: "1.6",
            }}
          >
            <p style={{ marginBottom: "1rem" }}>
              <strong>Langkah-langkah:</strong>
            </p>
            <ol style={{ paddingLeft: "1.2rem" }}>
              <li>Tentukan nama kelas yang deskriptif.</li>
              <li>Buat kode kelas yang unik (maksimal 10 karakter).</li>
              <li>Bagikan kode tersebut kepada siswa Anda.</li>
            </ol>
            <p
              style={{
                marginTop: "1.5rem",
                fontSize: "13px",
                fontStyle: "italic",
              }}
            >
              *Siswa akan memasukkan kode ini pada menu "Gabung Kelas" di
              dashboard mereka.
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title} style={{ color: "var(--primary)" }}>
          Manajemen {ClassInfo ? `${ClassInfo[0]?.["name"]}` : `Kelas`}
        </h1>
        <p className={styles.subtitle}>
          Buat kelas baru untuk siswa Anda agar mereka dapat bergabung.
        </p>
      </div>

      {/* if total class = 0 show form */}
      {totalClasses === 0 ? (
        formAddClass()
      ) : (
        <div className={styles.emptyState}>
          <p className={styles.emptyMessage}>
            Anda sudah memiliki kelas yang dibuat. Silakan kelola kelas Anda di
            halaman "Daftar Kelas".

            <code>
              {JSON.stringify(ClassInfo, null, 2)} 
            </code>
          </p>
        </div>
      )}
    </div>
  );
};

export default CreateClassPage;
