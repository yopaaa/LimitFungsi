"use client";

import React, { useEffect, useState } from "react";
import styles from "./page.module.css";
import Button from "@/components/UI/Button";
import InputField from "@/components/UI/InputField";
import Modal from "@/components/UI/Modal";
import { pb } from "@/utils/db";
import { logActivity } from "@/utils/activityLog";
import { useRouter } from "next/navigation";
import { LuPlus, LuPencil, LuTrash2, LuClock, LuBookOpen, LuClipboardList } from "react-icons/lu";

const QuizzesAdminPage = () => {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("add"); // "add" | "edit"
  const [currentQuizId, setCurrentQuizId] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const initialFormState = {
    title: "",
    description: "",
    class_id: "",
    time_limit: "",
    questions: [],
  };

  const [formState, setFormState] = useState(initialFormState);

  useEffect(() => {
    fetchQuizzesAndClasses();
  }, []);

  const fetchQuizzesAndClasses = async () => {
    try {
      setLoading(true);
      if (!pb.authStore.isValid || !pb.authStore.model) return;

      const adminId = pb.authStore.model.id;

      // Ambil data kuis
      const quizRecords = await pb.collection("limit_quizzes").getFullList({
        sort: "-created",
        filter: `admin_id = "${adminId}"`,
        expand: "class_id",
      });

      // Ambil data kelas untuk pilihan dropdown
      const classRecords = await pb.collection("limit_classes").getFullList({
        filter: `admin_id = "${adminId}"`,
      });

      setQuizzes(quizRecords);
      setClasses(classRecords);
    } catch (error) {
      console.error("Gagal mengambil data kuis dan kelas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Apakah Anda yakin ingin menghapus kuis ini?")) return;
    try {
      const deletedQuiz = quizzes.find((q) => q.id === id);
      await pb.collection("limit_quizzes").delete(id);
      logActivity({ type: "quiz", action: "delete", title: deletedQuiz?.title || "Kuis" });
      setQuizzes(quizzes.filter((q) => q.id !== id));
    } catch (error) {
      console.error("Gagal menghapus kuis:", error);
      alert("Gagal menghapus kuis.");
    }
  };

  const openAddModal = () => {
    setModalType("add");
    setFormState(initialFormState);
    setIsModalOpen(true);
  };

  const openEditModal = (quiz) => {
    setModalType("edit");
    setCurrentQuizId(quiz.id);
    setFormState({
      title: quiz.title,
      description: quiz.description,
      class_id: quiz.class_id || "",
      time_limit: quiz.time_limit ? quiz.time_limit.toString() : "",
      questions: Array.isArray(quiz.questions) ? quiz.questions : [],
    });
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleQuestionChange = (index, field, value) => {
    setFormState((prev) => {
      const updatedQuestions = [...prev.questions];
      updatedQuestions[index] = {
        ...updatedQuestions[index],
        [field]: value,
      };
      return { ...prev, questions: updatedQuestions };
    });
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    setFormState((prev) => {
      const updatedQuestions = [...prev.questions];
      const updatedOptions = [...updatedQuestions[qIndex].options];
      updatedOptions[oIndex] = value;
      updatedQuestions[qIndex] = {
        ...updatedQuestions[qIndex],
        options: updatedOptions,
      };
      return { ...prev, questions: updatedQuestions };
    });
  };

  const addQuestion = () => {
    setFormState((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          id: `q-${Date.now()}-${prev.questions.length}`,
          text: "",
          options: ["", "", "", ""],
          answer: "A",
        },
      ],
    }));
  };

  const removeQuestion = (index) => {
    setFormState((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formState.title) {
      alert("Judul kuis wajib diisi.");
      return;
    }

    setSubmitLoading(true);

    const payload = {
      title: formState.title,
      description: formState.description,
      class_id: formState.class_id || null,
      time_limit: formState.time_limit ? parseInt(formState.time_limit) : null,
      questions: formState.questions,
      admin_id: pb.authStore.model.id,
    };

    try {
      if (modalType === "add") {
        await pb.collection("limit_quizzes").create(payload);
        logActivity({ type: "quiz", action: "create", title: formState.title });
      } else {
        await pb.collection("limit_quizzes").update(currentQuizId, payload);
        logActivity({ type: "quiz", action: "update", title: formState.title });
      }
      setIsModalOpen(false);
      fetchQuizzesAndClasses();
    } catch (error) {
      console.error("Gagal menyimpan kuis:", error);
      alert("Gagal menyimpan kuis. Periksa kembali isian Anda.");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerFlex}>
        <div>
          <h1 className={styles.title}>Manajemen Kuis</h1>
          <p className={styles.subtitle}>Buat dan kelola kuis interaktif untuk siswa</p>
        </div>
        <Button onClick={openAddModal}>
          <LuPlus /> Tambah Kuis
        </Button>
      </div>

      {loading ? (
        <p className={styles.infoText}>Memuat data kuis...</p>
      ) : (
        <div className={styles.quizzesGrid}>
          {quizzes.length > 0 ? (
            quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className={`${styles.quizCard} ${styles.clickableCard}`}
                onClick={() => router.push(`/admin/quizzes/${quiz.id}`)}
              >
                {quiz.expand?.class_id && (
                  <span className={styles.classBadge}>
                    <LuBookOpen size={12} /> {quiz.expand.class_id.name}
                  </span>
                )}
                <div className={styles.cardContent}>
                  <h3>{quiz.title}</h3>
                  {quiz.description && (
                    <p className={styles.description}>{quiz.description}</p>
                  )}
                  <div className={styles.metaInfo}>
                    <span className={styles.metaItem}>
                      <LuClipboardList size={14} />
                      {Array.isArray(quiz.questions) ? quiz.questions.length : 0} Pertanyaan
                    </span>
                    {quiz.time_limit && (
                      <span className={styles.metaItem}>
                        <LuClock size={14} />
                        {quiz.time_limit} Menit
                      </span>
                    )}
                  </div>
                </div>
                <div className={styles.cardFooter}>
                  <span className={styles.date}>
                    Dibuat: {new Date(quiz.created).toLocaleDateString("id-ID")}
                  </span>
                  <div className={styles.actionBtns}>
                    <Button
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(quiz);
                      }}
                      title="Edit Kuis"
                    >
                      <LuPencil />
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(quiz.id);
                      }}
                      title="Hapus Kuis"
                    >
                      <LuTrash2 color="red" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.emptyContainer}>
              <p className={styles.empty}>Belum ada kuis. Silakan buat kuis baru.</p>
            </div>
          )}
        </div>
      )}

      {/* Modal Tambah/Edit Kuis */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalType === "add" ? "Tambah Kuis Baru" : "Edit Kuis"}
        style={{ width: "90%", maxWidth: "850px" }}
      >
        <form onSubmit={handleSubmit} className={styles.quizForm}>
          <div className={styles.formSection}>
            <InputField
              label="Judul Kuis"
              id="title"
              name="title"
              value={formState.title}
              onChange={handleInputChange}
              placeholder="Masukkan judul kuis..."
              required
            />

            <div className={styles.inputGroup}>
              <label htmlFor="description" className={styles.label}>
                Deskripsi
              </label>
              <textarea
                id="description"
                name="description"
                value={formState.description}
                onChange={handleInputChange}
                className={styles.textarea}
                placeholder="Masukkan deskripsi kuis..."
                rows={3}
              />
            </div>

            <div className={styles.row}>
              <div className={styles.inputGroup}>
                <label htmlFor="class_id" className={styles.label}>
                  Hubungkan dengan Kelas
                </label>
                <select
                  id="class_id"
                  name="class_id"
                  value={formState.class_id}
                  onChange={handleInputChange}
                  className={styles.select}
                >
                  <option value="">-- Pilih Kelas (Opsional) --</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} ({cls.code})
                    </option>
                  ))}
                </select>
              </div>

              <InputField
                label="Batas Waktu (Menit)"
                id="time_limit"
                name="time_limit"
                type="number"
                value={formState.time_limit}
                onChange={handleInputChange}
                placeholder="Kosongkan jika tanpa batas waktu"
                min="1"
              />
            </div>
          </div>

          <div className={styles.questionsSection}>
            <div className={styles.questionsHeader}>
              <h3>Daftar Pertanyaan ({formState.questions.length})</h3>
              <Button type="button" onClick={addQuestion} variant="secondary">
                <LuPlus /> Tambah Pertanyaan
              </Button>
            </div>

            <div className={styles.questionsList}>
              {formState.questions.length > 0 ? (
                formState.questions.map((q, qIndex) => (
                  <div key={q.id || qIndex} className={styles.questionItem}>
                    <div className={styles.questionItemHeader}>
                      <h4>Pertanyaan ke-{qIndex + 1}</h4>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => removeQuestion(qIndex)}
                        style={{ padding: "0.25rem 0.5rem" }}
                      >
                        <LuTrash2 color="red" size={16} />
                      </Button>
                    </div>

                    <div className={styles.inputGroup}>
                      <textarea
                        value={q.text}
                        onChange={(e) =>
                          handleQuestionChange(qIndex, "text", e.target.value)
                        }
                        className={styles.textarea}
                        placeholder="Tulis soal/pertanyaan disini..."
                        rows={2}
                        required
                      />
                    </div>

                    <div className={styles.optionsGrid}>
                      {q.options.map((opt, oIndex) => {
                        const optionLetter = String.fromCharCode(65 + oIndex); // A, B, C, D
                        return (
                          <div key={oIndex} className={styles.optionInputWrapper}>
                            <span className={styles.optionLabel}>{optionLetter}</span>
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) =>
                                handleOptionChange(qIndex, oIndex, e.target.value)
                              }
                              className={styles.optionInput}
                              placeholder={`Pilihan ${optionLetter}...`}
                              required
                            />
                          </div>
                        );
                      })}
                    </div>

                    <div className={styles.answerSelector}>
                      <label className={styles.labelInline}>Kunci Jawaban:</label>
                      <select
                        value={q.answer}
                        onChange={(e) =>
                          handleQuestionChange(qIndex, "answer", e.target.value)
                        }
                        className={styles.selectSmall}
                      >
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                      </select>
                    </div>
                  </div>
                ))
              ) : (
                <p className={styles.noQuestions}>
                  Belum ada pertanyaan. Silakan tambahkan pertanyaan untuk kuis ini.
                </p>
              )}
            </div>
          </div>

          <div className={styles.formFooter}>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
              disabled={submitLoading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={submitLoading}>
              {submitLoading ? "Menyimpan..." : "Simpan Kuis"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default QuizzesAdminPage;
