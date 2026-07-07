"use client";

import React, { useRef, useEffect } from "react";
import Image from "next/image";
import styles from "./StudentsShowcase.module.css";

const StudentsShowcaseClient = ({ students, pbUrl }) => {
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

  useEffect(() => {
    if (students && students.length > 0) {
      startMarquee();
    }
    return () => stopMarquee();
  }, [students]);

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

  if (!students || students.length === 0) {
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
    return marqueeItems.map((student, idx) => {
      const profileUrl = student.profile
        ? `${pbUrl}/api/files/${student.collectionName || "users"}/${student.id}/${student.profile}`
        : null;

      return (
        <div key={`${groupPrefix}-${student.id}-${idx}`} className={styles.studentCard}>
          <div className={styles.cardBorderTop} />
          <div className={styles.avatarContainer}>
            {profileUrl ? (
              <Image
                src={profileUrl}
                alt={student.nama}
                className={styles.avatarImg}
                width={84}
                height={84}
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
      );
    });
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

export default StudentsShowcaseClient;
