import styles from './styles/Marquee.module.css';

const techStack = ["REACT", "NODE.JS", "UI DESIGN", "TYPESCRIPT", "NEXT.JS", "FIGMA", "POSTGRESQL"];

export default function Marquee() {
  return (
    <div className={styles.marqueeStrip}>
      <div className={styles.marqueeTrack}>
        {[...techStack, ...techStack].map((item, idx) => (
          <span key={idx} className={styles.marqueeItem}>
            {item}
            <span className={styles.marqueeSep}>✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}