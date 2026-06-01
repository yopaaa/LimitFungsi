"use client";

import React, { useEffect, useState, use } from "react";
import { pb } from "@/utils/db";
import styles from "./page.module.css";
import { LuArrowLeft, LuFileText, LuCalendar, LuClock, LuDownload, LuExternalLink } from "react-icons/lu";
import Link from "next/link";
import Button from "@/components/UI/Button";

const TaskDetailPage = ({ params }) => {
  const { taskId } = use(params);
  const [task, setTask] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTaskDetail();
  }, [taskId]);

  const fetchTaskDetail = async () => {
    try {
      const taskRecord = await pb.collection("limit_tasks").getOne(taskId);
      setTask(taskRecord);
      
      const submissionRecords = await pb.collection("limit_submissions").getFullList({
        filter: `task_id = "${taskId}"`,
        expand: "user_id",
        sort: "-created",
      });
      
      setSubmissions(submissionRecords);
    } catch (err) {
      console.error("Gagal mengambil detail tugas:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className={styles.loading}>Memuat detail tugas...</div>;
  if (!task) return <div className={styles.error}>Tugas tidak ditemukan.</div>;

  return (
    <div className={styles.container}>
      <Link href="/admin/classes" className={styles.backLink}>
        <LuArrowLeft /> Kembali ke Daftar Kelas
      </Link>

      <div className={styles.header}>
        <h1 className={styles.title}>{task.title}</h1>
        <div className={styles.meta}>
          <span className={styles.dateTag}>
            <LuCalendar size={16} /> Dibuat: {new Date(task.created).toLocaleDateString()}
          </span>
          <span className={styles.deadlineInfo}>
            <LuClock size={16} /> Deadline: {new Date(task.deadline).toLocaleString()}
          </span>
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.mainContent}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Deskripsi Tugas</h2>
            <div className={styles.card}>
              <p className={styles.description}>{task.description}</p>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Kunci Jawaban</h2>
            <div className={styles.card}>
             
              <textarea  className={styles.markdownContent} name="" id="" value={task.answer || "Tidak ada kunci jawaban."} readOnly>
               

              </textarea>
            </div>
          </section>
        </div>

        <div className={styles.sideContent}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>File Lampiran</h2>
            <div className={styles.card}>
              {task.file ? (
                <a
                  href={pb.files.getUrl(task, task.file)}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.fileButton}
                >
                  <LuDownload /> Lihat Soal (PDF)
                </a>
              ) : (
                <p>Tidak ada lampiran.</p>
              )}
            </div>
          </section>
        </div>
      </div>

      <section className={styles.section} style={{ marginTop: "2rem" }}>
        <h2 className={styles.sectionTitle}>
          Daftar Pengumpulan Siswa ({submissions.length})
        </h2>
        <div className={styles.tableCard}>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Nama Siswa</th>
                  <th>Waktu Kumpul</th>
                  <th>File Jawaban</th>
                  <th>Nilai</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {submissions.length === 0 ? (
                  <tr>
                    <td colSpan="5" className={styles.emptyRow}>
                      Belum ada siswa yang mengumpulkan.
                    </td>
                  </tr>
                ) : (
                  submissions.map((sub) => (
                    <tr key={sub.id}>
                      <td>
                        <div className={styles.studentInfo}>
                          <span className={styles.studentName}>
                            {sub.expand?.user_id?.nama || "Tanpa Nama"}
                          </span>
                          <span className={styles.studentEmail}>
                            {sub.expand?.user_id?.email}
                          </span>
                        </div>
                      </td>
                      <td>{new Date(sub.created).toLocaleString()}</td>
                      <td>
                        <a
                          href={pb.files.getUrl(sub, sub.file)}
                          target="_blank"
                          rel="noreferrer"
                          className={styles.fileLink}
                        >
                          <LuExternalLink size={14} /> Lihat File
                        </a>
                      </td>
                      <td>
                        {sub.grade ? (
                          <span className={styles.gradeBadge}>{sub.grade}</span>
                        ) : (
                          <span className={styles.noGrade}>Belum Dinilai</span>
                        )}
                      </td>
                      <td>
                        <Button className={styles.actionBtn}>Beri Nilai</Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TaskDetailPage;
