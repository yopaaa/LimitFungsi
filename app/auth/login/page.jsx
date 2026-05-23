"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { pb } from "@/utils/db";
import styles from "./page.module.css";

const LoginPage = () => {
  const router = useRouter();
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    const newErrors = {};
    if (!loginData.email) {
      newErrors.email = "Email harus diisi";
    } else if (!validateEmail(loginData.email)) {
      newErrors.email = "Format email tidak valid";
    }

    if (!loginData.password) {
      newErrors.password = "Password harus diisi";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      // Login langsung menggunakan SDK PocketBase
      const authData = await pb.collection('limit_users').authWithPassword(
        loginData.email,
        loginData.password
      );

      setSuccessMessage("Login berhasil! Mengarahkan ke dashboard...");
      setIsLoading(false);

      // Simpan user info ke localStorage (opsional, karena sudah ada di pb.authStore)
      localStorage.setItem('userInfo', JSON.stringify(authData.record));

      // Redirect berdasarkan role
      if (authData.record.role === 'admin') {
        router.push('/admin');
      } else {
        // Redirect ke dashboard user
        router.push('/user');
      }
    } catch (error) {
      console.error("Login error:", error);
      const message = error.response?.message || "Login gagal! Email atau password salah.";
      setErrors({ api: message });
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h2 className={styles.title}>Masuk ke Akun</h2>

        {successMessage && <p className={styles.success}>{successMessage}</p>}
        {errors.api && <p className={styles.error}>{errors.api}</p>}

        <form onSubmit={handleLogin} className={styles.form}>
          <input
            className={styles.input}
            placeholder="Email"
            value={loginData.email}
            onChange={(e) =>
              setLoginData({ ...loginData, email: e.target.value })
            }
          />
          {errors.email && <p className={styles.error}>{errors.email}</p>}

          <input
            className={styles.input}
            type="password"
            placeholder="Password"
            value={loginData.password}
            onChange={(e) =>
              setLoginData({ ...loginData, password: e.target.value })
            }
          />
          {errors.password && <p className={styles.error}>{errors.password}</p>}

          <button type="submit" className={styles.button} disabled={isLoading}>
            {isLoading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <p className={styles.linkText}>
          Belum punya akun?{" "}
          <a href="/auth/register" className={styles.link}>
            Daftar di sini
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
