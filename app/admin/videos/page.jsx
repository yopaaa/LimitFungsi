"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";
import Button from "@/components/UI/Button";
import Modal from "@/components/UI/Modal";
import { pb } from "@/utils/db";
import { logActivity } from "@/utils/activityLog";
import {
  LuPlus,
  LuPencil,
  LuTrash2,
  LuPlay,
  LuLink,
} from "react-icons/lu";

/**
 * Helper: extract YouTube video ID dari berbagai format URL
 */
const extractYoutubeId = (url) => {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

/**
 * Helper: buat YouTube embed URL
 */
const getEmbedUrl = (videoId) =>
  `https://www.youtube.com/embed/${videoId}`;

/**
 * Helper: buat thumbnail URL dari video ID
 */
const getThumbnailUrl = (videoId) =>
  `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

const VideosAdminPage = () => {
  const [videos, setVideos] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [playerVideoId, setPlayerVideoId] = useState(null);

  // Form state
  const [form, setForm] = useState({
    title: "",
    youtube_url: "",
    description: "",
    class_id: "",
  });
  const [formError, setFormError] = useState("");

  useEffect(() => {
    fetchVideos();
    fetchClasses();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const records = await pb.collection("limit_videos").getFullList({
        sort: "-created",
        expand: "class_id",
        filter: `admin_id = "${pb.authStore.model.id}"`,
      });
      setVideos(records);
    } catch (error) {
      console.error("Gagal mengambil data video:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const records = await pb.collection("limit_classes").getFullList({
        sort: "-created",
      });
      setClasses(records);
    } catch (error) {
      console.error("Gagal mengambil data kelas:", error);
    }
  };

  const resetForm = () => {
    setForm({ title: "", youtube_url: "", description: "", class_id: "" });
    setFormError("");
    setEditingVideo(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const openEditModal = (video) => {
    setEditingVideo(video);
    setForm({
      title: video.title,
      youtube_url: video.youtube_url,
      description: video.description || "",
      class_id: video.class_id || "",
    });
    setIsFormOpen(true);
  };

  const openPlayer = (videoId) => {
    setPlayerVideoId(videoId);
    setIsPlayerOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "youtube_url") setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const videoId = extractYoutubeId(form.youtube_url);
    if (!videoId) {
      setFormError("URL YouTube tidak valid. Gunakan format: https://youtube.com/watch?v=... atau https://youtu.be/...");
      return;
    }

    try {
      const data = {
        title: form.title,
        youtube_url: form.youtube_url,
        youtube_id: videoId,
        description: form.description,
        class_id: form.class_id || null,
        admin_id: pb.authStore.model.id,
      };

      if (editingVideo) {
        await pb.collection("limit_videos").update(editingVideo.id, data);
        logActivity({ type: "video", action: "update", title: form.title });
      } else {
        await pb.collection("limit_videos").create(data);
        logActivity({ type: "video", action: "create", title: form.title });
      }

      setIsFormOpen(false);
      resetForm();
      fetchVideos();
    } catch (error) {
      console.error("Gagal menyimpan video:", error);
      setFormError("Gagal menyimpan video. Silakan coba lagi.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Apakah Anda yakin ingin menghapus video ini?")) return;
    try {
      const deletedVideo = videos.find((v) => v.id === id);
      await pb.collection("limit_videos").delete(id);
      logActivity({ type: "video", action: "delete", title: deletedVideo?.title || "Video" });
      setVideos(videos.filter((v) => v.id !== id));
    } catch (error) {
      alert("Gagal menghapus video.");
    }
  };

  const previewId = extractYoutubeId(form.youtube_url);

  return (
    <div className={styles.container}>
      <div className={styles.headerFlex}>
        <div>
          <h1 className={styles.title}>Manajemen Video</h1>
          <p className={styles.subtitle}>
            Kelola video pembelajaran dari YouTube untuk kelas Anda
          </p>
        </div>
        <Button onClick={openAddModal}>
          <LuPlus /> Tambah Video
        </Button>
      </div>

      {/* Video Grid */}
      {loading ? (
        <p>Memuat video...</p>
      ) : (
        <div className={styles.videoGrid}>
          {videos.length > 0 ? (
            videos.map((video) => (
              <div key={video.id} className={styles.videoCard}>
                {/* Thumbnail with play overlay */}
                <div
                  className={styles.thumbnailWrap}
                  onClick={() => openPlayer(video.youtube_id)}
                >
                  <img
                    src={getThumbnailUrl(video.youtube_id)}
                    alt={video.title}
                  />
                  <div className={styles.playOverlay}>
                    <div className={styles.playIcon}>
                      <LuPlay />
                    </div>
                  </div>
                </div>

                <div className={styles.cardBody}>
                  <h3 className={styles.cardTitle}>{video.title}</h3>
                  {video.description && (
                    <p className={styles.cardDescription}>
                      {video.description}
                    </p>
                  )}
                  <div className={styles.cardMeta}>
                    {video.expand?.class_id && (
                      <span className={styles.classBadge}>
                        {video.expand.class_id.name}
                      </span>
                    )}
                  </div>
                </div>

                <div className={styles.cardFooter}>
                  <span className={styles.date}>
                    {new Date(video.created).toLocaleDateString("id-ID")}
                  </span>
                  <div className={styles.actionBtns}>
                    <Button
                      variant="secondary"
                      title="Edit"
                      onClick={() => openEditModal(video)}
                    >
                      <LuPencil />
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => handleDelete(video.id)}
                      title="Hapus"
                    >
                      <LuTrash2 color="red" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className={styles.empty}>
              Belum ada video. Silakan tambahkan video YouTube baru.
            </p>
          )}
        </div>
      )}

      {/* Modal Form Tambah/Edit */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          resetForm();
        }}
        title={editingVideo ? "Edit Video" : "Tambah Video YouTube"}
        style={{ maxWidth: "560px" }}
      >
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="title">Judul Video *</label>
            <input
              id="title"
              name="title"
              type="text"
              placeholder="Contoh: Limit Fungsi Trigonometri"
              value={form.title}
              onChange={handleFormChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="youtube_url">
              <LuLink style={{ verticalAlign: "middle", marginRight: "4px" }} />
              URL YouTube *
            </label>
            <input
              id="youtube_url"
              name="youtube_url"
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={form.youtube_url}
              onChange={handleFormChange}
              required
            />
            {formError && <p className={styles.errorText}>{formError}</p>}
          </div>

          {/* Preview embed */}
          <div className={styles.previewSection}>
            {previewId ? (
              <iframe
                src={getEmbedUrl(previewId)}
                title="YouTube preview"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className={styles.previewPlaceholder}>
                Masukkan URL YouTube untuk melihat preview
              </div>
            )}
          </div>

          <div className={styles.formGroup} style={{ marginTop: "1rem" }}>
            <label htmlFor="description">Deskripsi</label>
            <textarea
              id="description"
              name="description"
              placeholder="Deskripsi singkat video (opsional)"
              value={form.description}
              onChange={handleFormChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="class_id">Kelas (Opsional)</label>
            <select
              id="class_id"
              name="class_id"
              value={form.class_id}
              onChange={handleFormChange}
            >
              <option value="">-- Semua Kelas --</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formActions}>
            <Button
              variant="secondary"
              type="button"
              onClick={() => {
                setIsFormOpen(false);
                resetForm();
              }}
            >
              Batal
            </Button>
            <Button type="submit">
              {editingVideo ? "Simpan Perubahan" : "Tambah Video"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Player */}
      <Modal
        isOpen={isPlayerOpen}
        onClose={() => {
          setIsPlayerOpen(false);
          setPlayerVideoId(null);
        }}
        title="Putar Video"
        style={{ maxWidth: "800px" }}
      >
        {playerVideoId && (
          <div className={styles.playerWrap}>
            <iframe
              src={`${getEmbedUrl(playerVideoId)}?autoplay=1`}
              title="YouTube player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default VideosAdminPage;
