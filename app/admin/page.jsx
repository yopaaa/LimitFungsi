"use client";

import React, { useEffect, useState } from "react";
import styles from "./page.module.css";
import {
  LuUsers,
  LuFileText,
  LuActivity,
  LuTrophy,
  LuVideo,
  LuArchive,
  LuBookOpen,
  LuClipboardList,
  LuPlus,
  LuPencil,
  LuTrash2,
} from "react-icons/lu";
import Button from "@/components/UI/Button";
import { pb } from "@/utils/db";
import { getActivities, clearActivities } from "@/utils/activityLog";
import Link from "next/link";

const Page = () => {
  const [stats, setStats] = useState([
    {
      label: "Total Mahasiswa",
      value: "0",
      icon: <LuUsers />,
      color: "var(--primary)",
      link: "/admin/students",
    },
    {
      label: "Total Kelas",
      value: "0",
      icon: <LuFileText />,
      color: "var(--accent)",
      link: "/admin/classes",
    }
  ]);

  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      // Jalankan hanya jika token valid dan data model user tersedia
      if (!pb.authStore.isValid || !pb.authStore.model) {
        console.log("Sesi tidak valid atau belum terotentikasi.");
        return;
      }

      try {
        // 1. Ambil jumlah mahasiswa (Pastikan API Rule 'List' di limit_users sudah dibuka)
        const students = await pb
          .collection("limit_subscriptions")
          .getFullList()
          .then((subscriptions) => {
            console.log(subscriptions);

            const userIds = subscriptions.map((sub) => sub.user_id);
            return pb
              .collection("limit_users")
              .getFullList()
              .then((users) =>
                users.filter((user) => userIds.includes(user.id)),
              );
          });

        //   alert(JSON.stringify(students, null, 2)); // Debug: Tampilkan data mahasiswa yang diambil

        // 2. Ambil jumlah kelas milik admin ini
        const classes = await pb.collection("limit_classes").getFullList();

        setStats((prev) => [
          { ...prev[0], value: students },
          { ...prev[1], value: classes },
        ]);
      } catch (error) {
        console.error("Gagal mengambil statistik:", error);
      }
    };

    fetchStats();
    setActivities(getActivities());
  }, []);

  const typeIcons = {
    quiz: <LuTrophy />,
    task: <LuClipboardList />,
    video: <LuVideo />,
    material: <LuArchive />,
    class: <LuBookOpen />,
  };

  const actionIcons = {
    create: <LuPlus />,
    update: <LuPencil />,
    delete: <LuTrash2 />,
  };

  const actionLabels = {
    create: "Membuat",
    update: "Mengedit",
    delete: "Menghapus",
  };

  const typeLabels = {
    quiz: "Kuis",
    task: "Tugas",
    video: "Video",
    material: "Materi",
    class: "Kelas",
  };

  const getTimeAgo = (timestamp) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Baru saja";
    if (minutes < 60) return `${minutes} menit lalu`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} jam lalu`;
    const days = Math.floor(hours / 24);
    return `${days} hari lalu`;
  };

  const handleClearActivities = () => {
    clearActivities();
    setActivities([]);
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title} >
            Dashboard Overview
          </h1>
          <p className={styles.subtitle}>
            Selamat datang kembali, Admin. Berikut ringkasan statistik hari ini.
          </p>
        </div>

        <div className={styles.gridContainer}>
          {stats.map((stat, index) => (
            <Link key={index} href={stat.link} className={styles.card}>
              <div
                className={styles.cardHeader}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1rem",
                }}
              >
                <div className={styles.cardLabel}>{stat.label}</div>
                <div style={{ fontSize: "24px", color: stat.color }}>
                  {stat.icon}
                </div>
              </div>
              <div className={styles.cardValue}>{stat.value.length}</div>
            </Link>
          ))}
        </div>

        <div className={styles.activitySection}>
          <div className={styles.activityHeader}>
            <h2 className={styles.activityTitle}>Recent Activity</h2>
            {activities.length > 0 && (
              <button
                className={styles.clearBtn}
                onClick={handleClearActivities}
              >
                Hapus Semua
              </button>
            )}
          </div>
          <div className={styles.activityContent}>
            {activities.length > 0 ? (
              <div className={styles.activityList}>
                {activities.map((act) => (
                  <div key={act.id} className={styles.activityItem}>
                    <div className={`${styles.activityIcon} ${styles[`icon_${act.action}`]}`}>
                      {typeIcons[act.type] || <LuActivity />}
                    </div>
                    <div className={styles.activityInfo}>
                      <p className={styles.activityText}>
                        <strong>{actionLabels[act.action] || act.action}</strong>{" "}
                        {typeLabels[act.type] || act.type}:{" "}
                        <span className={styles.activityTitle2}>{act.title}</span>
                      </p>
                      <span className={styles.activityTime}>
                        {getTimeAgo(act.timestamp)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <LuActivity
                  size={40}
                  style={{ color: "var(--border)", marginBottom: "1rem" }}
                />
                <p className={styles.emptyMessage}>
                  Tidak ada aktivitas terbaru untuk ditampilkan saat ini.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
