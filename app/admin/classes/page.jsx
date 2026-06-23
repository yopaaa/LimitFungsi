"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { pb } from "@/utils/db";
import styles from "./page.module.css";
import Button from "@/components/UI/Button";
import InputField from "@/components/UI/InputField";
import Modal from "@/components/UI/Modal";
import { LuPlus, LuFileText, LuCalendar, LuClock } from "react-icons/lu";
import { logActivity } from "@/utils/activityLog";

const ClassesPage = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [classInfo, setClassInfo] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Form State for New Task
  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    deadlineDate: "",
    deadlineTime: "23:59",
    file: null, // Ini untuk File Soal (disimpan ke PB)
    answerFile: null, // Ini untuk File Kunci Jawaban (hanya untuk ekstraksi)
    answer: "", // Hasil ekstraksi markdown
  });

  // State for Create Class Form
  const [newClassData, setNewClassData] = useState({ name: "" });

  useEffect(() => {
    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
    fetchClassData();
  }, []);

  const handleExtractAnswer = async () => {
    if (!taskData.answerFile) {
      setMessage({
        type: "error",
        text: "Pilih file kunci jawaban terlebih dahulu untuk diekstrak!",
      });
      return;
    }

    setIsExtracting(true);
    setMessage({ type: "", text: "" });

    try {
      const formData = new FormData();
      formData.append("file", taskData.answerFile);

      const response = await fetch("/api/extract-answer", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setTaskData((prev) => ({ ...prev, answer: data.markdown }));
      setMessage({
        type: "success",
        text: "Kunci jawaban berhasil diekstrak!",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: "Gagal mengekstrak jawaban: " + error.message,
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const fetchClassData = async () => {
    if (!pb.authStore.isValid || !pb.authStore.model) return;

    try {
      // Get Class
      const records = await pb.collection("limit_classes").getFullList({
        filter: `admin_id = "${pb.authStore.model.id}"`,
      });

      if (records.length > 0) {
        const currentClass = records[0];
        setClassInfo(currentClass);
        fetchTasks(currentClass.id);
      }
    } catch (err) {
      console.error("Gagal mengambil data kelas:", err);
    }
  };

  const fetchTasks = async (classId) => {
    try {
      const taskRecords = await pb.collection("limit_tasks").getFullList({
        filter: `class_id = "${classId}"`,
        sort: "-created",
      });
      setTasks(taskRecords);
    } catch (err) {
      console.error("Gagal mengambil data tugas:", err);
    }
  };

  const handleTaskClick = (task) => {
    router.push(`/admin/classes/tasks/${task.id}`);
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const currentClassCode = user?.classCode;
      if (!newClassData.name || !currentClassCode) {
        throw new Error("Nama kelas wajib diisi.");
      }

      await pb.collection("limit_classes").create({
        name: newClassData.name,
        code: currentClassCode,
        admin_id: pb.authStore.model.id,
      });

      logActivity({ type: "class", action: "create", title: newClassData.name });

      setMessage({ type: "success", text: "Kelas berhasil dibuat!" });
      fetchClassData();
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const deadlineObj = new Date(`${taskData.deadlineDate}T${taskData.deadlineTime}:00`);
      const combinedDeadline = deadlineObj.toISOString();

      const formData = new FormData();
      formData.append("class_id", classInfo.id);
      formData.append("title", taskData.title);
      formData.append("description", taskData.description);
      formData.append("deadline", combinedDeadline);
      formData.append("answer", taskData.answer);
      if (taskData.file) {
        formData.append("file", taskData.file);
      }

      await pb.collection("limit_tasks").create(formData);

      logActivity({ type: "task", action: "create", title: taskData.title });

      setMessage({ type: "success", text: "Tugas berhasil ditambahkan!" });
      setTaskData({
        title: "",
        description: "",
        deadlineDate: "",
        deadlineTime: "23:59",
        file: null,
        answerFile: null,
        answer: "",
      });
      setIsModalOpen(false);
      fetchTasks(classInfo.id);
    } catch (error) {
      setMessage({
        type: "error",
        text: "Gagal membuat tugas. Pastikan semua field terisi.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const overdueTasks = tasks.filter(task => new Date(task.deadline) < new Date());
  const upcomingTasks = tasks.filter(task => new Date(task.deadline) >= new Date());

  if (classInfo) {
    return (
      <div className={styles.container}>
        {message.text && (
          <p
            className={
              message.type === "error" ? styles.errorMsg : styles.successMsg
            }
          >
            {message.text}
          </p>
        )}
        <div className={styles.headerFlex}>
          <div className={styles.headerText}>
            <h1 className={styles.title}>{classInfo.name}</h1>
            <p className={styles.subtitle}>
              Kode Kelas:{" "}
              <code className={styles.codeBadge}>{classInfo.code}</code>
            </p>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            // className={styles.addBtn}
          >
            <LuPlus /> Tambah Tugas
          </Button>
        </div>

        {tasks.length === 0 ? (
          <div className={styles.emptyTasks}>
            <p>Belum ada tugas yang dibuat untuk kelas ini.</p>
          </div>
        ) : (
          <div className={styles.taskSections}>
            {upcomingTasks.length > 0 && (
              <div className={styles.section}>
                <div className={styles.sectionTitle}>
                  <LuFileText /> Daftar Tugas Aktif (Belum Deadline)
                </div>
                <div className={styles.taskGrid}>
                  {upcomingTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`${styles.taskCard} ${styles.clickableCard}`}
                      onClick={() => handleTaskClick(task)}
                    >
                      <div className={styles.taskHeader}>
                        <h3>{task.title}</h3>
                        <span className={styles.dateTag}>
                          <LuCalendar size={14} />{" "}
                          {new Date(task.created).toLocaleDateString()}
                        </span>
                      </div>
                      <p className={styles.taskDesc}>{task.description}</p>
                      <div className={styles.taskFooter}>
                        <div className={styles.deadlineInfo}>
                          <LuClock size={14} />
                          <span>
                            Deadline: {new Date(task.deadline).toLocaleString()}
                          </span>
                        </div>
                        {task.file && (
                          <a
                            href={pb.files.getURL(task, task.file)}
                            target="_blank"
                            rel="noreferrer"
                            className={styles.fileLink}
                            onClick={(e) => e.stopPropagation()}
                          >
                            Lihat Soal
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {overdueTasks.length > 0 && (
              <div className={styles.section}>
                <div className={styles.sectionTitle}>
                  <LuClock /> Tugas Selesai (Lewat Deadline)
                </div>
                <div className={styles.taskGrid}>
                  {overdueTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`${styles.taskCard} ${styles.clickableCard} ${styles.overdueCard}`}
                      onClick={() => handleTaskClick(task)}
                    >
                      <div className={styles.taskHeader}>
                        <h3>{task.title}</h3>
                        <span className={styles.dateTag}>
                          <LuCalendar size={14} />{" "}
                          {new Date(task.created).toLocaleDateString()}
                        </span>
                      </div>
                      <p className={styles.taskDesc}>{task.description}</p>
                      <div className={styles.taskFooter}>
                        <div className={`${styles.deadlineInfo} ${styles.overdueText}`}>
                          <LuClock size={14} />
                          <span>
                            Deadline: {new Date(task.deadline).toLocaleString()}
                          </span>
                        </div>
                        {task.file && (
                          <a
                            href={pb.files.getURL(task, task.file)}
                            target="_blank"
                            rel="noreferrer"
                            className={styles.fileLink}
                            onClick={(e) => e.stopPropagation()}
                          >
                            Lihat Soal
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Buat Tugas Baru"
          style={{maxWidth: "70%"}}
        >
          <form onSubmit={handleCreateTask} className={styles.formStack}>
            <div className={styles.formContainer}>
              <div>
                {message.text && (
                  <p
                    className={
                      message.type === "error"
                        ? styles.errorMsg
                        : styles.successMsg
                    }
                  >
                    {message.text}
                  </p>
                )}
                <InputField
                  label="Judul Tugas"
                  placeholder="Contoh: Latihan Turunan Fungsi"
                  value={taskData.title}
                  onChange={(e) =>
                    setTaskData({ ...taskData, title: e.target.value })
                  }
                  required
                />
                <div className={styles.formGroup}>
                  <label className={styles.label}>Deskripsi</label>
                  <textarea
                    className={styles.textarea}
                    placeholder="Berikan instruksi detail tugas di sini..."
                    value={taskData.description}
                    onChange={(e) =>
                      setTaskData({ ...taskData, description: e.target.value })
                    }
                    required
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.label}>Lampiran Soal (PDF)</label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) =>
                      setTaskData({ ...taskData, file: e.target.files[0] })
                    }
                    className={styles.fileInput}
                    required
                  />
                </div>

                <div className={styles.deadlineGrid}>
                  <InputField
                    label="Tanggal Deadline"
                    type="date"
                    value={taskData.deadlineDate}
                    onChange={(e) =>
                      setTaskData({ ...taskData, deadlineDate: e.target.value })
                    }
                    required
                  />
                  <InputField
                    label="Jam"
                    type="time"
                    value={taskData.deadlineTime}
                    onChange={(e) =>
                      setTaskData({ ...taskData, deadlineTime: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    File Kunci Jawaban (Untuk Ekstraksi)
                  </label>
                  <div className={styles.fileActionGroup}>
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      onChange={(e) =>
                        setTaskData({
                          ...taskData,
                          answerFile: e.target.files[0],
                        })
                      }
                      className={styles.fileInput}
                    />
                    <Button
                      type="button"
                      // className={styles.extractBtn}
                      onClick={handleExtractAnswer}
                      disabled={isExtracting}
                    >
                      {isExtracting ? "Memproses..." : "Ekstrak"}
                    </Button>
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Kunci Jawaban (Hasil Markdown)
                  </label>
                  <textarea
                    className={styles.textarea}
                    placeholder="Hasil ekstraksi akan muncul di sini..."
                    value={taskData.answer}
                    onChange={(e) =>
                      setTaskData({ ...taskData, answer: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
            </div>

            <Button type="submit" fullWidth disabled={isLoading}>
              {isLoading ? "Mengunggah..." : "Publikasikan Tugas"}
            </Button>
          </form>
        </Modal>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Buat Kelas Baru</h1>
        <p className={styles.subtitle}>
          Anda belum memiliki kelas. Silakan buat kelas pertama Anda.
        </p>
      </div>
      <div className={styles.card} style={{ maxWidth: "500px" }}>
        {message.text && (
          <p
            className={
              message.type === "error" ? styles.errorMsg : styles.successMsg
            }
          >
            {message.text}
          </p>
        )}
        <form onSubmit={handleCreateClass} className={styles.formStack}>
          <InputField
            label="Nama Kelas"
            placeholder="Contoh: Kalkulus 1"
            value={newClassData.name}
            onChange={(e) => setNewClassData({ name: e.target.value })}
          />
          <InputField
            label="Kode Kelas (Otomatis)"
            value={user?.classCode || ""}
            readOnly
          />
          <Button type="submit" fullWidth disabled={isLoading}>
            {isLoading ? "Memproses..." : "Buat Kelas"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ClassesPage;
