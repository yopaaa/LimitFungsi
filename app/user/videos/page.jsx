"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";
import Modal from "@/components/UI/Modal";
import { pb } from "@/utils/db";
import { LuPlay, LuVideo } from "react-icons/lu";

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

const UserVideosPage = () => {
  const [videos, setVideos] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");

  // Player modal
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const userId = pb.authStore.model?.id;
      if (!userId) return;

      // 1. Ambil kelas yang diikuti user
      const subscriptions = await pb.collection("limit_subscriptions").getFullList({
        filter: `user_id = "${userId}"`,
        expand: "class_id",
      });

      const enrolledClasses = subscriptions
        .map((sub) => sub.expand?.class_id)
        .filter(Boolean);
      setClasses(enrolledClasses);

      if (enrolledClasses.length === 0) {
        setVideos([]);
        setLoading(false);
        return;
      }

      // 2. Ambil video yang terkait kelas user ATAU video tanpa kelas (umum)
      const classFilter = enrolledClasses
        .map((cls) => `class_id = "${cls.id}"`)
        .join(" || ");

      const records = await pb.collection("limit_videos").getFullList({
        filter: `(${classFilter}) || class_id = ""`,
        sort: "-created",
        expand: "class_id",
      });

      setVideos(records);
    } catch (error) {
      console.error("Gagal mengambil data video:", error);
    } finally {
      setLoading(false);
    }
  };

  const openPlayer = (video) => {
    setSelectedVideo(video);
    setIsPlayerOpen(true);
  };

  // Filter videos berdasarkan kelas
  const filteredVideos =
    activeFilter === "all"
      ? videos
      : videos.filter((v) => v.class_id === activeFilter);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Video Pembelajaran</h1>
        <p className={styles.subtitle}>
          Tonton video materi dari kelas yang kamu ikuti
        </p>
      </div>

      {/* Filter chips per kelas */}
      {classes.length > 0 && (
        <div className={styles.filterBar}>
          <button
            className={`${styles.filterChip} ${activeFilter === "all" ? styles.activeChip : ""}`}
            onClick={() => setActiveFilter("all")}
          >
            Semua
          </button>
          {classes.map((cls) => (
            <button
              key={cls.id}
              className={`${styles.filterChip} ${activeFilter === cls.id ? styles.activeChip : ""}`}
              onClick={() => setActiveFilter(cls.id)}
            >
              {cls.name}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <p className={styles.loading}>Memuat video...</p>
      ) : filteredVideos.length > 0 ? (
        <div className={styles.videoGrid}>
          {filteredVideos.map((video) => (
            <div key={video.id} className={styles.videoCard}>
              {/* Thumbnail */}
              <div
                className={styles.thumbnailWrap}
                onClick={() => openPlayer(video)}
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

              {/* Info */}
              <div className={styles.cardBody}>
                <h3 className={styles.cardTitle}>{video.title}</h3>
                {video.description && (
                  <p className={styles.cardDescription}>{video.description}</p>
                )}
                <div className={styles.cardMeta}>
                  {video.expand?.class_id && (
                    <span className={styles.classBadge}>
                      {video.expand.class_id.name}
                    </span>
                  )}
                  <span className={styles.date}>
                    {new Date(video.created).toLocaleDateString("id-ID")}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <LuVideo size={48} />
          </div>
          <p>
            {classes.length === 0
              ? "Kamu belum mengikuti kelas manapun. Gabung kelas dulu ya!"
              : "Belum ada video untuk kelas yang kamu ikuti."}
          </p>
        </div>
      )}

      {/* Modal Player */}
      <Modal
        isOpen={isPlayerOpen}
        onClose={() => {
          setIsPlayerOpen(false);
          setSelectedVideo(null);
        }}
        title="Putar Video"
        style={{ maxWidth: "60%" }}
      >
        {selectedVideo && (
          <>
            <div className={styles.playerWrap}>
              <iframe
                src={`${getEmbedUrl(selectedVideo.youtube_id)}?autoplay=1`}
                title={selectedVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className={styles.playerInfo}>
              <h3 className={styles.playerTitle}>{selectedVideo.title}</h3>
              {selectedVideo.description && (
                <p className={styles.playerDesc}>{selectedVideo.description}</p>
              )}
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default UserVideosPage;
