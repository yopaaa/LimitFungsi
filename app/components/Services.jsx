import styles from "./styles/Services.module.css";

const projects = [
  {
    id: "c1",
    icon: "⚡",
    name: "KATALIS",
    desc: "URL shortener dengan analitik real-time.",
    url: "katalis.rizkypratama.dev",
  },
  {
    id: "c2",
    icon: "🧾",
    name: "KASIR",
    desc: "Sistem kasir berbasis web untuk UMKM.",
    url: "kasir.rizkypratama.dev",
  },
];

export default function Services() {
  return (
    <section id="services" className={styles.services}>
      <div className={styles.sectionInner}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionNumber}>03</span>
          <h2 className={styles.sectionTitle}>PROYEK & SERVIS</h2>
        </div>
        <div className={styles.servicesGridContainer}>
          <div className={styles.servicesGrid}>
            {projects.map((p) => (
              <a
                key={p.id}
                href={`https://${p.url}`}
                className={`${styles.serviceCard} ${styles[p.id]}`}
              >
                <div className={styles.serviceIcon}>{p.icon}</div>
                <h3 className={styles.serviceName}>{p.name}</h3>
                <p className={styles.serviceDesc}>{p.desc}</p>
                <span className={styles.serviceUrl}>{p.url} →</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
