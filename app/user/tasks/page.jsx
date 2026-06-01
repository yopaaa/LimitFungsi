"use client";

import React, { useEffect, useState } from "react";
import { pb } from "@/utils/db";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { LuClock, LuFileText, LuCalendar, LuUpload, LuCheckCheck } from "react-icons/lu";
import Modal from "@/components/UI/Modal";

const TasksPage = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

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
      });

      if (records.length > 0) {
        const classIds = records.map(sub => `class_id = "${sub.class_id}"`).join(" || ");
        const taskRecords = await pb.collection('limit_tasks').getFullList({
          filter: classIds,
          sort: '-created',
          expand: 'class_id',
        });
        setTasks(taskRecords);
      }
      
      const submissionRecords = await pb.collection('limit_submissions').getFullList({
        filter: `user_id = "${pb.authStore.model.id}"`,
      });
      setSubmissions(submissionRecords);
    } catch (error) {
      console.error("Gagal memuat data:", error);
    }
  };

  const handleOpenSubmitModal = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
    setUploadFile(null);
    setNotes("");
    setMessage({ type: "", text: "" });
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setUploadFile(e.target.files[0]);
    }
  };

  const handleSubmitTask = async (e) => {
    e.preventDefault();
    if (!uploadFile || !selectedTask) return;
    setIsSubmitting(true);
    setMessage({ type: "", text: "" });

    try {
      const formData = new FormData();
      formData.append('task_id', selectedTask.id);
      formData.append('user_id', user.id);
      formData.append('file', uploadFile);
      formData.append('note', notes);

      await pb.collection('limit_submissions').create(formData);
      
      setMessage({ type: "success", text: "Tugas berhasil dikumpulkan!" });
      setTimeout(() => {
        setIsModalOpen(false);
        fetchData();
      }, 2000);
    } catch (error) {
      console.error("Error submitting task:", error);
      setMessage({ type: "error", text: "Gagal mengumpulkan tugas. Coba lagi nanti." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isTaskSubmitted = (taskId) => {
    return submissions.some(sub => sub.task_id === taskId);
  };

  const pendingTasks = tasks.filter(task => !isTaskSubmitted(task.id));
  const completedTasks = tasks.filter(task => isTaskSubmitted(task.id));

  if (!user) return <div className={styles.loading}>Memuat data...</div>;

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div className={styles.fullCard}>
          <div className={styles.sectionHeader}>
            <div className={styles.headerTitle}>
              <h2><LuFileText /> Manajemen Tugas</h2>
            </div>
            <div className={styles.tabs}>
              <button 
                className={`${styles.tabItem} ${activeTab === "pending" ? styles.activeTab : ""}`}
                onClick={() => setActiveTab("pending")}
              >
                Belum Dikerjakan ({pendingTasks.length})
              </button>
              <button 
                className={`${styles.tabItem} ${activeTab === "submitted" ? styles.activeTab : ""}`}
                onClick={() => setActiveTab("submitted")}
              >
                Sudah Dikumpulkan ({completedTasks.length})
              </button>
            </div>
          </div>

          {activeTab === "pending" ? (
            pendingTasks.length === 0 ? (
              <p className={styles.emptyText}>Tidak ada tugas yang perlu dikerjakan. ✨</p>
            ) : (
              <div className={styles.taskGrid}>
                {pendingTasks.map((task) => (
                  <div key={task.id} className={styles.taskCard}>
                    <div className={styles.taskCardHeader}>
                      <h3>{task.title}</h3>
                      <span className={styles.classBadge}>{task.expand?.class_id?.name}</span>
                    </div>
                    <p className={styles.taskDesc}>{task.description}</p>
                    <div className={styles.taskFooter}>
                      <div className={styles.deadline}>
                        <LuClock size={14} />
                        <span>{new Date(task.deadline).toLocaleString()}</span>
                      </div>
                      {task.file && (
                        <a href={pb.files.getUrl(task, task.file)} target="_blank" rel="noreferrer" className={styles.fileLink}>Lihat Soal</a>
                      )}
                    </div>
                    <button className={styles.submitBtn} onClick={() => handleOpenSubmitModal(task)}>Kumpulkan Tugas</button>
                  </div>
                ))}
              </div>
            )
          ) : (
            completedTasks.length === 0 ? (
              <p className={styles.emptyText}>Belum ada riwayat tugas.</p>
            ) : (
              <div className={styles.taskGrid}>
                {completedTasks.map((task) => {
                  const submission = submissions.find(s => s.task_id === task.id);
                  return (
                    <div key={task.id} className={`${styles.taskCard} ${styles.completedCard}`}>
                      <div className={styles.taskCardHeader}>
                        <h3>{task.title}</h3>
                        <span className={`${styles.classBadge} ${styles.submittedBadge}`}><LuCheckCheck size={12} /> Terkirim</span>
                      </div>
                      <p className={styles.taskDesc}>{task.description}</p>
                      <div className={styles.taskFooter}>
                        <div className={styles.submissionInfo}>
                          <LuCalendar size={14} />
                          <span>Dikumpul: {new Date(submission?.created).toLocaleDateString()}</span>
                        </div>
                        {submission?.file && (
                          <a href={pb.files.getUrl(submission, submission.file)} target="_blank" rel="noreferrer" className={styles.fileLink}>File Jawaban</a>
                        )}
                      </div>
                      <div className={styles.gradeSection}>
                        {submission?.grade ? (
                          <div className={styles.gradeBadge}>Nilai: {submission.grade}</div>
                        ) : (
                          <div className={styles.pendingGrade}>Menunggu Penilaian</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>
      </main>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Kumpulkan: ${selectedTask?.title}`}>
        <form onSubmit={handleSubmitTask} className={styles.submitForm}>
          <div className={styles.uploadArea}>
            <LuUpload size={40} className={styles.uploadIcon} />
            <p>Pilih file jawaban Anda (PDF)</p>
            <input type="file" accept=".pdf" onChange={handleFileChange} required className={styles.fileInput} />
            {uploadFile && <p className={styles.fileName}>{uploadFile.name}</p>}
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Catatan (Opsional)</label>
            <textarea className={styles.textarea} placeholder="Tambahkan catatan..." value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          {message.text && (
            <div className={message.type === "error" ? styles.errorMsg : styles.successMsg}>{message.text}</div>
          )}
          <button type="submit" className={styles.joinBtn} disabled={isSubmitting || !uploadFile}>
            {isSubmitting ? "Mengirim..." : "Kirim Jawaban"}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default TasksPage;
