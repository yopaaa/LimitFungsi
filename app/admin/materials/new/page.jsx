"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../MaterialEditor.module.css";
import Button from "@/components/UI/Button";
import { pb } from "@/utils/db";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { LuSave, LuX, LuChevronLeft, LuImage } from "react-icons/lu";
import Link from "next/link";

export default function NewMaterialPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    status: "draft",
  });
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      if (name === "title" && !prev.slug) {
        newData.slug = value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
      }
      return newData;
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = pb.authStore.model;
      if (!user) throw new Error("Anda harus login sebagai admin");

      const data = new FormData();
      data.append("title", formData.title);
      data.append("slug", formData.slug);
      data.append("content", formData.content);
      data.append("status", formData.status);
      data.append("admin_id", user.id);
      
      if (thumbnail) {
        data.append("thumbnail", thumbnail);
      }

      await pb.collection("limit_materials").create(data);
      router.push("/admin/materials");
    } catch (error) {
      console.error("Gagal menyimpan materi:", error);
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/admin/materials" className={styles.backLink}>
          <LuChevronLeft /> Kembali ke Daftar Materi
        </Link>
        <h1>Buat Materi Baru</h1>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.topFields}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Judul Materi</label>
            <input
              type="text"
              name="title"
              className={styles.input}
              value={formData.title}
              onChange={handleChange}
              placeholder="Contoh: Pengenalan Limit Fungsi"
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Slug (URL)</label>
            <input
              type="text"
              name="slug"
              className={styles.input}
              value={formData.slug}
              onChange={handleChange}
              placeholder="pengenalan-limit-fungsi"
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Status</label>
            <select
              name="status"
              className={styles.input}
              value={formData.status}
              onChange={handleChange}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>

        <div className={styles.thumbnailGroup}>
          <label className={styles.label}>
            <LuImage /> Gambar Sampul (Thumbnail)
          </label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange}
            className={styles.fileInput}
          />
          {thumbnailPreview && (
            <img src={thumbnailPreview} alt="Preview" className={styles.thumbnailPreview} />
          )}
        </div>

        <div className={styles.previewLabel}>
          <label className={styles.label}>Konten (Markdown)</label>
          <span className={styles.previewBadge}>Preview Aktif</span>
        </div>

        <div className={styles.editorContainer}>
          <textarea
            name="content"
            className={styles.textarea}
            value={formData.content}
            onChange={handleChange}
            placeholder="Tulis materi Anda di sini menggunakan format Markdown..."
            required
          />
          <div className={`${styles.preview} markdown-body`}>
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
              {formData.content || "*Preview materi akan muncul di sini...*"}
            </ReactMarkdown>
          </div>
        </div>

        <div className={styles.actions}>
          <Button type="submit" disabled={loading}>
            <LuSave /> {loading ? "Menyimpan..." : "Simpan Materi"}
          </Button>
          <Link href="/admin/materials">
            <Button type="secondary" disabled={loading}>
              <LuX /> Batal
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
