// import styles from "./page.module.css";
// import Image from "next/image";
// import { getUsers } from "@/utils/getUsersInfo";
// import { notFound } from "next/navigation";

// const users = [
//   { "username": "yopa", "name": "Yopa Pitra" },
//   { "username": "linus", "name": "Linus Dev" }
// ]


// export default async function Home({ params }) {
//   const data = await getUsers();
//   const { username } = await params;

//   const user = users.find(u => u.username === username);

//   if (!user) {
//     notFound();
//   }

//   return (
//     <div className={styles.container}>
//       {/* <div className={styles.card}>
//           <div className={styles.profile2}>
//             <Image
//               src="/images/yopa.jpeg"
//               alt="Profile"
//               // fill
//               width={200}
//               height={200}
//               className={styles.image}
//             />
//           </div>
//         <div className={styles.left}>

//           <h1 className={styles.name}>Yopa pitra ramadhani</h1>

//           <div className={styles.meta}>
//             <span>💼 Fullstack developer</span>
//             <span>🌍 Kepulauan Bangka-Belitung, Indonesia</span>
//           </div>

//           <p className={styles.desc}>
//             {data.title}
//             Saya adalah mahasiswa teknik jaringan komputer yang memiliki
//             keterampilan dalam pemrograman web, IoT, dan komputasi awan. Saya
//             sangat antusias dan selalu ingin belajar hal-hal baru di bidang
//             teknologi informasi.
//           </p>

//           <button className={styles.button}>Lihat Lebih Banyak</button>

//           <div className={styles.social}>
//             <span>
//               <a href="http://">
//                 <Image
//                   src="/icon/github.png"
//                   alt="Profile"
//                   width={20}
//                   height={20}
//                   // className={styles.image}
//                 />
//               </a>
//             </span>
//             <span>
//               <a href="http://">
//                 <Image
//                   src="/icon/linkedin.png"
//                   alt="Profile"
//                   width={20}
//                   height={20}
//                   // className={styles.image}
//                 />
//               </a>
//             </span>{" "}
//             <span>
//               <a href="http://">
//                 <Image
//                   src="/icon/email.png"
//                   alt="Profile"
//                   width={20}
//                   height={20}
//                   // className={styles.image}
//                 />
//               </a>
//             </span>{" "}
//             <span>
//               <a href="http://">
//                 <Image
//                   src="/icon/instagram.png"
//                   alt="Profile"
//                   width={20}
//                   height={20}
//                   // className={styles.image}
//                 />
//               </a>
//             </span>{" "}
//             <span>
//               <a href="http://">
//                 <Image
//                   src="/icon/twitter.png"
//                   alt="Profile"
//                   width={20}
//                   height={20}
//                   // className={styles.image}
//                 />
//               </a>
//             </span>
//           </div>
//         </div>

//         <div className={styles.right}>
//           <Image
//             src="/images/yopa.jpeg"
//             alt="Profile"
//             fill
//             className={styles.image}
//           />
//         </div>
//       </div> */}


   

// <nav className={styles.navbar}>
//   <span className={styles.nav_logo}>RP//DEV</span>
//   <ul className={styles.nav_links}>
//     <li><a href="#about">Tentang</a></li>
//     <li><a href="#articles">Artikel</a></li>
//     <li><a href="#services">Servis</a></li>
//     <li><a href="#social">Sosmed</a></li>
//     <li><a href="mailto:hello@yopaaa.dev" className={`${styles.btn} ${styles.btn_primary}`} >Kontak →</a></li>
//   </ul>
// </nav>

// <section id="hero">
//   <div className={styles.hero_grid}>
//     <div className={styles.hero_left}>
//       <span className={styles.hero_tag}>✦ Available for work · Batam, ID</span>
//       <h1 className={styles.hero_name}>RIZKY <br /> <span>PRATAMA</span></h1>
//       <p className={styles.hero_desc}>
//         Full-stack developer & UI designer yang suka membangun produk digital bermakna. Spesialis React, Node.js, dan pengalaman pengguna yang bersih tapi berkarakter.
//       </p>
//       <div className={styles.hero_btns}>
//         <a href="#services" className={`${styles.btn} ${styles.btn_primary}`}>Lihat Proyek →</a>
//         <a href="#articles" className={`${styles.btn} ${styles.btn_secondary}`}>Baca Artikel</a>
//       </div>
//     </div>
//     <div className={styles.hero_image_box}>
//       <div className={styles.hero_img_wrapper}>
//         <div className={styles.avatar_placeholder}>RP</div>
//       </div>
//       <div className={`${styles.floating_badge} ${styles.badge_status}`}>🟢 Open to collab</div>
//       <div className={`${styles.floating_badge} ${styles.badge_exp}`}>4+ Years XP</div>
//     </div>
//   </div>
// </section>

// <div className={styles.marquee_strip}>
//   <div className={styles.marquee_track}>
//     <span className={styles.marquee_item}>REACT</span><span className={`${styles.marquee_item} ${styles.marquee_sep}`}>✦</span>
//     <span className={styles.marquee_item}>NODE.JS</span><span className={`${styles.marquee_item} ${styles.marquee_sep}`}>✦</span>
//     <span className={styles.marquee_item}>UI DESIGN</span><span className={`${styles.marquee_item} ${styles.marquee_sep}`}>✦</span>
//     <span className={styles.marquee_item}>TYPESCRIPT</span><span className={`${styles.marquee_item} ${styles.marquee_sep}`}>✦</span>
//     <span className={styles.marquee_item}>NEXT.JS</span><span className={`${styles.marquee_item} ${styles.marquee_sep}`}>✦</span>
//     <span className={styles.marquee_item}>FIGMA</span><span className={`${styles.marquee_item} ${styles.marquee_sep}`}>✦</span>
//     <span className={styles.marquee_item}>POSTGRESQL</span><span className={`${styles.marquee_item} ${styles.marquee_sep}`}>✦</span>
//     {/* <!-- duplicate for loop --> */}
//     <span className={styles.marquee_item}>REACT</span><span className={`${styles.marquee_item} ${styles.marquee_sep}`}>✦</span>
//     <span className={styles.marquee_item}>NODE.JS</span><span className={`${styles.marquee_item} ${styles.marquee_sep}`}>✦</span>
//     <span className={styles.marquee_item}>UI DESIGN</span><span className={`${styles.marquee_item} ${styles.marquee_sep}`}>✦</span>
//     <span className={styles.marquee_item}>TYPESCRIPT</span><span className={`${styles.marquee_item} ${styles.marquee_sep}`}>✦</span>
//     <span className={styles.marquee_item}>NEXT.JS</span><span className={`${styles.marquee_item} ${styles.marquee_sep}`}>✦</span>
//     <span className={styles.marquee_item}>FIGMA</span><span className={`${styles.marquee_item} ${styles.marquee_sep}`}>✦</span>
//     <span className={styles.marquee_item}>POSTGRESQL</span><span className={`${styles.marquee_item} ${styles.marquee_sep}`}>✦</span>
//   </div>
// </div>

// <section id="about">
//   <div className={styles.section_inner}>
//     <div className={styles.section_header}>
//       <span className={styles.section_number}>01</span>
//       <h2 className={styles.section_title}>TENTANG SAYA</h2>
//     </div>
//     <div className={styles.stats_grid}>
//       <div className={styles.stat_item}>
//         <span className={styles.stat_num}>4+</span>
//         <span className={styles.stat_label}>Tahun Pengalaman</span>
//       </div>
//       <div className={styles.stat_item}>
//         <span className={styles.stat_num}>32</span>
//         <span className={styles.stat_label}>Proyek Selesai</span>
//       </div>
//       <div className={styles.stat_item}>
//         <span className={styles.stat_num}>18</span>
//         <span className={styles.stat_label}>Klien Puas</span>
//       </div>
//       <div className={styles.stat_item}>
//         <span className={styles.stat_num}>12</span>
//         <span className={styles.stat_label}>Artikel Ditulis</span>
//       </div>
//     </div>
//     <p className={styles.about_text}>
//       Halo! Saya Rizky — seorang full-stack developer berbasis di Batam yang passionate dalam membangun produk digital yang tidak hanya berfungsi, tapi juga terasa menyenangkan dipakai. Saya percaya bahwa kode yang baik adalah kode yang bisa dibaca manusia, dan desain yang baik adalah desain yang tidak perlu manual.
//       <br /><br />
//       Saat tidak sedang ngoding, saya suka nulis artikel teknikal, eksplorasi teknologi baru, dan sesekali desain poster dengan estetika yang absurd tapi intentional.
//     </p>
//     <div className={styles.skill_tags}>
//       <span className={styles.skill_tag}>React.js</span>
//       <span className={styles.skill_tag}>Next.js</span>
//       <span className={styles.skill_tag}>Node.js</span>
//       <span className={styles.skill_tag}>TypeScript</span>
//       <span className={styles.skill_tag}>PostgreSQL</span>
//       <span className={styles.skill_tag}>Tailwind CSS</span>
//       <span className={styles.skill_tag}>Docker</span>
//       <span className={styles.skill_tag}>Figma</span>
//       <span className={styles.skill_tag}>Redis</span>
//       <span className={styles.skill_tag}>REST API</span>
//       <span className={styles.skill_tag}>Git & GitHub</span>
//       <span className={styles.skill_tag}>Linux</span>
//     </div>
//   </div>
// </section>

// <section id="articles">
//   <div className={styles.section_inner}>
//     <div className={styles.section_header}>
//       <span className={styles.section_number}>02</span>
//       <h2 className={styles.section_title}>ARTIKEL TERBARU</h2>
//     </div>
//     <div className={styles.articles_grid}>
//       <a href="#" className={styles.article_card}>
//         <span className={styles.article_tag}>React</span>
//         <h3 className={styles.article_title}>KENAPA SAYA BERHENTI PAKAI USEEFFECT UNTUK DATA FETCHING</h3>
//         <p className={styles.article_excerpt}>useEffect bukan jawaban untuk semua masalah. Berikut pendekatan yang lebih bersih dengan React Query dan Suspense.</p>
//         <span className={styles.article_meta}>12 Apr 2025 · 8 min baca</span>
//       </a>
//       <a href="#" className={styles.article_card}>
//         <span className={styles.article_tag}>Design</span>
//         <h3 className={styles.article_title}>NEUBRUTALISM: ESTETIKA YANG JUJUR DI DUNIA DIGITAL</h3>
//         <p className={styles.article_excerpt}>Apa itu neubrutalism, kenapa trending, dan bagaimana menggunakannya tanpa terlihat alay di produk serius.</p>
//         <span className={styles.article_meta}>28 Mar 2025 · 6 min baca</span>
//       </a>
//       <a href="#" className={styles.article_card}>
//         <span className={styles.article_tag}>Backend</span>
//         <h3 className={styles.article_title}>MEMBANGUN API YANG TIDAK MEMBUAT DEV LAIN MENANGIS</h3>
//         <p className={styles.article_excerpt}>Panduan praktis membuat REST API yang konsisten, terdokumentasi, dan mudah di-maintain oleh tim.</p>
//         <span className={styles.article_meta}>15 Mar 2025 · 12 min baca</span>
//       </a>
//     </div>
//   </div>
// </section>

// <section id="services">
//   <div className={styles.section_inner}>
//     <div className={styles.section_header}>
//       <span className={styles.section_number}>03</span>
//       <h2 className={styles.section_title}>PROYEK & SERVIS</h2>
//     </div>
//     <div className={styles.services_grid}>
//       <a href="https://katalis.rizkypratama.dev" target="_blank" className={`${styles.service_card} ${styles.c1}`}>
//         <div className={styles.service_icon}>⚡</div>
//         <h3 className={styles.service_name}>KATALIS — Link Shortener</h3>
//         <p className={styles.service_desc}>URL shortener dengan analitik real-time, custom slug, dan QR code generator. Dibangun dengan Next.js dan Redis untuk performa maksimal.</p>
//         <span className={styles.service_url}>katalis.rizkypratama.dev →</span>
//       </a>
//       <a href="https://kasir.rizkypratama.dev" target="_blank" className={`${styles.service_card} ${styles.c2}`}>
//         <div className={styles.service_icon}>🧾</div>
//         <h3 className={styles.service_name}>KASIR — POS System</h3>
//         <p className={styles.service_desc}>Sistem kasir berbasis web untuk UMKM lokal. Multi-outlet, laporan harian, dan bisa jalan offline. Stack: React + Electron + SQLite.</p>
//         <span className={styles.service_url}>kasir.rizkypratama.dev →</span>
//       </a>
//       <a href="https://catatan.rizkypratama.dev" target="_blank" className={`${styles.service_card} ${styles.c3}`}>
//         <div className={styles.service_icon}>📝</div>
//         <h3 className={styles.service_name}>CATATAN — Markdown Notes</h3>
//         <p className={styles.service_desc}>Aplikasi catatan minimalis dengan Markdown support, folder organization, dan sync ke GitHub Gist. Buka di browser, langsung kerja.</p>
//         <span className={styles.service_url}>catatan.rizkypratama.dev →</span>
//       </a>
//       <a href="https://prakiraan.rizkypratama.dev" target="_blank" className={`${styles.service_card} ${styles.c4}`}>
//         <div className={styles.service_icon}>🌤</div>
//         <h3 className={styles.service_name}>PRAKIRAAN — Weather App</h3>
//         <p className={styles.service_desc}>Cuaca harian dan mingguan dengan visualisasi yang bersih. Data dari BMKG + OpenWeather, fokus kota-kota di Indonesia.</p>
//         <span className={styles.service_url}>prakiraan.rizkypratama.dev →</span>
//       </a>
//     </div>
//   </div>
// </section>

// <section id="social">
//   <div className={styles.section_inner}>
//     <div className={styles.section_header}>
//       <span className={styles.section_number}>04</span>
//       <h2 className={styles.section_title}>TEMUKAN SAYA DI</h2>
//     </div>
//     <div className={styles.social_grid}>
//       <a href="https://github.com/rizkypratama" target="_blank" className={styles.social_item}>
//         <span className={styles.social_icon}>
//           <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
//         </span>
//         <span className={styles.social_name}>GitHub</span>
//         <span className={styles.social_handle}>@yopaaa</span>
//       </a>
//       <a href="https://twitter.com/rizkypratama_" target="_blank" className={styles.social_item}>
//         <span className={styles.social_icon}>
//           <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
//         </span>
//         <span className={styles.social_name}>X / Twitter</span>
//         <span className={styles.social_handle}>@yopaaa_</span>
//       </a>
//       <a href="https://linkedin.com/in/rizkypratama" target="_blank" className={styles.social_item}>
//         <span className={styles.social_icon}>
//           <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
//         </span>
//         <span className={styles.social_name}>LinkedIn</span>
//         <span className={styles.social_handle}>Yopa Pitra R.</span>
//       </a>
//       <a href="https://instagram.com/rizkypratama.dev" target="_blank" className={styles.social_item}>
//         <span className={styles.social_icon}>
//           <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
//         </span>
//         <span className={styles.social_name}>Instagram</span>
//         <span className={styles.social_handle}>@yopaaa.dev</span>
//       </a>
//       <a href="https://t.me/rizkypratama" target="_blank" className={styles.social_item}>
//         <span className={styles.social_icon}>
//           <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.96 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
//         </span>
//         <span className={styles.social_name}>Telegram</span>
//         <span className={styles.social_handle}>@yopaaa</span>
//       </a>
//     </div>
//   </div>
// </section>

// <footer className={styles.footer}>
//   <div className={styles.footer_inner}>
//     <div className={styles.footer_brand}>
//       <span className={styles.footer_logo}>RP</span>
//       <p className={styles.footer_tagline}>
//         Building things for the web.<br />
//         Based in Batam, Indonesia.<br />
//         hello@yopaaa.dev
//       </p>
//     </div>
//     <div className={styles.footer_col}>
//       <h4>Navigasi</h4>
//       <ul className={styles.footer_links}>
//         <li><a href="#about">Tentang Saya</a></li>
//         <li><a href="#articles">Artikel</a></li>
//         <li><a href="#services">Servis & Proyek</a></li>
//         <li><a href="#social">Media Sosial</a></li>
//       </ul>
//     </div>
//     <div className={styles.footer_col}>
//       <h4>Kontak</h4>
//       <ul className={styles.footer_links}>
//         <li><a href="mailto:hello@yopaaa.dev">hello@yopaaa.dev</a></li>
//         <li><a href="https://cal.com/rizkypratama" target="_blank">Jadwalkan Meeting</a></li>
//         <li><a href="#" target="_blank">Download CV</a></li>
//       </ul>
//     </div>
//   </div>
//   <div className={styles.footer_bottom} style={{paddingLeft:"40px",paddingRight:"40px"}}>
//     <p className={styles.footer_copy}>© 2025 <span>Yopa Pitra R.</span> — Dibuat dengan ☕ & terlalu banyak caffeine</p>
//     <a href="#hero" className={styles.footer_scroll_top} title="Scroll ke atas">↑</a>
//   </div>
// </footer>

// {/* <script>
//   // smooth scroll
//   document.querySelectorAll('a[href^="#"]').forEach(a => {
//     a.addEventListener('click', e => {
//       const target = document.querySelector(a.getAttribute('href'));
//       if (target) {
//         e.preventDefault();
//         target.scrollIntoView({ behavior: 'smooth' });
//       }
//     });
//   });
// </script> */}
//     </div>
//   );
// }

import Head from 'next/head';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Marquee from '../components/Marquee';
import About from '../components/About';
import Articles from '../components/Articles';
import Services from '../components/Services';
import Social from '../components/Social';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <>
      <Head>
        <title>Yopa Pitra R. — Developer & Designer</title>
      </Head>
      
      <Navbar />
      <main>
        <Hero />
        <Marquee />
        <About />
        <Articles />
        <Services />
        <Social />
      </main>
      <Footer />
    </>
  );
}