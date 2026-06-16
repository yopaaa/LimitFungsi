"use client";

import { useEffect, useState } from "react";
import { pb } from "@/utils/db";
import styles from "./page.module.css";
import Link from "next/link";
import { LuBookOpen, LuUser, LuCalendar } from "react-icons/lu";
import Header from "@/components/Layout/Header";
import Footer from "@/components/Layout/Footer";

function MaterialsListPage() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      // OPTIMASI: Hanya mengambil field yang diperlukan untuk daftar.
      // Field 'content' yang besar sengaja tidak diambil untuk menghemat bandwidth.
      const records = await pb.collection("limit_materials").getFullList({
        filter: 'status = "published"',
        sort: "-created",
        expand: "admin_id",
        fields:
          "id,collectionId,title,slug,thumbnail,description,created,expand.admin_id.nama,status",
      });
      setMaterials(records);
    } catch (error) {
      console.error("Gagal memuat daftar materi:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return <div className={styles.loading}>Memuat daftar materi...</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Materi Pembelajaran</h1>
        <p className={styles.subtitle}>
          Jelajahi jurnal dan materi kalkulus untuk memperdalam pemahamanmu.
        </p>
      </header>

      {materials.length > 0 ? (
        <div className={styles.grid}>
          {materials.map((item) => (
            <Link
              key={item.id}
              href={`/materials/${item.slug}`}
              className={styles.card}
            >
              <div className={styles.thumbnailWrapper}>
                {item.thumbnail ? (
                  <img
                    src={pb.files.getURL(item, item.thumbnail)}
                    alt={item.title}
                    className={styles.thumbnail}
                  />
                ) : (
                  <div className={styles.placeholderThumbnail}>
                    <LuBookOpen size={48} />
                  </div>
                )}
              </div>

              <div className={styles.cardBody}>
                <div className={styles.cardHeader}>
                  <h2 className={styles.materialTitle}>{item.title}</h2>
                  <span className={styles.badge}>Materi</span>
                </div>

                {item.description && (
                  <p className={styles.description}>{item.description}</p>
                )}

                <div className={styles.footer}>
                  <div className={styles.authorInfo}>
                    <LuUser />
                    <span>{item.expand?.admin_id?.nama || "Admin"}</span>
                  </div>
                  <div className={styles.date}>
                    <LuCalendar />
                    <span>
                      {new Date(item.created).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          <p>Belum ada materi yang dipublikasikan.</p>
        </div>
      )}
    </div>
  );
}

export default function RegisterLayout({ children }) {
  return (
    <div className={styles.pageWrapper}>
      {/* Ornamen Latar Belakang Tetap di Sini */}

      {/* Header Global */}
      <div className={styles.contentWrapper}>
        <Header />

        <main className={styles.mainContent}>
          <MaterialsListPage />
        </main>

        <Footer />
      </div>
    </div>
  );
}
