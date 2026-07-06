"use client";

import { useEffect, useState, use } from "react";
import { pb } from "@/utils/db";
import styles from "./page.module.css";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { LuCalendar, LuUser, LuCheckCheck } from "react-icons/lu";
import Footer from "@/components/Layout/Footer";
import FloatingChat from "@/components/FloatingChat/FloatingChat";

const QuizWidget = ({ quiz, user }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(null);
  const [isLoadingAttempt, setIsLoadingAttempt] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const questions = quiz.questions || [];
  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    const checkPastAttempt = async () => {
      if (!user || !quiz) {
        setIsLoadingAttempt(false);
        return;
      }
      try {
        const records = await pb.collection("limit_quiz_results").getList(1, 1, {
          filter: `quiz_id = "${quiz.id}" && user_id = "${user.id}"`,
          sort: "-created",
        });
        if (records.items.length > 0) {
          setScore(records.items[0].score);
          setAnswers(records.items[0].answers || {});
          setIsFinished(true);
        }
      } catch (err) {
        console.error("Gagal memeriksa pengerjaan kuis sebelumnya:", err);
      } finally {
        setIsLoadingAttempt(false);
      }
    };

    checkPastAttempt();
  }, [quiz, user]);

  const handleSelectOption = (option) => {
    if (isFinished) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: option,
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    const unanswered = questions.filter(q => !answers[q.id]);
    if (unanswered.length > 0) {
      if (!confirm(`Ada ${unanswered.length} soal belum dijawab. Tetap kumpulkan?`)) {
        return;
      }
    }

    setSubmitting(true);
    let correct = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.answer) {
        correct++;
      }
    });

    const calculatedScore = Math.round((correct / questions.length) * 100);

    try {
      await pb.collection("limit_quiz_results").create({
        quiz_id: quiz.id,
        user_id: user.id,
        score: calculatedScore,
        answers: answers,
      });
      setScore(calculatedScore);
      setIsFinished(true);
    } catch (err) {
      console.error("Gagal menyimpan hasil kuis:", err);
      alert("Terjadi kesalahan saat mengirim jawaban.");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoadingAttempt) {
    return <div className={styles.quizLoading}>Memeriksa status kuis...</div>;
  }

  if (!user) {
    return (
      <div className={styles.quizAuthNotice}>
        <h4>📝 Kuis: {quiz.title}</h4>
        <p>Anda harus masuk log terlebih dahulu untuk mengerjakan kuis ini.</p>
        <a href="/auth/login" className={styles.quizLoginBtn}>Masuk Log</a>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className={styles.quizResultCard}>
        <h4>🎉 Kuis Selesai: {quiz.title}</h4>
        <p>Anda telah menyelesaikan kuis ini.</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return <div className={styles.quizLoading}>Kuis tidak memiliki pertanyaan.</div>;
  }

  return (
    <div className={styles.quizContainer}>
      <div className={styles.quizHeader}>
        <h4>📝 Kuis: {quiz.title}</h4>
        <span>Soal {currentIndex + 1} dari {questions.length}</span>
      </div>
      
      <div className={styles.quizBody}>
        <p className={styles.quizQuestionText}>{currentQuestion.text}</p>
        <div className={styles.quizOptions}>
          {currentQuestion.options && currentQuestion.options.map((opt, oIdx) => {
            const letter = String.fromCharCode(65 + oIdx);
            const isSelected = answers[currentQuestion.id] === letter;
            return (
              <button
                key={oIdx}
                type="button"
                className={`${styles.quizOptionBtn} ${isSelected ? styles.selectedOption : ""}`}
                onClick={() => handleSelectOption(letter)}
              >
                <span className={styles.optionLetter}>{letter}</span>
                <span className={styles.optionText}>{opt}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles.quizFooter}>
        <div className={styles.quizNav}>
          <button
            type="button"
            className={styles.quizNavBtn}
            onClick={handlePrev}
            disabled={currentIndex === 0}
          >
            Kembali
          </button>
          {currentIndex < questions.length - 1 ? (
            <button
              type="button"
              className={styles.quizNavBtn}
              onClick={handleNext}
              disabled={!answers[currentQuestion.id]}
            >
              Lanjut
            </button>
          ) : (
            <button
              type="button"
              className={styles.quizSubmitBtn}
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "Mengirim..." : "Kirim Jawaban"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default function MaterialDetailPage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [quizzesData, setQuizzesData] = useState({});

  useEffect(() => {
    if (pb.authStore.isValid && pb.authStore.model) {
      setUser(pb.authStore.model);
    }
  }, []);

  useEffect(() => {
    fetchMaterial();
  }, [params.slug]);

  const fetchMaterial = async () => {
    try {
      setLoading(true);
      const record = await pb.collection("limit_materials").getFirstListItem(`slug="${params.slug}"`, {
        expand: "admin_id",
      });
      
      if (record.status !== "published" && pb.authStore.model?.role !== "admin") {
        throw new Error("Materi tidak tersedia.");
      }
      
      setMaterial(record);

      // Ambil kuis-kuis yang disisipkan di dalam markdown (format [quiz:QUIZ_ID])
      const matches = [...record.content.matchAll(/\[quiz:([a-zA-Z0-9]+)\]/g)];
      const quizIds = [...new Set(matches.map((m) => m[1]))];
      if (quizIds.length > 0) {
        const loadedQuizzes = {};
        for (const id of quizIds) {
          try {
            const quiz = await pb.collection("limit_quizzes").getOne(id);
            loadedQuizzes[id] = quiz;
          } catch (err) {
            console.error(`Gagal memuat kuis dengan id ${id}:`, err);
          }
        }
        setQuizzesData(loadedQuizzes);
      }
    } catch (err) {
      console.error("Gagal memuat materi:", err);
      setError("Materi tidak ditemukan atau belum dipublikasikan.");
    } finally {
      setLoading(false);
    }
  };

  // Helper to extract plain text from React children recursively
  const extractText = (children) => {
    if (typeof children === "string") return children;
    if (Array.isArray(children)) {
      return children.map(extractText).join("");
    }
    if (children && children.props && children.props.children) {
      return extractText(children.props.children);
    }
    return "";
  };

  // Helper to generate IDs for headings
  const generateSlug = (text) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  // Extract headings from markdown content
  const getToc = (content) => {
    const lines = content.split("\n");
    const toc = [];
    let inCodeBlock = false;

    lines.forEach((line) => {
      // Deteksi awal dan akhir blok kode
      if (line.trim().startsWith("```")) {
        inCodeBlock = !inCodeBlock;
        return;
      }

      // Hanya proses heading jika tidak sedang di dalam blok kode
      if (!inCodeBlock) {
        const match = line.match(/^(#{1,3})\s+(.*)/);
        if (match) {
          const level = match[1].length;
          const text = match[2].replace(/[#*`_]/g, "").trim();
          
          // Abaikan heading jika mengandung karakter dekoratif garis (divider) 
          // atau jika isinya hanya simbol-simbol saja
          const isDivider = /[─═━╼╾╼╾]/.test(text) || text.length < 2;
          
          if (!isDivider) {
            toc.push({ level, text, id: generateSlug(text) });
          }
        }
      }
    });
    return toc;
  };

  if (loading) return <div className={styles.loading}>Memuat materi...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  const toc = material ? getToc(material.content) : [];
  const thumbnailUrl = material && material.thumbnail 
    ? pb.files.getURL(material, material.thumbnail) 
    : null;

  return (
    <>
    <div className={styles.container}>
      {/* Sidebar Navigation (Daftar Isi) */}
      <aside className={styles.sidebar}>
        <h3 className={styles.tocTitle}>Daftar Isi</h3>
        <ul className={styles.tocList}>
          {toc.map((item, index) => (
            <li key={index} className={`${styles.tocItem} ${styles[`tocH${item.level}`]}`}>
              <a href={`#${item.id}`} className={styles.tocLink}>
                {item.text}
              </a>
            </li>
          ))}
        </ul>
      </aside>

      <div className={styles.mainContent}>
        <header className={styles.header}>
          {thumbnailUrl && (
            <img 
              src={thumbnailUrl} 
              alt={material.title} 
              className={styles.heroImage}
            />
          )}
          <h1 className={styles.title}>{material.title}</h1>
          <div className={styles.meta}>
            <span className={styles.metaItem}>
              <LuUser /> {material.expand?.admin_id?.nama || "Admin"}
            </span>
            <span className={styles.metaItem}>
              <LuCalendar /> {new Date(material.created).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric"
              })}
            </span>
          </div>
        </header>

        <main className={styles.content}>
          {material.content.split(/(\[quiz:[a-zA-Z0-9]+\])/).map((part, idx) => {
            const match = part.match(/^\[quiz:([a-zA-Z0-9]+)\]$/);
            if (match) {
              const quizId = match[1];
              const quiz = quizzesData[quizId];
              if (!quiz) return <div key={idx} className={styles.quizLoading}>Memuat data kuis...</div>;
              return <QuizWidget key={idx} quiz={quiz} user={user} />;
            }

            return (
              <ReactMarkdown
                key={idx}
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                  // Add IDs to headings for ToC linking
                  h1: ({ children }) => {
                    const text = extractText(children);
                    const id = generateSlug(text);
                    return <h1 id={id}>{children}</h1>;
                  },
                  h2: ({ children }) => {
                    const text = extractText(children);
                    const id = generateSlug(text);
                    return <h2 id={id}>{children}</h2>;
                  },
                  h3: ({ children }) => {
                    const text = extractText(children);
                    const id = generateSlug(text);
                    return <h3 id={id}>{children}</h3>;
                  },
                  img: ({ src, alt, ...props }) => (
                    <span style={{ display: "block", textAlign: "center", margin: "2rem auto" }}>
                      <img 
                        src={src} 
                        alt={alt} 
                        style={{ 
                          maxWidth: "100%", 
                          height: "auto", 
                          borderRadius: "8px", 
                          border: "3px solid #000000", 
                          boxShadow: "1px 1px 0px #000000",
                          display: "inline-block"
                        }} 
                        {...props}
                      />
                    </span>
                  ),
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
                {part}
              </ReactMarkdown>
            );
          })}
        </main>
      </div>
    </div>

    <Footer />
    {material && <FloatingChat materialContext={material.content} />}
    </>
  );
}
