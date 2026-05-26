"use client";

import React, { useEffect } from "react";
import styles from "./page.module.css";
import { LuUsers, LuFileText, LuActivity, LuArrowRight } from "react-icons/lu";
import Button from "@/components/UI/Button";
import { pb } from "@/utils/db";
import Link from "next/link";

const Page = () => {
  const [stats, setStats] = React.useState([
    {
        link: "/admin/students",
      label: "Total Mahasiswa",
      value: "0",
      icon: <LuUsers />,
      color: "var(--primary)",
    },
    {
        link: "/admin/classes",
      label: "Total Kelas",
      value: "0",
      icon: <LuFileText />,
      color: "var(--accent)",
    },
    {
        link: "/admin/sessions",
      label: "Active Sessions",
      value: "-",
      icon: <LuActivity />,
      color: "var(--success)",
    },
  ]);

  

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
          prev[2],
        ]);
      } catch (error) {
        console.error("Gagal mengambil statistik:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title} style={{ color: "var(--primary)" }}>
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
          </div>
          <div className={styles.activityContent}>
            <div className={styles.emptyState}>
              <LuActivity
                size={40}
                style={{ color: "var(--border)", marginBottom: "1rem" }}
              />
              <p className={styles.emptyMessage}>
                Tidak ada aktivitas terbaru untuk ditampilkan saat ini.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
