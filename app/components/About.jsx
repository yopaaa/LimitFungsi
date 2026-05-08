import styles from './styles/About.module.css';

export default function About() {
  const skills = ["React.js", "Next.js", "Node.js", "TypeScript", "PostgreSQL", "Tailwind CSS", "Docker", "Figma"];

  return (
    <section id="about" className={styles.about}>
      <div className={styles.sectionInner}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionNumber}>01</span>
          <h2 className={styles.sectionTitle}>TENTANG SAYA</h2>
        </div>
        
        <div className={styles.statsGrid}>
          {[
            { num: "4+", label: "Tahun Pengalaman" },
            { num: "32", label: "Proyek Selesai" },
            { num: "18", label: "Klien Puas" },
            { num: "12", label: "Artikel Ditulis" }
          ].map((stat, i) => (
            <div key={i} className={styles.statItem}>
              <span className={styles.statNum}>{stat.num}</span>
              <span className={styles.statLabel}>{stat.label}</span>
            </div>
          ))}
        </div>

        <p className={styles.aboutText}>
          Halo! Saya Rizky — seorang full-stack developer berbasis di Batam yang passionate dalam membangun produk digital...
        </p>

        <div className={styles.skillTags}>
          {skills.map(skill => (
            <span key={skill} className={styles.skillTag}>{skill}</span>
          ))}
        </div>
      </div>
    </section>
  );
}