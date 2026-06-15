"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";
import Button from "@/components/UI/Button";
import { pb } from "@/utils/db";
import Link from "next/link";
import { LuPlus, LuPencil, LuTrash2, LuEye } from "react-icons/lu";

export default function MaterialsAdminPage() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const records = await pb.collection("limit_materials").getFullList({
        sort: "-created",
        expand: "admin_id",
      });
      setMaterials(records);
    } catch (error) {
      console.error("Gagal mengambil data materi:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Apakah Anda yakin ingin menghapus materi ini?")) return;
    try {
      await pb.collection("limit_materials").delete(id);
      setMaterials(materials.filter((m) => m.id !== id));
    } catch (error) {
      alert("Gagal menghapus materi.");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerFlex}>
        <div>
          <h1 className={styles.title}>Manajemen Materi</h1>
          <p className={styles.subtitle}>Tulis dan kelola jurnal atau materi pembelajaran</p>
        </div>
        <Link href="/admin/materials/new">
          <Button >
            <LuPlus /> Tambah Materi
          </Button>
        </Link>
      </div>

      {loading ? (
        <p>Memuat materi...</p>
      ) : (
        <div className={styles.materialGrid}>
          {materials.length > 0 ? (
            materials.map((item) => (
              <div key={item.id} className={styles.materialCard}>
                <div className={`${styles.statusBadge} ${styles[item.status]}`}>
                  {item.status}
                </div>
                <div className={styles.cardContent}>
                  <h3>{item.title}</h3>
                  <span className={styles.slug}>/{item.slug}</span>
                </div>
                <div className={styles.cardFooter}>
                  <span className={styles.date}>
                    {new Date(item.created).toLocaleDateString("id-ID")}
                  </span>
                  <div className={styles.actionBtns}>
                    <Link href={`/materials/${item.slug}`} target="_blank">
                      <Button type="secondary" title="Lihat">
                        <LuEye />
                      </Button>
                    </Link>
                    <Link href={`/admin/materials/edit/${item.id}`}>
                      <Button type="secondary" title="Edit">
                        <LuPencil />
                      </Button>
                    </Link>
                    <Button 
                      type="secondary" 
                      onClick={() => handleDelete(item.id)}
                      title="Hapus"
                    >
                      <LuTrash2 color="red" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className={styles.empty}>Belum ada materi. Silakan buat materi baru.</p>
          )}
        </div>
      )}
    </div>
  );
}
