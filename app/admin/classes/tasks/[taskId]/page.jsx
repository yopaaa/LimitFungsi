"use client";

import React, { useEffect, useState, use } from "react";
import { pb } from "@/utils/db";
import styles from "./page.module.css";
import { LuArrowLeft, LuFileText, LuCalendar, LuClock, LuDownload, LuExternalLink } from "react-icons/lu";
import Link from "next/link";
import Button from "@/components/UI/Button";
import Modal from "@/components/UI/Modal";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";

const TaskDetailPage = ({ params }) => {
  const { taskId } = use(params);
  const [task, setTask] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [grade, setGrade] = useState("");
       const [feedback, setFeedback] = useState("");
       const [isUpdating, setIsUpdating] = useState(false);


  useEffect(() => {
    fetchTaskDetail();
  }, [taskId]);

   const openDetailModal = (sub) => {
         setSelectedSubmission(sub);
         setGrade(sub.grade === -1 ? "" : sub.grade.toString());
         setFeedback(sub.feedback || "");
         setIsModalOpen(true);
       };
       
       const handleUpdateGrade = async () => {
         if (!selectedSubmission) return;
         setIsUpdating(true);
         try {
           await pb.collection("limit_submissions").update(selectedSubmission.id, {
             grade: parseInt(grade) || 0,
             feedback: feedback,
           });
           
           // Update local state without full refetch for better UX
           setSubmissions(prev => prev.map(s => 
             s.id === selectedSubmission.id 
               ? { ...s, grade: parseInt(grade) || 0, feedback: feedback } 
               : s
           ));
           
           setIsModalOpen(false);
         } catch (err) {
           console.error("Gagal update nilai:", err);
         } finally {
           setIsUpdating(false);
         }
       };
       

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
            <div className={`${styles.card} ${styles.markdownCard}`}>
              <div className={styles.markdownContent}>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || "");
                      return !inline && match ? (
                        <SyntaxHighlighter
                          style={vscDarkPlus}
                          language={match[1]}
                          PreTag="div"
                          {...props}
                        >
                          {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {task.answer || "*Tidak ada kunci jawaban.*"}
                </ReactMarkdown>
              </div>
            </div>
          </section>
        </div>

        <div className={styles.sideContent}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>File Lampiran</h2>
            <div className={styles.card}>
              {task.file ? (
                <a
                  href={pb.files.getURL(task, task.file)}
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
                            {sub.expand?.user_id?.nama || sub.expand?.user_id?.name || "Tanpa Nama"}
                          </span>
                          <span className={styles.studentEmail}>
                            {sub.expand?.user_id?.email}
                          </span>
                        </div>
                      </td>
                      <td>{new Date(sub.created).toLocaleString()}</td>
                      <td>
                        <a
                          href={pb.files.getURL(sub, sub.file)}
                          target="_blank"
                          rel="noreferrer"
                          className={styles.fileLink}
                        >
                          <LuExternalLink size={14} /> Lihat File
                        </a>
                      </td>
                      <td>
                        {sub.grade != -1 ? (
                          <span className={styles.gradeBadge}>{sub.grade}</span>
                        ) : (
                          <span className={styles.noGrade}>Belum Dinilai</span>
                        )}
                      </td>
                      <td>
                        <Button onClick={() => openDetailModal(sub)}>
                          Lihat Detail
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Detail Jawaban: ${selectedSubmission?.expand?.user_id?.nama || "Siswa"}`}
      >
        <div className={styles.modalBody}>
          <div className={styles.markdownCard} style={{ border: 'none', boxShadow: 'none' }}>
            <div className={styles.markdownContent}>
              {selectedSubmission?.answer ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || "");
                      return !inline && match ? (
                        <SyntaxHighlighter
                          style={vscDarkPlus}
                          language={match[1]}
                          PreTag="div"
                          {...props}
                        >
                          {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {selectedSubmission.answer}
                </ReactMarkdown>
              ) : (
                <p>*Siswa tidak menyertakan jawaban teks atau ekstraksi gagal.*</p>
              )}
            </div>
          </div>

          <div className={styles.gradingSection}>
            <h3 className={styles.gradingTitle}>Penilaian</h3>
            <div className={styles.gradingForm}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Nilai (0-100)</label>
                <input
                  type="number"
                  className={styles.gradeInput}
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  placeholder="Contoh: 85"
                  min="0"
                  max="100"
                />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Feedback / Catatan</label>
                <textarea
                  className={styles.feedbackInput}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Berikan masukan untuk siswa..."
                  rows={3}
                />
              </div>
              <Button 
                onClick={handleUpdateGrade} 
                fullWidth 
                disabled={isUpdating}
              >
                {isUpdating ? "Menyimpan..." : "Simpan Nilai"}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TaskDetailPage;
