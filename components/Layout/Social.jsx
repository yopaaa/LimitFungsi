import styles from './Social.module.css';
import layoutData from "../../data/layout.json";

const Social = () => {
  const { social: data } = layoutData;

  return (
    <section id="social" className={styles.social}>
      <div className={styles.sectionInner}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionNumber}>{data.page_number}</span>
          <h2 className={styles.sectionTitle}>{data.title}</h2>
        </div>
        <div className={styles.socialGridContainer}>
          <div className={styles.socialGrid}>
            {data.data.map((soc, i) => (
              <a key={i} href={soc.url} target="_blank" rel="noreferrer" className={styles.socialItem}>
                <span className={styles.socialIcon}>{/* Masukkan SVG masing-masing di sini */}</span>
                <span className={styles.socialName}>{soc.name}</span>
                <span className={styles.socialHandle}>{soc.handle}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Social;