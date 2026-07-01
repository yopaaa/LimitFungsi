"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { pb } from "@/utils/db";
import styles from "./MaterialList.module.css";
import { LuBookOpen, LuArrowRight } from "react-icons/lu";

const MaterialList = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const records = await pb.collection("limit_materials").getList(1, 4, {
          filter: 'status = "published"',
          sort: "-created",
          fields: "id,title,slug,description,thumbnail,collectionId,collectionName",
        });
        setMaterials(records.items);
      } catch (error) {
        console.error("Gagal mengambil materi:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, []);

  if (loading) return <div className={styles.loading}>Memuat materi...</div>;
  if (materials.length === 0) return null;

  return (
    <section className={styles.container} id="materials">
      <div className={styles.header}>
        <div className={styles.titleWrapper}>
          <LuBookOpen className={styles.icon} />
          <h2 className={styles.title}>Materi Terbaru</h2>
        </div>
        <Link href="/materials" className={styles.viewAll}>
          Lihat Semua <LuArrowRight />
        </Link>
      </div>

      <div className={styles.grid}>
        {materials.map((item) => (
          <Link href={`/materials/${item.slug}`} key={item.id} className={styles.card}>
            {item.thumbnail && (
              <div className={styles.thumbnailWrapper}>
                <img 
                  src={pb.files.getURL(item, item.thumbnail)} 
                  alt={item.title} 
                  className={styles.thumbnail}
                />
              </div>
            )}
            <div className={styles.cardContent}>
              <h3 className={styles.materialTitle}>{item.title}</h3>
              <p className={styles.description}>
                {item.description || "Klik untuk membaca materi selengkapnya..."}
              </p>
              <span className={styles.readMore}>Baca Selengkapnya</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default MaterialList;
