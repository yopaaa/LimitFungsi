"use client";

import React, { useEffect, useState } from "react";
import { pb } from "@/utils/db";
import styles from "./StudentsShowcase.module.css";

const StudentsShowcase = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        console.log("StudentsShowcase: Fetching students from /api/class-students...");
        const response = await fetch("/api/class-students");
        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("StudentsShowcase: Successfully fetched students:", data);
        setStudents(data);
      } catch (err) {
        console.error("StudentsShowcase: Error fetching students:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Memuat daftar mahasiswa...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.loadingContainer} style={{ borderColor: 'var(--error)' }}>
        <p style={{ color: 'var(--error)', fontWeight: 'bold' }}>Gagal memuat mahasiswa: {error}</p>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className={styles.loadingContainer}>
        <p>Tidak ada mahasiswa terdaftar di kelas showcase.</p>
      </div>
    );
  }

  // Duplikasi daftar mahasiswa agar efek marquee tidak memiliki celah kosong.
  const multiplier = students.length < 5 ? 6 : 4;
  const marqueeItems = Array(multiplier).fill(students).flat();

  const renderCards = (groupPrefix) => {
    return marqueeItems.map((student, idx) => (
      <div key={`${groupPrefix}-${student.id}-${idx}`} className={styles.studentCard}>
        <div className={styles.cardBorderTop} />
        <div className={styles.avatarContainer}>
          {student.profile ? (
            <img
              src={pb.files.getURL(student, student.profile)}
              alt={student.nama}
              className={styles.avatarImg}
            />
          ) : (
            <div className={styles.avatarPlaceholder}>
              {student.nama?.charAt(0).toUpperCase() || "U"}
            </div>
          )}
        </div>
        <h3 className={styles.studentName}>{student.nama}</h3>
        <p className={styles.studentInstansi}>
          {student.instansi || "Polman Babel"}
        </p>
        <span className={styles.roleBadge}>Mahasiswa</span>
      </div>
    ));
  };

  return (
    <section className={styles.showcaseSection} id="students">
      <div className={styles.sectionInner}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionNumber}>02</span>
          <h2 className={styles.sectionTitle}>MAHASISWA KAMI</h2>
        </div>

        <div className={styles.marqueeContainer}>
          <div className={styles.marqueeTrack}>
            <div className={styles.marqueeGroup}>
              {renderCards("g1")}
            </div>
            <div className={styles.marqueeGroup} aria-hidden="true">
              {renderCards("g2")}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StudentsShowcase;
