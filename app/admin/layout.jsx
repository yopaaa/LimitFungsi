"use client";

import styles from "./layout.module.css";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LuHouse,
  LuClipboardList,
  LuTrophy,
  LuBookOpen,
  LuUsers,
  LuLogOut,
  LuBookPlus,
} from "react-icons/lu";
import { TbChartBar } from "react-icons/tb";
import DropdownMenu from "@/components/UI/DropdownMenu";
import { pb } from "@/utils/db";

const DashboardLayout = ({ children }) => {
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
    { icon: <LuHouse />, path: "/admin" },
    { icon: <LuUsers />, path: "/admin/students" },
    { icon: <LuBookOpen />, path: "/admin/classes" },
    { icon: <TbChartBar />, path: "/admin/analytics" },
  ];

  const dropdownItems = [
    {
      label: "Profil",
      icon: <LuUsers />,
      onClick: () => router.push("/admin/profile"),
    },
    {
      label: "Logout",
      icon: <LuLogOut />,
      onClick: handleLogout,
    },
  ];

  return (
    <div className={styles.dashboardLayout}>
      <aside
        className={`
          ${styles.sidebar}
        `}
      >
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
                  ${pathname === menu.path || (pathname.includes(menu.path) && menu.path !== "/admin") ? styles.activeMenu : ""}
                `}
              >
                <div
                  className={styles.menu}
                  title={menu.path.split("/").pop() || "Dashboard"}
                >
                  {menu.icon}
                </div>
              </Link>
            ))}
          </div>
        </div>
            {/* {JSON.stringify(user)} */}

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

export default DashboardLayout;
