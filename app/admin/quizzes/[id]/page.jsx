"use client";

import React, { useEffect, useState, use } from "react";
import styles from "./page.module.css";
import Button from "@/components/UI/Button";
import Modal from "@/components/UI/Modal";
import { pb } from "@/utils/db";
import { useRouter } from "next/navigation";
import { LuChevronLeft, LuClock, LuBookOpen, LuClipboardList, LuUserCheck, LuEye, LuX, LuCheckCheck } from "react-icons/lu";

const QuizDetailPage = ({ params: paramsPromise }) => {
  const params = use(paramsPromise);
  const router = useRouter();
  const quizId = params.id;

  const [quiz, setQuiz] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal Detail Jawaban Siswa
  const [selectedResult, setSelectedResult] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    fetchQuizAndResults();
  }, [quizId]);

  const fetchQuizAndResults = async () => {
    try {
      setLoading(true);
      // 1. Ambil data kuis
      const quizRecord = await pb.collection("limit_quizzes").getOne(quizId, {
        expand: "class_id",
      });
      setQuiz(quizRecord);

      // 2. Ambil data siswa yang sudah mengerjakan kuis ini
      const resultsRecords = await pb.collection("limit_quiz_results").getFullList({
        filter: `quiz_id = "${quizId}"`,
        expand: "user_id",
        sort: "-created",
      });
      setResults(resultsRecords);
    } catch (error) {
      console.error("Gagal mengambil detail kuis dan hasil pengerjaan:", error);
      alert("Kuis tidak ditemukan.");
      router.push("/admin/quizzes");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetailModal = (result) => {
    setSelectedResult(result);
    setIsDetailModalOpen(true);
  };

  if (loading) return <div className={styles.loading}>Memuat data...</div>;
  if (!quiz) return <div className={styles.loading}>Kuis tidak ditemukan.</div>;

  return (
    <div className={styles.container}>
      <div className={styles.backHeader}>
        <Button variant="secondary" onClick={() => router.push("/admin/quizzes")}>
          <LuChevronLeft /> Kembali ke Kuis
        </Button>
      </div>

      {/* Info Kuis */}
      <div className={styles.quizInfoCard}>
        {quiz.expand?.class_id && (
          <span className={styles.classBadge}>
            <LuBookOpen size={12} /> {quiz.expand.class_id.name}
          </span>
        )}
        <h1 className={styles.quizTitle}>{quiz.title}</h1>
        {quiz.description && <p className={styles.quizDesc}>{quiz.description}</p>}
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
          <span className={styles.metaItem}>
            <LuUserCheck size={14} />
            {results.length} Siswa Mengerjakan
          </span>
        </div>
      </div>

      {/* Daftar Siswa yang Mengerjakan */}
      <div className={styles.resultsCard}>
        <h2>Daftar Siswa yang Mengerjakan</h2>
        {results.length > 0 ? (
          <div className={styles.tableWrapper}>
            <table className={styles.resultsTable}>
              <thead>
                <tr>
                  <th>No</th>
                  <th>Nama Lengkap</th>
                  <th>Instansi</th>
                  <th>Tanggal Pengerjaan</th>
                  <th>Skor</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {results.map((res, index) => {
                  const student = res.expand?.user_id || {};
                  return (
                    <tr key={res.id}>
                      <td>{index + 1}</td>
                      <td className={styles.studentName}>
                        {student.nama || student.username || "Tidak diketahui"}
                      </td>
                      <td>{student.instansi || "-"}</td>
                      <td>{new Date(res.created).toLocaleString("id-ID")}</td>
                      <td>
                        <span
                          className={`
                            ${styles.scoreBadge} 
                            ${res.score >= 70 ? styles.scorePass : styles.scoreFail}
                          `}
                        >
                          {res.score}
                        </span>
                      </td>
                      <td>
                        <Button
                          variant="secondary"
                          size="small"
                          onClick={() => handleOpenDetailModal(res)}
                        >
                          <LuEye /> Detail Jawaban
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={styles.emptyResults}>
            <p>Belum ada siswa yang mengerjakan kuis ini.</p>
          </div>
        )}
      </div>

      {/* Modal Detail Jawaban Siswa */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={`Jawaban: ${selectedResult?.expand?.user_id?.nama || "Siswa"}`}
        style={{ width: "90%", maxWidth: "750px" }}
      >
        {selectedResult && (
          <div className={styles.modalContent}>
            <div className={styles.modalScoreHeader}>
              <div className={styles.scoreTitle}>Nilai Akhir:</div>
              <div
                className={`
                  ${styles.modalScoreValue} 
                  ${selectedResult.score >= 70 ? styles.scorePassText : styles.scoreFailText}
                `}
              >
                {selectedResult.score}
              </div>
            </div>

            <div className={styles.questionsList}>
              {Array.isArray(quiz.questions) &&
                quiz.questions.map((q, qIndex) => {
                  const studentAnswer = selectedResult.answers?.[q.id];
                  const isCorrect = studentAnswer === q.answer;

                  return (
                    <div key={q.id || qIndex} className={styles.questionItem}>
                      <div className={styles.questionHeader}>
                        <h4>Pertanyaan ke-{qIndex + 1}</h4>
                        {isCorrect ? (
                          <span className={styles.correctLabel}>
                            <LuCheckCheck size={14} /> Benar
                          </span>
                        ) : (
                          <span className={styles.incorrectLabel}>
                            <LuX size={14} /> Salah
                          </span>
                        )}
                      </div>
                      <p className={styles.questionText}>{q.text}</p>
                      {q.image && (
                        <div style={{ textAlign: "center", margin: "0.75rem 0" }}>
                          <img 
                            src={q.image} 
                            alt="Gambar soal" 
                            style={{ maxWidth: "100%", maxHeight: "250px", objectFit: "contain", border: "3px solid #000000", borderRadius: "8px", boxShadow: "4px 4px 0px #000000" }} 
                          />
                        </div>
                      )}

                      <div className={styles.optionsList}>
                        {q.options.map((opt, oIndex) => {
                          const optionLetter = String.fromCharCode(65 + oIndex); // A, B, C, D
                          const isStudentChoice = studentAnswer === optionLetter;
                          const isCorrectChoice = q.answer === optionLetter;

                          let optionClass = styles.optionItem;
                          if (isCorrectChoice) {
                            optionClass = `${styles.optionItem} ${styles.optionCorrect}`;
                          } else if (isStudentChoice && !isCorrect) {
                            optionClass = `${styles.optionItem} ${styles.optionWrong}`;
                          }

                          return (
                            <div key={oIndex} className={optionClass}>
                              <span className={styles.optionLetter}>{optionLetter}</span>
                              <span className={styles.optionText}>{opt}</span>
                              {q.optionImages && q.optionImages[oIndex] && (
                                <img 
                                  src={q.optionImages[oIndex]} 
                                  alt={`Gambar ${optionLetter}`} 
                                  style={{ maxHeight: "60px", objectFit: "contain", border: "2px solid #000000", borderRadius: "4px", marginLeft: "auto" }} 
                                />
                              )}
                              {isCorrectChoice && <span className={styles.badgeIndicator}>Kunci</span>}
                              {isStudentChoice && <span className={styles.badgeIndicatorChoice}>Jawaban Siswa</span>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default QuizDetailPage;
