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
} from "react-icons/lu";
import { TbChartBar } from "react-icons/tb";
import DropdownMenu from "@/components/UI/DropdownMenu";
import { pb } from "@/utils/db";

const DashboardLayout = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [initialName, setInitialName] = useState("A");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (pb.authStore.model) {
      setInitialName(
        pb.authStore.model.username?.charAt(0).toUpperCase() || "A",
      );
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
              <div
                key={index}
                className={`
                  ${styles.borderMenu}
                  ${pathname === menu.path || (pathname.includes(menu.path) && menu.path !== "/admin") ? styles.activeMenu : ""}
                `}
              >
                <Link
                  href={menu.path}
                  className={styles.menu}
                  title={menu.path.split("/").pop() || "Dashboard"}
                >
                  {menu.icon}
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div
          className={styles.profileContainer}
          onMouseEnter={() => setIsDropdownOpen(true)}
        >
          <DropdownMenu items={dropdownItems} isOpen={isDropdownOpen} />
          <div className={styles.profile}>
            <h1 className={styles.profileLink}>{initialName}</h1>
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
