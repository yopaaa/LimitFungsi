"use client";

import { useEffect, useState, use, useRef } from "react";
import { useRouter } from "next/navigation";
import styles from "../../MaterialEditor.module.css";
import Button from "@/components/UI/Button";
import { pb } from "@/utils/db";
import { logActivity } from "@/utils/activityLog";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { LuSave, LuX, LuChevronLeft, LuImage, LuRefreshCw } from "react-icons/lu";
import Link from "next/link";

export default function EditMaterialPage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    status: "draft",
  });
  const [initialContent, setInitialContent] = useState("");
  const [previewContent, setPreviewContent] = useState("");
  const [isAutoPreview, setIsAutoPreview] = useState(false);
  const contentRef = useRef(null);
  const debounceTimeoutRef = useRef(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [galleryImages, setGalleryImages] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deletingImageUrl, setDeletingImageUrl] = useState("");

  useEffect(() => {
    fetchMaterial();
  }, [params.id]);

  const fetchMaterial = async () => {
    try {
      const record = await pb.collection("limit_materials").getOne(params.id);
      setFormData({
        title: record.title,
        slug: record.slug,
        description: record.description || "",
        status: record.status,
      });
      setInitialContent(record.content);
      setPreviewContent(record.content);
      if (record.thumbnail) {
        setThumbnailPreview(pb.files.getURL(record, record.thumbnail));
      }
      fetchGalleryImages(record.id);
    } catch (error) {
      console.error("Gagal mengambil data materi:", error);
      alert("Materi tidak ditemukan.");
      router.push("/admin/materials");
    } finally {
      setLoading(false);
    }
  };

  const fetchGalleryImages = async (materialId) => {
    try {
      const res = await fetch(`/api/admin/upload-blob?materialId=${materialId}`);
      if (!res.ok) throw new Error("Gagal mengambil galeri gambar");
      const data = await res.json();
      setGalleryImages(data.blobs || []);
    } catch (err) {
      console.error("Error mengambil galeri:", err);
    }
  };

  const handleUploadGalleryImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      alert("Format file tidak didukung. Harap gunakan PNG, JPG, WEBP, atau GIF.");
      return;
    }

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("materialId", params.id);

      const res = await fetch("/api/admin/upload-blob", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Gagal mengunggah gambar ke Vercel Blob");
      const data = await res.json();
      
      setGalleryImages((prev) => [...prev, data.blob]);
      alert("Gambar berhasil diunggah!");
    } catch (err) {
      console.error("Upload error:", err);
      alert("Error: " + err.message);
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const handleCopyLink = (url) => {
    const markdownLink = `![Gambar](${url})`;
    navigator.clipboard.writeText(markdownLink)
      .then(() => {
        alert("Link gambar disalin ke clipboard dalam format Markdown!");
      })
      .catch((err) => {
        console.error("Gagal menyalin:", err);
        navigator.clipboard.writeText(url);
        alert("URL gambar disalin ke clipboard!");
      });
  };

  const handleDeleteGalleryImage = async (url) => {
    if (!confirm("Apakah Anda yakin ingin menghapus gambar ini dari Vercel Blob?")) return;

    setDeletingImageUrl(url);
    try {
      const res = await fetch("/api/admin/upload-blob", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      if (!res.ok) throw new Error("Gagal menghapus gambar");
      
      setGalleryImages((prev) => prev.filter((img) => img.url !== url));
      alert("Gambar berhasil dihapus!");
    } catch (err) {
      console.error("Delete error:", err);
      alert("Error: " + err.message);
    } finally {
      setDeletingImageUrl("");
    }
  };

  const handleRefreshPreview = () => {
    setPreviewContent(contentRef.current ? contentRef.current.value : "");
  };

  const handleTextareaChange = (e) => {
    if (isAutoPreview) {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      const value = e.target.value;
      debounceTimeoutRef.current = setTimeout(() => {
        setPreviewContent(value);
      }, 800);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
    setSaving(true);

    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("slug", formData.slug);
      data.append("description", formData.description || "");
      data.append("content", contentRef.current ? contentRef.current.value : "");
      data.append("status", formData.status);
      
      if (thumbnail) {
        data.append("thumbnail", thumbnail);
      }

      await pb.collection("limit_materials").update(params.id, data);
      logActivity({ type: "material", action: "update", title: formData.title });
      router.push("/admin/materials");
    } catch (error) {
      console.error("Gagal memperbarui materi:", error);
      alert("Error: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className={styles.container}>Memuat data...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/admin/materials" className={styles.backLink}>
          <LuChevronLeft /> Kembali ke Daftar Materi
        </Link>
        <h1>Edit Materi</h1>
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

        <div className={styles.inputGroup}>
          <label className={styles.label}>Deskripsi Singkat</label>
          <textarea
            name="description"
            className={styles.input}
            value={formData.description}
            onChange={handleChange}
            placeholder="Ringkasan materi yang akan muncul di daftar materi..."
            rows={3}
          />
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

        <div className={styles.galleryGroup}>
          <label className={styles.label}>
            <LuImage /> Galeri Gambar Pendukung (Vercel Blob)
          </label>
          <p className={styles.galleryHelp}>
            Unggah gambar pendukung untuk disalin link-nya dalam format Markdown dan ditempel ke dalam konten.
          </p>
          <div className={styles.galleryUploadWrapper}>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleUploadGalleryImage}
              className={styles.fileInput}
              disabled={uploadingImage}
              id="gallery-upload"
              style={{ display: "none" }}
            />
            <button
              type="button"
              className={styles.uploadBtn}
              onClick={() => document.getElementById("gallery-upload").click()}
              disabled={uploadingImage}
            >
              {uploadingImage ? "Mengunggah..." : "Unggah Gambar Pendukung"}
            </button>
          </div>

          <div className={styles.galleryList}>
            {galleryImages.length === 0 ? (
              <p className={styles.emptyGallery}>Belum ada gambar pendukung. Silakan unggah.</p>
            ) : (
              galleryImages.map((img, idx) => (
                <div key={img.url || idx} className={styles.galleryItem}>
                  <div className={styles.galleryThumbWrapper}>
                    <img src={img.url} alt={img.pathname} className={styles.galleryThumb} />
                  </div>
                  <div className={styles.galleryItemActions}>
                    <button
                      type="button"
                      className={styles.galleryActionBtn}
                      onClick={() => handleCopyLink(img.url)}
                      title="Salin Link Markdown"
                    >
                      Copy Link
                    </button>
                    <button
                      type="button"
                      className={`${styles.galleryActionBtn} ${styles.deleteBtn}`}
                      onClick={() => handleDeleteGalleryImage(img.url)}
                      disabled={deletingImageUrl === img.url}
                      title="Hapus Gambar"
                    >
                      {deletingImageUrl === img.url ? "..." : "Hapus"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={styles.previewLabel}>
          <label className={styles.label}>Konten (Markdown)</label>
          <div className={styles.previewActions}>
            <label className={styles.toggleLabel}>
              <input
                type="checkbox"
                checked={isAutoPreview}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setIsAutoPreview(checked);
                  if (checked && contentRef.current) {
                    setPreviewContent(contentRef.current.value);
                  }
                }}
              />
              Auto Preview
            </label>
            {!isAutoPreview && (
              <button
                type="button"
                className={styles.refreshButton}
                onClick={handleRefreshPreview}
                title="Refresh Preview"
              >
                <LuRefreshCw className={styles.refreshIcon} /> Refresh Preview
              </button>
            )}
            <span className={styles.previewBadge}>
              {isAutoPreview ? "Preview Otomatis" : "Preview Manual"}
            </span>
          </div>
        </div>

        <div className={styles.editorContainer}>
          <textarea
            name="content"
            className={styles.textarea}
            ref={contentRef}
            onChange={handleTextareaChange}
            defaultValue={initialContent}
            required
          />
          <div className={`${styles.preview} markdown-body`}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex]}
              components={{
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
              {previewContent}
            </ReactMarkdown>
          </div>
        </div>

        <div className={styles.actions}>
          <Button type="submit" disabled={saving}>
            <LuSave /> {saving ? "Menyimpan..." : "Perbarui Materi"}
          </Button>
          <Link href="/admin/materials">
            <Button type="secondary" disabled={saving}>
              <LuX /> Batal
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
