"use client";

import React, { useEffect, useState, useRef } from "react";
import styles from "./page.module.css";
import Button from "@/components/UI/Button";
import { pb } from "@/utils/db";
import { useRouter } from "next/navigation";
import { LuClock, LuTrophy, LuBookOpen, LuChevronLeft, LuChevronRight, LuCheckCheck, LuClipboardList } from "react-icons/lu";

const UserQuizzesPage = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quiz Taking States
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // { questionId: selectedOption }
  const [timeLeft, setTimeLeft] = useState(null);
  const [isQuizFinished, setIsQuizFinished] = useState(false);
  const [quizScore, setQuizScore] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (pb.authStore.isValid && pb.authStore.model) {
      setUser(pb.authStore.model);
      fetchQuizzesAndResults();
    } else {
      router.push("/auth/login");
    }
    return () => clearInterval(timerRef.current);
  }, [router]);

  const fetchQuizzesAndResults = async () => {
    try {
      setLoading(true);
      const userId = pb.authStore.model.id;

      // 1. Dapatkan kelas yang diikuti user
      const subscriptions = await pb.collection("limit_subscriptions").getFullList({
        filter: `user_id = "${userId}"`,
      });

      let quizRecords = [];
      if (subscriptions.length > 0) {
        const classFilter = subscriptions.map((sub) => `class_id = "${sub.class_id}"`).join(" || ");
        // Ambil kuis yang terhubung dengan kelas yang diikuti ATAU kuis umum (class_id kosong)
        quizRecords = await pb.collection("limit_quizzes").getFullList({
          filter: `(${classFilter}) || class_id = ""`,
          expand: "class_id",
          sort: "-created",
        });
      } else {
        // Hanya kuis umum jika belum ikut kelas
        quizRecords = await pb.collection("limit_quizzes").getFullList({
          filter: `class_id = ""`,
          sort: "-created",
        });
      }

      // 2. Dapatkan riwayat pengerjaan kuis siswa
      const resultRecords = await pb.collection("limit_quiz_results").getFullList({
        filter: `user_id = "${userId}"`,
      });

      // Gabungkan data kuis dengan hasil pengerjaan user
      const mappedQuizzes = quizRecords.map((quiz) => {
        const attempt = resultRecords.find((res) => res.quiz_id === quiz.id);
        return {
          ...quiz,
          completed: !!attempt,
          score: attempt ? attempt.score : null,
          submittedAt: attempt ? attempt.created : null,
        };
      });

      setQuizzes(mappedQuizzes);
    } catch (error) {
      console.error("Gagal memuat kuis:", error);
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = (quiz) => {
    setActiveQuiz(quiz);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setIsQuizFinished(false);
    setQuizScore(null);

    if (quiz.time_limit) {
      const totalSeconds = quiz.time_limit * 60;
      setTimeLeft(totalSeconds);

      // Setup Timer
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            // Auto submit
            submitQuiz(true, {}); // true untuk force submit karena waktu habis
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setTimeLeft(null);
    }
  };

  // Helper reference to answers state for timer closure
  const answersRef = useRef({});
  useEffect(() => {
    answersRef.current = userAnswers;
  }, [userAnswers]);

  const selectOption = (questionId, optionLetter) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionLetter,
    }));
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const submitQuiz = async (force = false, currentAnswers = null) => {
    const finalAnswers = currentAnswers || answersRef.current;
    const questions = activeQuiz.questions;

    if (!force) {
      const unansweredCount = questions.filter((q) => !finalAnswers[q.id]).length;
      if (unansweredCount > 0) {
        if (!confirm(`Ada ${unansweredCount} soal belum dijawab. Yakin ingin mengirim jawaban?`)) {
          return;
        }
      } else {
        if (!confirm("Apakah Anda yakin ingin menyelesaikan kuis?")) {
          return;
        }
      }
    }

    if (timerRef.current) clearInterval(timerRef.current);

    // Hitung Skor
    let correctCount = 0;
    questions.forEach((q) => {
      if (finalAnswers[q.id] === q.answer) {
        correctCount += 1;
      }
    });

    const calculatedScore = Math.round((correctCount / questions.length) * 100);

    try {
      await pb.collection("limit_quiz_results").create({
        quiz_id: activeQuiz.id,
        user_id: user.id,
        score: calculatedScore,
        answers: finalAnswers,
      });

      setQuizScore(calculatedScore);
      setIsQuizFinished(true);
    } catch (error) {
      console.error("Gagal menyimpan hasil kuis:", error);
      alert("Terjadi kesalahan saat mengirimkan kuis. Silakan coba lagi.");
    }
  };

  const exitQuizTakingMode = () => {
    setActiveQuiz(null);
    fetchQuizzesAndResults();
  };

  if (!user) return <div className={styles.loading}>Memuat data...</div>;

  // Render Layar Pengerjaan Kuis
  if (activeQuiz) {
    const questions = activeQuiz.questions || [];
    const currentQuestion = questions[currentQuestionIndex];

    if (isQuizFinished) {
      return (
        <div className={styles.container}>
          <div className={styles.resultCard}>
            <div className={styles.successIcon}>
              <LuCheckCheck size={64} />
            </div>
            <h2>Kuis Selesai!</h2>
            <p className={styles.resultDesc}>Terima kasih telah menyelesaikan kuis <strong>{activeQuiz.title}</strong>.</p>
            <div className={styles.scoreBox}>
              <span className={styles.scoreLabel}>Skor Anda</span>
              <span className={styles.scoreValue}>{quizScore}</span>
            </div>
            <Button onClick={exitQuizTakingMode}>Kembali ke Menu Kuis</Button>
          </div>
        </div>
      );
    }

    return (
      <div className={styles.container}>
        <div className={styles.quizHeader}>
          <div className={styles.headerInfo}>
            <h2>{activeQuiz.title}</h2>
            <span className={styles.qCounter}>
              Soal {currentQuestionIndex + 1} dari {questions.length}
            </span>
          </div>

          {timeLeft !== null && (
            <div className={`${styles.timerBox} ${timeLeft < 60 ? styles.timerUrgent : ""}`}>
              <LuClock size={16} />
              <span>Sisa Waktu: {formatTime(timeLeft)}</span>
            </div>
          )}
        </div>

        <div className={styles.quizLayout}>
          {/* Sisi Kiri: Soal Aktif */}
          <div className={styles.mainQuestionArea}>
            {currentQuestion ? (
              <div className={styles.questionCard}>
                <p className={styles.questionText}>{currentQuestion.text}</p>
                <div className={styles.optionsList}>
                  {currentQuestion.options.map((opt, oIdx) => {
                    const letter = String.fromCharCode(65 + oIdx); // A, B, C, D
                    const isSelected = userAnswers[currentQuestion.id] === letter;
                    return (
                      <div
                        key={oIdx}
                        className={`${styles.optionCard} ${isSelected ? styles.optionSelected : ""}`}
                        onClick={() => selectOption(currentQuestion.id, letter)}
                      >
                        <span className={styles.optionLetter}>{letter}</span>
                        <span className={styles.optionText}>{opt}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p>Soal tidak tersedia.</p>
            )}

            <div className={styles.navRow}>
              <Button
                variant="secondary"
                onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentQuestionIndex === 0}
              >
                <LuChevronLeft /> Kembali
              </Button>

              {currentQuestionIndex < questions.length - 1 ? (
                <Button
                  onClick={() => setCurrentQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                >
                  Berikutnya <LuChevronRight />
                </Button>
              ) : (
                <Button onClick={() => submitQuiz(false)} style={{ backgroundColor: "#22c55e" }}>
                  Kirim Jawaban <LuCheckCheck />
                </Button>
              )}
            </div>
          </div>

          {/* Sisi Kanan: Panel Navigasi Soal */}
          <div className={styles.questionNavPanel}>
            <h3>Navigasi Soal</h3>
            <div className={styles.navGrid}>
              {questions.map((q, idx) => {
                const isAnswered = !!userAnswers[q.id];
                const isActive = idx === currentQuestionIndex;
                return (
                  <button
                    key={q.id || idx}
                    className={`
                      ${styles.navGridBtn}
                      ${isActive ? styles.navGridActive : ""}
                      ${isAnswered && !isActive ? styles.navGridAnswered : ""}
                    `}
                    onClick={() => setCurrentQuestionIndex(idx)}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
            <div className={styles.legend}>
              <div className={styles.legendItem}>
                <span className={`${styles.legendColor} ${styles.legendActive}`}></span>
                <span>Aktif</span>
              </div>
              <div className={styles.legendItem}>
                <span className={`${styles.legendColor} ${styles.legendAnswered}`}></span>
                <span>Sudah Dijawab</span>
              </div>
              <div className={styles.legendItem}>
                <span className={`${styles.legendColor} ${styles.legendNormal}`}></span>
                <span>Belum Dijawab</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render Daftar Kuis (Layar Utama)
  return (
    <div className={styles.container}>
      <div className={styles.headerFlex}>
        <div>
          <h1 className={styles.title}>Daftar Kuis</h1>
          <p className={styles.subtitle}>Kerjakan kuis untuk menguji pemahaman materi Anda</p>
        </div>
      </div>

      {loading ? (
        <p className={styles.loadingText}>Memuat kuis...</p>
      ) : (
        <div className={styles.quizzesGrid}>
          {quizzes.length > 0 ? (
            quizzes.map((quiz) => (
              <div key={quiz.id} className={`${styles.quizCard} ${quiz.completed ? styles.cardCompleted : ""}`}>
                {quiz.expand?.class_id && (
                  <span className={styles.classBadge}>
                    <LuBookOpen size={12} /> {quiz.expand.class_id.name}
                  </span>
                )}
                <div className={styles.cardContent}>
                  <h3>{quiz.title}</h3>
                  {quiz.description && <p className={styles.description}>{quiz.description}</p>}
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
                  {quiz.completed ? (
                    <div className={styles.completedStatus}>
                      <span className={styles.statusLabel}>Sudah Dikerjakan</span>
                      <span className={styles.completedScore}>Skor: {quiz.score}</span>
                    </div>
                  ) : (
                    <div className={styles.pendingStatus}>
                      <span className={styles.statusLabelPending}>Belum Dikerjakan</span>
                      <Button onClick={() => startQuiz(quiz)} size="small">
                        Mulai Kuis
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className={styles.emptyContainer}>
              <p className={styles.empty}>Belum ada kuis yang tersedia untuk Anda.</p>
              <p className={styles.emptySub}>Pastikan Anda telah bergabung ke kelas melalui menu "Gabung Kelas".</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserQuizzesPage;
