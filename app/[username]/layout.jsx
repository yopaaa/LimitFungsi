import "./globals.css";

export async function generateMetadata({ params }) {
  const { username } = await params;

  return {
    title: `${username} | Profile`,
    description: `Halaman profil untuk pengguna ${username}. Temukan informasi, proyek, dan kontak terkait ${username} di sini.`,
    openGraph: {
      title: `${username} | Profile`,
      description: `Halaman profil untuk pengguna ${username}. Temukan informasi, proyek, dan kontak terkait ${username} di sini.`,
      url: `https://yopaaa.xyz/${username}`,
      siteName: 'Yopaaa.xyz',
      images: [
        {
          url: `https://yopaaa.xyz/images/${username}.jpeg`,
          width: 1200,
          height: 630,
          alt: `${username}'s profile picture`,
        },
      ],
      locale: 'id_ID',
      type: 'profile',
    },
  };
}

export default async function UserLayout({ children, params }) {
  const { username } = await params;

  return (
    <div
    // style={{backgroundImage: `url(/images/${username}.jpeg)`}}
    className="containers" 
    >
      {/* <nav>
        Profile: {username}
      </nav> */}

      {children}
    </div>
  );
}
