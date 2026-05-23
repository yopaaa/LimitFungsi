"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import InputField from "@/components/UI/InputField";
import Button from "@/components/UI/Button";
import { pb } from "@/utils/db";
import styles from "./page.module.css";

export default function LoginForm() {
  const router = useRouter();
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
    isNotRobot: false, // State untuk checkbox robot
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

    // Validasi robot check
    if (!loginData.isNotRobot) {
      newErrors.isNotRobot = "Verifikasi bahwa Anda bukan robot";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      // Login langsung menggunakan SDK PocketBase
      const authData = await pb.collection("limit_users").authWithPassword(
        loginData.email,
        loginData.password
      );

      setSuccessMessage("Login berhasil! Mengarahkan...");
      setIsLoading(false);

      localStorage.setItem("userInfo", JSON.stringify(authData.record));

      setTimeout(() => {
        if (authData.record.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/user");
        }
      }, 1200);
    } catch (error) {
      console.error("Login error:", error);
      const message = error.response?.message || "Login gagal! Email atau password salah.";
      setErrors({ api: message });
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h1 className={styles.title}>Login ke Akun</h1>
        <p className={styles.subtitle}>Selamat datang kembali di LIMIT.</p>
      </div>

      {successMessage && <div className={styles.successBlock}>{successMessage}</div>}
      {errors.api && <div className={styles.errorBlock}>{errors.api}</div>}

      <form onSubmit={handleLogin} className={styles.formSpace}>
        <InputField
          label="Email"
          id="email"
          type="email"
          placeholder="john@example.com"
          value={loginData.email}
          error={errors.email}
          onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
        />

        <InputField
          label="Password"
          id="password"
          type="password"
          placeholder="••••••••"
          value={loginData.password}
          error={errors.password}
          onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
        />

        {/* Kotak Verifikasi "Saya bukan robot" */}
        <div className={`${styles.captchaContainer} ${errors.isNotRobot ? styles.captchaError : ''}`}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={loginData.isNotRobot}
              onChange={(e) => setLoginData({ ...loginData, isNotRobot: e.target.checked })}
            />
            <span className={styles.captchaText}>Saya bukan robot</span>
          </label>
          <div className={styles.captchaIcon}>
            <div className={styles.spinner}></div>
          </div>
        </div>
        {errors.isNotRobot && <p className={styles.errorText}>{errors.isNotRobot}</p>}

        <div className={styles.actionWrapper}>
          <Button type="submit" variant="primary" fullWidth disabled={isLoading}>
            {isLoading ? "Memproses..." : "Login"}
          </Button>
        </div>
      </form>

      <div className={styles.footerLink}>
        <p>
          Belum punya akun?{" "}
          <a href="/auth/register" className={styles.link}>
            Daftar di sini
          </a>
        </p>
      </div>
    </div>
  );
}