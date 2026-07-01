"use client";

import React, { useEffect, useState, useRef } from "react";
import { pb } from "@/utils/db";
import styles from "./StudentsShowcase.module.css";

const StudentsShowcase = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const containerRef = useRef(null);
  const isDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const animationRef = useRef(null);
  const isHoveredRef = useRef(false);

  const speed = 0.8; // pixels per frame

  const startMarquee = () => {
    const container = containerRef.current;
    if (!container) return;

    const scroll = () => {
      if (isDownRef.current) return;
      if (isHoveredRef.current) {
        animationRef.current = requestAnimationFrame(scroll);
        return;
      }

      container.scrollLeft += speed;

      if (container.scrollLeft >= container.scrollWidth / 2) {
        container.scrollLeft = 0;
      }

      animationRef.current = requestAnimationFrame(scroll);
    };

    animationRef.current = requestAnimationFrame(scroll);
  };

  const stopMarquee = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  // Hook 1: Ambil data mahasiswa dari API
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

  // Hook 2: Efek inisialisasi Marquee
  useEffect(() => {
    if (students.length > 0 && !loading && !error) {
      startMarquee();
    }
    return () => stopMarquee();
  }, [students, loading, error]);

  const handleMouseDown = (e) => {
    const container = containerRef.current;
    if (!container) return;
    isDownRef.current = true;
    container.style.cursor = "grabbing";
    startXRef.current = e.pageX - container.offsetLeft;
    scrollLeftRef.current = container.scrollLeft;
    stopMarquee();
  };

  const handleMouseLeaveOrUp = () => {
    if (!isDownRef.current) return;
    isDownRef.current = false;
    if (containerRef.current) {
      containerRef.current.style.cursor = "grab";
    }
    startMarquee();
  };

  const handleMouseMove = (e) => {
    if (!isDownRef.current) return;
    e.preventDefault();
    const container = containerRef.current;
    if (!container) return;
    const x = e.pageX - container.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    let newScrollLeft = scrollLeftRef.current - walk;

    if (newScrollLeft <= 0) {
      newScrollLeft = container.scrollWidth / 2;
      startXRef.current = e.pageX - container.offsetLeft;
      scrollLeftRef.current = newScrollLeft;
    } else if (newScrollLeft >= container.scrollWidth / 2) {
      newScrollLeft = 0;
      startXRef.current = e.pageX - container.offsetLeft;
      scrollLeftRef.current = newScrollLeft;
    }

    container.scrollLeft = newScrollLeft;
  };

  const handleTouchStart = (e) => {
    const container = containerRef.current;
    if (!container) return;
    isDownRef.current = true;
    startXRef.current = e.touches[0].pageX - container.offsetLeft;
    scrollLeftRef.current = container.scrollLeft;
    stopMarquee();
  };

  const handleTouchEnd = () => {
    if (!isDownRef.current) return;
    isDownRef.current = false;
    startMarquee();
  };

  const handleTouchMove = (e) => {
    if (!isDownRef.current) return;
    const container = containerRef.current;
    if (!container) return;
    const x = e.touches[0].pageX - container.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    let newScrollLeft = scrollLeftRef.current - walk;

    if (newScrollLeft <= 0) {
      newScrollLeft = container.scrollWidth / 2;
      startXRef.current = e.touches[0].pageX - container.offsetLeft;
      scrollLeftRef.current = newScrollLeft;
    } else if (newScrollLeft >= container.scrollWidth / 2) {
      newScrollLeft = 0;
      startXRef.current = e.touches[0].pageX - container.offsetLeft;
      scrollLeftRef.current = newScrollLeft;
    }

    container.scrollLeft = newScrollLeft;
  };

  const handleMouseEnter = () => {
    isHoveredRef.current = true;
  };

  const handleMouseLeaveContainer = () => {
    isHoveredRef.current = false;
    handleMouseLeaveOrUp();
  };

  // ================= TAHAP EARLY RETURNS =================
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
 
        <div 
          className={styles.marqueeContainer}
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseLeaveOrUp}
          onMouseLeave={handleMouseLeaveContainer}
          onMouseMove={handleMouseMove}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchMove={handleTouchMove}
          onMouseEnter={handleMouseEnter}
        >
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
