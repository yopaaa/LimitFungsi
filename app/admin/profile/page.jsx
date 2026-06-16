"use client";

import React, { useEffect, useState } from "react";
import { pb } from "@/utils/db";
import styles from "./page.module.css";
import { LuUser, LuMail, LuBuilding, LuHash, LuChevronLeft, LuSave, LuX } from "react-icons/lu";
import { useRouter } from "next/navigation";
import Button from "@/components/UI/Button";
import InputField from "@/components/UI/InputField";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    nama: "",
    instansi: "",
  });
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = React.useRef(null);

  useEffect(() => {
    if (pb.authStore.isValid) {
      const userData = pb.authStore.model;
      setUser(userData);
      setEditData({
        nama: userData.nama || "",
        instansi: userData.instansi || "",
      });
    } else {
      router.push("/auth/login");
    }
  }, [router]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      alert("Format file tidak didukung. Harap gunakan PNG, JPG, atau GIF.");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("profile", file);

      const updatedUser = await pb.collection("limit_users").update(user.id, formData);
      setUser(updatedUser);
      alert("Foto profil berhasil diperbarui!");
    } catch (error) {
      console.error("Gagal mengunggah foto:", error);
      alert("Gagal memperbarui foto profil.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      const updatedUser = await pb.collection("limit_users").update(user.id, {
        nama: editData.nama,
        instansi: editData.instansi,
      });
      setUser(updatedUser);
      setIsEditing(false);
      alert("Profil berhasil diperbarui!");
    } catch (error) {
      console.error("Gagal memperbarui profil:", error);
      alert("Gagal memperbarui profil.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return <div className={styles.loading}>Memuat...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button onClick={() => router.back()} className={styles.backBtn}>
          <LuChevronLeft /> Kembali
        </button>
        <h1 className={styles.title}>Profil Saya</h1>
      </div>

      <div className={styles.profileCard}>
        <div className={styles.avatarSection}>
          <div className={styles.avatarWrapper}>
            <div className={styles.avatar}>
              {user.profile ? (
                <img 
                  src={pb.files.getURL(user, user.profile)} 
                  alt="Profile" 
                  className={styles.avatarImg} 
                />
              ) : (
                user.nama?.charAt(0).toUpperCase() || user.username?.charAt(0).toUpperCase()
              )}
            </div>
            <button 
              className={styles.editAvatarBtn} 
              onClick={() => fileInputRef.current.click()}
              disabled={isLoading}
            >
              {isLoading ? "..." : "Ganti"}
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: "none" }} 
              accept="image/png, image/jpeg, image/jpg, image/gif"
              onChange={handleFileChange}
            />
          </div>
          <div className={styles.userName}>
            <h2>{user.nama || user.username}</h2>
            <p>{user.email}</p>
          </div>
        </div>

        {isEditing ? (
          <div className={styles.editForm}>
            <InputField
              label="Nama Lengkap"
              value={editData.nama}
              onChange={(e) => setEditData({ ...editData, nama: e.target.value })}
              placeholder="Masukkan nama lengkap"
            />
            <InputField
              label="Instansi / Sekolah"
              value={editData.instansi}
              onChange={(e) => setEditData({ ...editData, instansi: e.target.value })}
              placeholder="Masukkan nama sekolah atau instansi"
            />
            
            <div className={styles.editActions}>
              <Button onClick={handleSaveProfile} disabled={isLoading}>
                <LuSave size={18} /> Simpan Perubahan
              </Button>
              <Button onClick={() => setIsEditing(false)} disabled={isLoading} style={{ backgroundColor: "var(--error)" }}>
                <LuX size={18} /> Batal
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className={styles.detailsGrid}>
              <div className={styles.detailItem}>
                <div className={styles.detailLabel}>
                  <LuUser size={18} /> Nama Lengkap
                </div>
                <div className={styles.detailValue}>{user.nama || "Belum diatur"}</div>
              </div>

              <div className={styles.detailItem}>
                <div className={styles.detailLabel}>
                  <LuMail size={18} /> Email Terdaftar
                </div>
                <div className={styles.detailValue}>{user.email}</div>
              </div>

              <div className={styles.detailItem}>
                <div className={styles.detailLabel}>
                  <LuBuilding size={18} /> Instansi / Sekolah
                </div>
                <div className={styles.detailValue}>{user.instansi || "-"}</div>
              </div>

              <div className={styles.detailItem}>
                <div className={styles.detailLabel}>
                  <LuHash size={18} /> Kode Identitas
                </div>
                <div className={styles.detailValue}><code>{user.id}</code></div>
              </div>
            </div>

            <div className={styles.actions}>
              <Button fullWidth onClick={() => setIsEditing(true)}>
                Edit Profil
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
