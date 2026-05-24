import styles from "./Team.module.css";

const data = {
  page_number: "02", 
  title: "TEAM",
  data: [
    {
      id: "c1",
      img: "/images/yopa.jpeg",
      name: "Yopa",
      desc: "URL shortener dengan analitik real-time.",
      url: "katalis.yopa.dev",
    },
    {
      id: "c2",
      img: "/images/yopa.jpeg",
      name: "Yopa",
      desc: "Sistem kasir berbasis web untuk UMKM.",
      url: "kasir.yopa.dev",
    },
    {
      id: "c3",
      img: "/images/yopa.jpeg",
      name: "Yopa",
      desc: "Sistem kasir berbasis web untuk UMKM.",
      url: "kasir.yopa.dev",
    },
  ],
};

export default function Team() {
  return (
    <section id="team" className={styles.services}>
      <div className={styles.sectionInner}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionNumber}>{data.page_number}</span>
          <h2 className={styles.sectionTitle}>{data.title}</h2>
        </div>
        <div className={styles.servicesGridContainer}>
          <div className={styles.servicesGrid}>
            {data.data.map((p) => (
              <a
                key={p.id}
                href={`https://${p.url}`}
                className={`${styles.serviceCard} ${styles[p.id]}`}
              >
                <div className={styles.serviceIcon}>
                  <img src={p.img} alt={p.name} />
                </div>
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
