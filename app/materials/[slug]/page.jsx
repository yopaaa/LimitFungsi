"use client";

import { useEffect, useState, use } from "react";
import { pb } from "@/utils/db";
import styles from "./page.module.css";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { LuCalendar, LuUser } from "react-icons/lu";
import Footer from "@/components/Layout/Footer";
import FloatingChat from "@/components/FloatingChat/FloatingChat";

export default function MaterialDetailPage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    } catch (err) {
      console.error("Gagal memuat materi:", err);
      setError("Materi tidak ditemukan atau belum dipublikasikan.");
    } finally {
      setLoading(false);
    }
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
          {material.thumbnail && (
            <img 
              src={pb.files.getURL(material, material.thumbnail)} 
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
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              // Add IDs to headings for ToC linking
              h1: ({ children }) => {
                const id = generateSlug(String(children));
                return <h1 id={id}>{children}</h1>;
              },
              h2: ({ children }) => {
                const id = generateSlug(String(children));
                return <h2 id={id}>{children}</h2>;
              },
              h3: ({ children }) => {
                const id = generateSlug(String(children));
                return <h3 id={id}>{children}</h3>;
              },
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
            {material.content}
          </ReactMarkdown>
        </main>
      </div>
    </div>

    <Footer />
    {material && <FloatingChat materialContext={material.content} />}
    </>
  );
}
