"use client";

import React from "react";
import Link from "next/link";
import styles from "./HeroSection.module.css";
import { LuArrowRight, LuSparkles, LuBookOpen, LuCpu } from "react-icons/lu";

const HeroSection = () => {
  return (
    <section className={styles.hero}>
      <div className={styles.content}>
        <div className={styles.badge}>
          <LuSparkles /> <span>Platform Belajar Kalkulus Terkini</span>
        </div>
        <h1 className={styles.title}>
          Kuasai Konsep <span className={styles.highlight}>Limit Fungsi</span> dengan Mudah!
        </h1>
        <p className={styles.subtitle}>
          Jelajahi materi interaktif, kerjakan tugas dengan penilaian AI otomatis, 
          dan diskusikan kesulitanmu dengan Limit Bot yang cerdas.
        </p>
        <div className={styles.actions}>
          <Link href="/auth/login" className={styles.primaryBtn}>
            Mulai Belajar Sekarang <LuArrowRight />
          </Link>
          <Link href="/materials" className={styles.secondaryBtn}>
            <LuBookOpen /> Jelajahi Materi
          </Link>
        </div>
      </div>

      <div className={styles.visual}>
        <div className={styles.card1}>
          <div className={styles.cardIcon}><LuCpu size={32} /></div>
          <h3>Interaktif</h3>
          <p>Penilaian tugas instan & akurat.</p>
        </div>
        <div className={styles.card2}>
          <div className={styles.cardIcon}><LuSparkles size={32} /></div>
          <h3>Limit Bot</h3>
          <p>Asisten AI siap bantu 24/7.</p>
        </div>
        <div className={styles.decoration1}></div>
        <div className={styles.decoration2}></div>
      </div>
    </section>
  );
};

export default HeroSection;
