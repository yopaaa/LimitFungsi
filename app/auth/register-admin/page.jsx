"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import InputField from "@/components/UI/InputField";
import Button from "@/components/UI/Button";
import { pb } from "@/utils/db";
import styles from "./page.module.css";

export default function RegisterForm() {
  const router = useRouter();

  useEffect(() => {
    if (pb.authStore.isValid && pb.authStore.model) {
      if (pb.authStore.model.role === "admin") {
        router.replace("/admin");
      } else {
        router.replace("/user");
      }
    }
  }, [router]);

  const [step, setStep] = useState(1); // Tracker halaman: Step 1 atau Step 2

  const [registerData, setRegisterData] = useState({
    nama: "",
    email: "",
    nomor: "",
    instansi: "",
    password: "",
    confirmPassword: "",
    agreePolicy: false,
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Fungsi Validasi Regex
  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);
  const validatePhone = (nomor) => /^08[0-9]{8,11}$/.test(nomor);
  const validatePassword = (password) => password.length >= 8;

  const randomCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const [classCode, setClassCode] = useState("");

  React.useEffect(() => {
    setClassCode(randomCode());
  }, []);
  
  // Handler untuk validasi Step 1 (Data Diri) sebelum masuk ke Step 2
  const handleNextStep = (e) => {
    e.preventDefault();
    const step1Errors = {};

    if (!registerData.nama) step1Errors.nama = "Nama lengkap harus diisi";
    if (!registerData.email) {
      step1Errors.email = "Email harus diisi";
    } else if (!validateEmail(registerData.email)) {
      step1Errors.email = "Format email tidak valid";
    }

    if (!registerData.nomor) {
      step1Errors.nomor = "Nomor telepon harus diisi";
    } else if (!validatePhone(registerData.nomor)) {
      step1Errors.nomor = "Format salah (contoh: 08123456789)";
    }

    if (!registerData.instansi) step1Errors.instansi = "Instansi harus diisi";

    if (Object.keys(step1Errors).length > 0) {
      setErrors(step1Errors);
      return;
    }

    setErrors({}); // Bersihkan error jika valid
    setStep(2); // Pindah ke step password
  };

  // Handler submit akhir ke PocketBase (Step 2)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    const step2Errors = {};

    if (!registerData.password) {
      step2Errors.password = "Password harus diisi";
    } else if (!validatePassword(registerData.password)) {
      step2Errors.password = "Password minimal 8 karakter";
    }

    if (!registerData.confirmPassword) {
      step2Errors.confirmPassword = "Konfirmasi password harus diisi";
    } else if (registerData.password !== registerData.confirmPassword) {
      step2Errors.confirmPassword = "Password tidak cocok";
    }

    if (!registerData.agreePolicy) {
      step2Errors.agreePolicy = "Anda harus menyetujui syarat dan ketentuan";
    }

    if (Object.keys(step2Errors).length > 0) {
      setErrors(step2Errors);
      setIsLoading(false);
      return;
    }

    try {
      await pb.collection("limit_users").create({
        nama: registerData.nama,
        email: registerData.email,
        nomor: registerData.nomor,
        instansi: registerData.instansi,
        password: registerData.password,
        passwordConfirm: registerData.confirmPassword,
        role: "admin", // Set role sebagai "admin" untuk pendaftaran admin
        classCode: classCode, // Simpan kode kelas yang dihasilkan untuk admin baru
        emailVisibility: true,
      });

      setSuccessMessage("Pendaftaran berhasil! Mengalihkan...");
      setIsLoading(false);
      setTimeout(() => {
        router.push("/auth/login");
      }, 1500);
    } catch (error) {
      console.error("Register error:", error);
      const message =
        error.response?.message || "Pendaftaran gagal! Silakan coba lagi.";
      setErrors({ api: message });
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h1 className={styles.title}>Daftar Sebagai Pengajar</h1>
      </div>

      {successMessage && (
        <div className={styles.successBlock}>{successMessage}</div>
      )}
      {errors.api && <div className={styles.errorBlock}>{errors.api}</div>}

      {step === 1 ? (
        /* ================= TAHAP 1: DATA DIRI ================= */
        <form onSubmit={handleNextStep} className={styles.formSpace}>
          <InputField
            label="Nama Lengkap"
            id="nama"
            placeholder="John Doe"
            value={registerData.nama}
            error={errors.nama}
            onChange={(e) =>
              setRegisterData({ ...registerData, nama: e.target.value })
            }
          />
          <InputField
            label="Email"
            id="email"
            type="email"
            placeholder="john@example.com"
            value={registerData.email}
            error={errors.email}
            onChange={(e) =>
              setRegisterData({ ...registerData, email: e.target.value })
            }
          />
          <InputField
            label="Nomor Telepon"
            id="nomor"
            type="tel"
            placeholder="0812345678..."
            value={registerData.nomor}
            error={errors.nomor}
            onChange={(e) =>
              setRegisterData({ ...registerData, nomor: e.target.value })
            }
          />
          <InputField
            label="Instansi"
            id="instansi"
            placeholder="Perusahaan / Kampus Inc."
            value={registerData.instansi}
            error={errors.instansi}
            onChange={(e) =>
              setRegisterData({ ...registerData, instansi: e.target.value })
            }
          />

          <div className={styles.actionWrapper}>
            <Button type="submit" variant="primary" fullWidth>
              Next
            </Button>
          </div>
        </form>
      ) : (
        /* ================= TAHAP 2: PASSWORD & POLICY ================= */
        <form onSubmit={handleSubmit} className={styles.formSpace}>
          <InputField
            label="Password"
            id="password"
            type="password"
            placeholder="••••••••"
            value={registerData.password}
            error={errors.password}
            onChange={(e) =>
              setRegisterData({ ...registerData, password: e.target.value })
            }
          />
          <InputField
            label="Konfirmasi Password"
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            value={registerData.confirmPassword}
            error={errors.confirmPassword}
            onChange={(e) =>
              setRegisterData({
                ...registerData,
                confirmPassword: e.target.value,
              })
            }
          />

          {/* Checkbox Kebijakan (Policy) */}
          <div className={styles.policyContainer}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={registerData.agreePolicy}
                onChange={(e) =>
                  setRegisterData({
                    ...registerData,
                    agreePolicy: e.target.checked,
                  })
                }
              />
              <span className={styles.policyText}>
                Saya menerima{" "}
                <a href="#" className={styles.policyLink}>
                  Syarat & Ketentuan
                </a>{" "}
                serta Kebijakan Privasi yang berlaku.
              </span>
            </label>
            {errors.agreePolicy && (
              <p className={styles.errorText}>{errors.agreePolicy}</p>
            )}
          </div>

          <div className={styles.actionButtonGroup}>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setStep(1)}
            >
              Kembali
            </Button>
            <Button type="submit" variant="primary" disabled={isLoading}>
              {isLoading ? "Mendaftar..." : "Daftar"}
            </Button>
          </div>
        </form>
      )}

      <div className={styles.footerLink}>
        <p>
          Sudah punya akun?{" "}
          <a href="/auth/login" className={styles.link}>
            Login di sini
          </a>
        </p>
      </div>
    </div>
  );
}
