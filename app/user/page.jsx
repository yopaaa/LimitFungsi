"use client";

import React, { useEffect, useState } from "react";
import { pb } from "@/utils/db";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.css";
import { LuBookOpen, LuClock, LuFileText, LuArrowRight } from "react-icons/lu";

const UserDashboard = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [pendingTasks, setPendingTasks] = useState([]);

  useEffect(() => {
    if (pb.authStore.isValid) {
      setUser(pb.authStore.model);
      fetchData();
    } else {
      router.push("/auth/login");
    }
  }, [router]);

  const fetchData = async () => {
    try {
      const records = await pb.collection('limit_subscriptions').getFullList({
        filter: `user_id = "${pb.authStore.model.id}"`,
        expand: 'class_id',
      });
      setSubscriptions(records);

      if (records.length > 0) {
        const classIds = records.map(sub => `class_id = "${sub.class_id}"`).join(" || ");
        
        // Ambil semua tugas
        const allTasks = await pb.collection('limit_tasks').getFullList({
          filter: classIds,
          sort: '-created',
          expand: 'class_id',
        });

        // Ambil submission user
        const submissions = await pb.collection('limit_submissions').getFullList({
          filter: `user_id = "${pb.authStore.model.id}"`,
        });

        // Filter hanya yang belum dikumpulkan
        const pending = allTasks.filter(task => 
          !submissions.some(sub => sub.task_id === task.id)
        );
        
        setPendingTasks(pending);
      }
    } catch (error) {
      console.error("Gagal memuat data:", error);
    }
  };

  if (!user) {
    return <div className={styles.loading}>Memuat data...</div>;
  }

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        {/* Ringkasan Tugas Pending */}
        <div className={styles.fullCard}>
          <div className={styles.sectionHeader} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2><LuFileText /> Tugas Belum Selesai</h2>
            <Link href="/user/tasks" className={styles.fileLink} style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              Lihat Semua <LuArrowRight />
            </Link>
          </div>
          
          {pendingTasks.length === 0 ? (
            <p className={styles.emptyText}>Bagus! Tidak ada tugas yang tertunda. 🎉</p>
          ) : (
            <div className={styles.taskGrid}>
              {pendingTasks.slice(0, 4).map((task) => (
                <div key={task.id} className={styles.taskCard}>
                  <div className={styles.taskCardHeader}>
                    <h3>{task.title}</h3>
                    <span className={styles.classBadge}>
                      {task.expand?.class_id?.name}
                    </span>
                  </div>
                  <p className={styles.taskDesc}>{task.description}</p>
                  <div className={styles.taskFooter}>
                    <div className={styles.deadline}>
                      <LuClock size={14} />
                      <span>{new Date(task.deadline).toLocaleString()}</span>
                    </div>
                  </div>
                  <Link href="/user/tasks" className={styles.submitBtn}>
                    Kerjakan Tugas
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Daftar Kelas */}
        <div className={styles.fullCard} style={{ marginTop: "2rem" }}>
          <div className={styles.sectionHeader}>
            <h2><LuBookOpen /> Kelas yang Diikuti</h2>
          </div>
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

