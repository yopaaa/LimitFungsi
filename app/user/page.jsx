"use client";

import React, { useEffect, useState } from "react";
import { pb } from "@/utils/db";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { LuBookOpen, LuClock, LuFileText, LuCalendar } from "react-icons/lu";

const UserDashboard = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [classCode, setClassCode] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (pb.authStore.isValid) {
      setUser(pb.authStore.model);
      fetchSubscriptions();
    } else {
      router.push("/auth/login");
    }
  }, [router]);

  const fetchSubscriptions = async () => {
    try {
      // Mengambil data subscription dan melakukan expand ke class_id
      const records = await pb.collection('limit_subscriptions').getFullList({
        filter: `user_id = "${pb.authStore.model.id}"`,
        expand: 'class_id',
      });
      setSubscriptions(records);

      if (records.length > 0) {
        // Ambil semua class_id yang diikuti
        const classIds = records.map(sub => `class_id = "${sub.class_id}"`).join(" || ");
        fetchTasks(classIds);
      }
    } catch (error) {
      console.error("Gagal memuat daftar kelas:", error);
    }
  };

  const fetchTasks = async (filterQuery) => {
    try {
      const taskRecords = await pb.collection('limit_tasks').getFullList({
        filter: filterQuery,
        sort: '-created',
        expand: 'class_id',
      });
      setTasks(taskRecords);
    } catch (err) {
      console.error("Gagal memuat daftar tugas:", err);
    }
  };

  

  if (!user) {
    return <div className={styles.loading}>Memuat data...</div>;
  }

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        

        {/* Bagian Bawah: Daftar Tugas */}
        <div className={styles.fullCard}>
          <div className={styles.sectionHeader}>
            <h2><LuFileText /> Tugas Mendatang</h2>
          </div>
          {tasks.length === 0 ? (
            <p className={styles.emptyText}>Belum ada tugas dari kelas yang Anda ikuti.</p>
          ) : (
            <div className={styles.taskGrid}>
              {tasks.map((task) => (
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
                    {task.file && (
                      <a 
                        href={pb.files.getUrl(task, task.file)} 
                        target="_blank" 
                        rel="noreferrer"
                        className={styles.fileLink}
                      >
                        Lihat Soal
                      </a>
                    )}
                  </div>
                  <button className={styles.submitBtn}>Kumpulkan Tugas</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bagian Bawah: Daftar Kelas yang Diikuti */}
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
