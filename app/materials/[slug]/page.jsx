"use client";

import { useEffect, useState, use } from "react";
import { pb } from "@/utils/db";
import styles from "./page.module.css";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { LuCalendar, LuUser } from "react-icons/lu";

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

  if (loading) return <div className={styles.loading}>Memuat materi...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        {material.thumbnail && (
          <img 
            src={pb.files.getUrl(material, material.thumbnail)} 
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
  );
}
