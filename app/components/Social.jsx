import styles from './styles/Social.module.css';

const socials = [
  { name: 'GitHub', handle: '@yopaaa', icon: 'GH', url: '#' },
  { name: 'X / Twitter', handle: '@yopaaa_', icon: 'X', url: '#' },
  { name: 'LinkedIn', handle: 'Yopa Pitra R.', icon: 'IN', url: '#' },
  { name: 'Instagram', handle: '@yopaaa.dev', icon: 'IG', url: '#' },
  { name: 'Telegram', handle: '@yopaaa', icon: 'TG', url: '#' },
];

export default function Social() {
  return (
    <section id="social" className={styles.social}>
      <div className={styles.sectionInner}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionNumber}>04</span>
          <h2 className={styles.sectionTitle}>TEMUKAN SAYA DI</h2>
        </div>
        <div className={styles.socialGridContainer}>
        <div className={styles.socialGrid}>
          {socials.map((soc) => (
            <a key={soc.name} href={soc.url} target="_blank" rel="noreferrer" className={styles.socialItem}>
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
}