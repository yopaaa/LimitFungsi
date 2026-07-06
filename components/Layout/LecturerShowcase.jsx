"use client";

import React, { useEffect, useState } from "react";
import { pb } from "@/utils/db";
import styles from "./LecturerShowcase.module.css";

const LecturerShowcase = () => {
  const [lecturer, setLecturer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLecturer = async () => {
      try {
        console.log("LecturerShowcase: Fetching lecturer from /api/lecturer...");
        const response = await fetch("/api/lecturer");
        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("LecturerShowcase: Successfully fetched lecturer:", data);
        setLecturer(data);
      } catch (err) {
        console.error("LecturerShowcase: Error fetching lecturer:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLecturer();
  }, []);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Memuat data dosen...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.loadingContainer} style={{ borderColor: 'var(--error)' }}>
        <p style={{ color: 'var(--error)', fontWeight: 'bold' }}>Gagal memuat dosen: {error}</p>
      </div>
    );
  }

  if (!lecturer) return null;

  return (
    <section className={styles.lecturerSection} id="dosen">
      <div className={styles.sectionInner}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionNumber}>01</span>
          <h2 className={styles.sectionTitle}>DOSEN PENGAMPU</h2>
        </div>

        <div className={styles.cardContainer}>
          <div className={styles.lecturerCard}>
            <div className={styles.cardBorderTop} />
            <div className={styles.avatarContainer}>
              {lecturer.profile ? (
                <img
                  src={pb.files.getURL(lecturer, lecturer.profile)}
                  alt={lecturer.nama}
                  className={styles.avatarImg}
                />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  {lecturer.nama?.charAt(0).toUpperCase() || "D"}
                </div>
              )}
            </div>
            <h3 className={styles.lecturerName}>{lecturer.nama}</h3>
            <p className={styles.lecturerInstansi}>{lecturer.instansi || "Polman Babel"}</p>
            <p className={styles.lecturerEmail}>{lecturer.email}</p>
            <span className={styles.roleBadge}>Dosen Pengampu</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LecturerShowcase;
