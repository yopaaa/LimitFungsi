"use client";

import styles from "./layout.module.css";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LuHouse, LuLogOut, LuBookPlus, LuUser, LuBot, LuArchive, LuTrophy } from "react-icons/lu";
import { FaTasks } from "react-icons/fa";
import DropdownMenu from "@/components/UI/DropdownMenu";
import { pb } from "@/utils/db";

const UserLayout = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setuser] = useState({});
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (pb.authStore.model) {
      setuser(pb.authStore.model);
    }
  }, []);

  const handleLogout = () => {
    pb.authStore.clear();
    document.cookie =
      "pb_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    localStorage.removeItem("userInfo");
    router.push("/auth/login");
  };

  const menus = [
    { icon: <LuHouse />, path: "/user", title: "Dashboard" },
    { icon: <LuBookPlus />, path: "/user/join", title: "Gabung Kelas" },
    { icon: <FaTasks />, path: "/user/tasks", title: "Tugas" },
    { icon: <LuTrophy />, path: "/user/quizzes", title: "Quiz" },
    { icon: <LuBot />, path: "/user/chatbot", title: "Chat Bot" },
    { icon: <LuArchive />, path: "/user/materials", title: "Materi" },
  ];

  const dropdownItems = [
    {
      label: "Profil",
      icon: <LuUser />,
      onClick: () => router.push("/user/profile"),
    },
    {
      label: "Logout",
      icon: <LuLogOut />,
      onClick: handleLogout,
    },
  ];

  return (
    <div className={styles.dashboardLayout}>
      <aside className={styles.sidebar}>
        <div
          className={styles.wrapSidebar}
          onMouseEnter={() => setIsDropdownOpen(false)}
        >
          <div className={styles.logo}>L</div>

          <div className={styles.navMenu}>
            {menus.map((menu, index) => (
              <Link
                href={menu.path}
                key={index}
                className={`
                  ${styles.borderMenu}
                  ${pathname === menu.path ? styles.activeMenu : ""}
                `}
              >
                <div
                  className={styles.menu}
                  title={menu.title}
                >
                  {menu.icon}
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div
          className={styles.profileContainer}
          onMouseEnter={() => setIsDropdownOpen(true)}
        >
          <DropdownMenu items={dropdownItems} isOpen={isDropdownOpen} />
          <div className={styles.profile}>
            {user.profile ? (
              <img
                src={pb.files.getURL(user, user.profile)}
                alt="Profile"
                className={styles.avatarImg}
              />
            ) : (
              user.nama?.charAt(0).toUpperCase() ||
              user.username?.charAt(0).toUpperCase()
            )}
            {/* <h1 className={styles.profileLink}>{initialName}</h1> */}
          </div>
        </div>
      </aside>

      <main
        className={styles.mainContent}
        onMouseEnter={() => setIsDropdownOpen(false)}
      >
        {children}
      </main>
    </div>
  );
};

export default UserLayout;
