import styles from './styles/Hero.module.css';

const data = {
  name: "Yopa-Pitra R.",
  title: "Full-stack Developer & UI Designer",
  location: "Bangka, Indonesia",
  availability: "Available for work",
  description: "Full-stack developer & UI designer yang suka membangun produk digital bermakna. Spesialis React, Node.js, dan pengalaman pengguna yang bersih tapi berkarakter.",
  projectsUrl: "#services",
  articlesUrl: "#articles",
  experience: "4+ Years XP",
  status: "🟢 Open to collab"
};

export default function Hero() {
  return (
    <section id="hero" className={styles.hero}>
      <div className={styles.heroGrid}>
        <div className={styles.heroLeft}>
          <span className={styles.heroTag}>✦ {data.availability} · {data.location}</span>
          <h1 className={styles.heroName}>
            {data.name.split('-').map((word, index) => (
             <span key={index}>
             <span key={index}>{word}</span> 
             <br />
             </span>
            ))}
          </h1>
          <p className={styles.heroDesc}>
            {data.description}
          </p>
          <div className={styles.heroBtns}>
            <a href={data.projectsUrl} className="btn btn-primary">Lihat Proyek →</a>
            <a href={data.articlesUrl} className="btn btn-secondary">Baca Artikel</a>
          </div>
        </div>
        <div className={styles.heroImageBox}>
          <div className={`${styles.floatingBadge} ${styles.badgeExp}`}>{data.experience}</div>
          <div className={styles.heroImgWrapper}>
            <div className={styles.avatarPlaceholder}>
              <img src="/images/yopa.jpeg" alt="Avatar" className={styles.heroImage} />
            </div>
          </div>
          <div className={`${styles.floatingBadge} ${styles.badgeStatus}`}>{data.status}</div>
        </div>
      </div>
    </section>
  );
}