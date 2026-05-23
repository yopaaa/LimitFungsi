"use client";

import React, { useState } from "react";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";
import { pb,  } from "@/utils/db";

export default function SignupPage() {
    const router = useRouter();
    const [registerData, setRegisterData] = useState({
        nama: "",
        email: "",
        nomor: "",
        instansi: "",
        password: "",
        confirmPassword: "",
    });

    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);
    const validatePhone = (nomor) => /^08[0-9]{8,11}$/.test(nomor);
    const validatePassword = (password) => password.length >= 8;

    const handleRegister = async (e) => {
        e.preventDefault();
        setErrors({});
        setIsLoading(true);

        const newErrors = {};
        if (!registerData.nama) newErrors.nama = "Nama lengkap harus diisi";
        if (!registerData.email)
            newErrors.email = "Email harus diisi";
        else if (!validateEmail(registerData.email))
            newErrors.email = "Format email tidak valid";

        if (!registerData.nomor)
            newErrors.nomor = "Nomor telepon harus diisi";
        else if (!validatePhone(registerData.nomor))
            newErrors.nomor = "Format nomor telepon tidak valid (contoh: 08123456789)";

        if (!registerData.instansi)
            newErrors.instansi = "Instansi harus diisi";

        if (!registerData.password)
            newErrors.password = "Password harus diisi";
        else if (!validatePassword(registerData.password))
            newErrors.password = "Password minimal 8 karakter";

        if (!registerData.confirmPassword)
            newErrors.confirmPassword = "Konfirmasi password harus diisi";
        else if (registerData.password !== registerData.confirmPassword)
            newErrors.confirmPassword = "Password tidak cocok";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setIsLoading(false);
            return;
        }

        try {
            // Mendaftar langsung menggunakan SDK PocketBase
            await pb.collection('limit_users').create({
                nama: registerData.nama,
                email: registerData.email,
                nomor: registerData.nomor,
                instansi: registerData.instansi,
                password: registerData.password,
                passwordConfirm: registerData.confirmPassword,
                role: "admin", // Default role
            });

            setSuccessMessage("Pendaftaran berhasil! Silakan login.");
            setIsLoading(false);
            router.push("/auth/login");
        } catch (error) {
            console.error("Register error:", error);
            const message = error.response?.message || "Pendaftaran gagal! Silakan coba lagi.";
            setErrors({ api: message });
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <h2 className={styles.title}>Daftar Akun Baru</h2>

                {successMessage && <p className={styles.success}>{successMessage}</p>}
                {errors.api && <p className={styles.error}>{errors.api}</p>}

                <form onSubmit={handleRegister} className={styles.form}>
                    <input
                        className={styles.input}
                        placeholder="Nama Lengkap"
                        value={registerData.nama}
                        onChange={(e) =>
                            setRegisterData({ ...registerData, nama: e.target.value })
                        }
                    />
                    {errors.nama && <p className={styles.error}>{errors.nama}</p>}

                    <input
                        className={styles.input}
                        placeholder="Email"
                        value={registerData.email}
                        onChange={(e) =>
                            setRegisterData({ ...registerData, email: e.target.value })
                        }
                    />
                    {errors.email && <p className={styles.error}>{errors.email}</p>}

                    <input
                        className={styles.input}
                        placeholder="Nomor Telepon"
                        value={registerData.nomor}
                        onChange={(e) =>
                            setRegisterData({ ...registerData, nomor: e.target.value })
                        }
                    />
                    {errors.nomor && <p className={styles.error}>{errors.nomor}</p>}

                    <input
                        className={styles.input}
                        placeholder="Instansi"
                        value={registerData.instansi}
                        onChange={(e) =>
                            setRegisterData({ ...registerData, instansi: e.target.value })
                        }
                    />
                    {errors.instansi && <p className={styles.error}>{errors.instansi}</p>}

                    <input
                        className={styles.input}
                        type="password"
                        placeholder="Password"
                        value={registerData.password}
                        onChange={(e) =>
                            setRegisterData({ ...registerData, password: e.target.value })
                        }
                    />
                    {errors.password && <p className={styles.error}>{errors.password}</p>}

                    <input
                        className={styles.input}
                        type="password"
                        placeholder="Konfirmasi Password"
                        value={registerData.confirmPassword}
                        onChange={(e) =>
                            setRegisterData({
                                ...registerData,
                                confirmPassword: e.target.value,
                            })
                        }
                    />
                    {errors.confirmPassword && (
                        <p className={styles.error}>{errors.confirmPassword}</p>
                    )}

                    <button type="submit" className={styles.button} disabled={isLoading}>
                        {isLoading ? "Mendaftar..." : "Daftar"}
                    </button>
                </form>

                <p className={styles.linkText}>
                    Sudah punya akun?{" "}
                    <a href="/auth/login" className={styles.link}>
                        Login di sini
                    </a>
                </p>
            </div>
        </div>
    );
}
