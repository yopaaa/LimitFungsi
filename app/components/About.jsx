import styles from "./styles/About.module.css";

const data = {
  page_number: "01", 
  title: "TENTANG SAYA",
  skills: [
    "React.js",
    "Next.js",
    "Node.js",
    "TypeScript",
    "PostgreSQL",
    "Tailwind CSS",
    "Docker",
    "Figma",
  ],
  statistik: [
    { num: "4+", label: "Tahun Pengalaman" },
    { num: "32", label: "Proyek Selesai" },
    { num: "18", label: "Klien Puas" },
    { num: "12", label: "Artikel Ditulis" },
  ],
  description:
    "Halo! Saya Rizky — seorang full-stack developer berbasis di Batam yang passionate dalam membangun produk digital...",
};


export default function About() {
  return (
    <section id="about" className={styles.about}>
      <div className={styles.sectionInner}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionNumber}>{data.page_number}</span>
          <h2 className={styles.sectionTitle}>{data.title}</h2>
        </div>

        <div className={styles.statsGrid}>
          {data.statistik.map((stat, i) => (
            <div key={i} className={styles.statItem}>
              <span className={styles.statNum}>{stat.num}</span>
              <span className={styles.statLabel}>{stat.label}</span>
            </div>
          ))}
        </div>

        <p className={styles.aboutText}>{data.description}</p>

        <div className={styles.skillTags}>
          {data.skills.map((skill) => (
            <span key={skill} className={styles.skillTag}>
              {skill}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
