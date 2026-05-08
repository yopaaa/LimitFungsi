import "./globals.css";


export async function generateMetadata({ params }) {
  const { username } = await params;

  return {
    title: `${username} | Profile`,
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
