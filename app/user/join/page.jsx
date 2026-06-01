"use client";

import React, { useState, useEffect } from "react";
import { pb } from "@/utils/db";
import styles from "./page.module.css";
import { LuBook, LuUser, LuClock } from "react-icons/lu";

const JoinClassPage = () => {
  const [user, setUser] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [classCode, setClassCode] = useState("");

  useEffect(() => {
    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) {
      const parsedUser = JSON.parse(userInfo);
      setUser(parsedUser);
      fetchSubscriptions(parsedUser.id);
    }
  }, []);

  const fetchSubscriptions = async (userId) => {
    try {
      const records = await pb.collection("limit_subscriptions").getFullList({
        filter: `user_id = "${userId}"`,
        expand: "class_id.admin_id",
        sort: "-created",
      });
      setSubscriptions(records);
    } catch (err) {
      console.error("Gagal mengambil daftar kelas:", err);
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
      fetchSubscriptions(user.id);
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

        <div className={styles.listSection}>
          <h2 className={styles.sectionTitle}>
            <LuBook /> Kelas Saya ({subscriptions.length})
          </h2>
          
          {subscriptions.length === 0 ? (
            <div className={styles.emptyState}>
              <p>Anda belum bergabung dengan kelas mana pun.</p>
            </div>
          ) : (
            <div className={styles.classGrid}>
              {subscriptions.map((sub) => {
                const classData = sub.expand?.class_id;
                const adminData = classData?.expand?.admin_id;
                
                return (
                  <div key={sub.id} className={styles.classCard}>
                    <div className={styles.classHeader}>
                      <h3>{classData?.name}</h3>
                      <span className={styles.codeTag}>{classData?.code}</span>
                    </div>
                    <div className={styles.classDetail}>
                      <p className={styles.adminInfo}>
                        <LuUser size={14} /> Pengajar: {adminData?.nama || adminData?.name || "Admin"}
                      </p>
                      <p className={styles.joinedInfo}>
                        <LuClock size={14} /> Bergabung pada: {new Date(sub.created).toLocaleDateString()}
                      </p>
                    </div>
                    {classData?.description && (
                      <p className={styles.classDesc}>{classData.description}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JoinClassPage;
