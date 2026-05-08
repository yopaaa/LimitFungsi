import styles from './styles/Articles.module.css';

const posts = [
  {
    tag: 'React',
    title: 'KENAPA SAYA BERHENTI PAKAI USEEFFECT UNTUK DATA FETCHING',
    excerpt: 'useEffect bukan jawaban untuk semua masalah. Berikut pendekatan yang lebih bersih...',
    date: '12 Apr 2025 · 8 min baca'
  },
  {
    tag: 'Design',
    title: 'NEUBRUTALISM: ESTETIKA YANG JUJUR DI DUNIA DIGITAL',
    excerpt: 'Apa itu neubrutalism, kenapa trending, dan bagaimana menggunakannya tanpa terlihat alay.',
    date: '28 Mar 2025 · 6 min baca'
  },
  {
    tag: 'Backend',
    title: 'MEMBANGUN API YANG TIDAK MEMBUAT DEV LAIN MENANGIS',
    excerpt: 'Panduan praktis membuat REST API yang konsisten, terdokumentasi, dan mudah di-maintain.',
    date: '15 Mar 2025 · 12 min baca'
  }
];

export default function Articles() {
  return (
    <section id="articles" className={styles.articles}>
      <div className={styles.sectionInner}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionNumber}>02</span>
          <h2 className={styles.sectionTitle}>ARTIKEL TERBARU</h2>
        </div>
        <div className={styles.articlesGridContainer}>
        <div className={styles.articlesGrid}>
          {posts.map((post, i) => (
            <a key={i} href="#" className={styles.articleCard}>
              <span className={styles.articleTag}>{post.tag}</span>
              <h3 className={styles.articleTitle}>{post.title}</h3>
              <p className={styles.articleExcerpt}>{post.excerpt}</p>
              <span className={styles.articleMeta}>{post.date}</span>
            </a>
          ))}
        </div>
        </div>
      </div>
    </section>
  );
}