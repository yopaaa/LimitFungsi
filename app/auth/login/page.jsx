"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { FiRefreshCw, FiCheck, FiShield } from "react-icons/fi";
import InputField from "@/components/UI/InputField";
import Button from "@/components/UI/Button";
import { pb } from "@/utils/db";
import styles from "./page.module.css";

const generateCaptchaText = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let text = "";
  for (let i = 0; i < 5; i++) {
    text += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return text;
};

const drawCaptcha = (canvas, text) => {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  grad.addColorStop(0, "#f3f4f6");
  grad.addColorStop(1, "#e5e7eb");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 5; i++) {
    ctx.strokeStyle = `rgba(${Math.floor(Math.random() * 150)}, ${Math.floor(Math.random() * 150)}, ${Math.floor(Math.random() * 150)}, 0.5)`;
    ctx.lineWidth = 1.5 + Math.random() * 1.5;
    ctx.beginPath();
    ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
    ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
    ctx.stroke();
  }

  for (let i = 0; i < 30; i++) {
    ctx.fillStyle = `rgba(${Math.floor(Math.random() * 200)}, ${Math.floor(Math.random() * 200)}, ${Math.floor(Math.random() * 200)}, 0.6)`;
    ctx.beginPath();
    ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 1 + Math.random() * 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.textBaseline = "middle";
  ctx.font = "bold 24px monospace";

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    ctx.fillStyle = `rgb(${Math.floor(Math.random() * 100)}, ${Math.floor(Math.random() * 100)}, ${Math.floor(Math.random() * 100)})`;
    
    ctx.save();
    const x = 20 + i * 23 + (Math.random() * 6 - 3);
    const y = canvas.height / 2 + (Math.random() * 8 - 4);
    const angle = (Math.random() * 30 - 15) * Math.PI / 180;
    
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillText(char, -8, 0);
    ctx.restore();
  }
};

export default function LoginForm() {
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

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
    isNotRobot: false,
  });

  const canvasRef = useRef(null);
  const [captchaCode, setCaptchaCode] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [showCaptchaChallenge, setShowCaptchaChallenge] = useState(false);
  const [isCaptchaLoading, setIsCaptchaLoading] = useState(false);
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  const [captchaErrorMsg, setCaptchaErrorMsg] = useState("");

  const handleCaptchaCheckboxClick = () => {
    if (isCaptchaVerified || isCaptchaLoading) return;
    
    setIsCaptchaLoading(true);
    setTimeout(() => {
      setIsCaptchaLoading(false);
      const code = generateCaptchaText();
      setCaptchaCode(code);
      setShowCaptchaChallenge(true);
    }, 800);
  };

  const handleRefreshCaptcha = () => {
    const code = generateCaptchaText();
    setCaptchaCode(code);
    setCaptchaInput("");
    setCaptchaErrorMsg("");
  };

  const handleVerifyCaptcha = (e) => {
    e.preventDefault();
    if (captchaInput.trim().toUpperCase() === captchaCode) {
      setIsCaptchaVerified(true);
      setShowCaptchaChallenge(false);
      setLoginData((prev) => ({ ...prev, isNotRobot: true }));
      setErrors((prev) => {
        const { isNotRobot, ...rest } = prev;
        return rest;
      });
      setCaptchaErrorMsg("");
    } else {
      setCaptchaErrorMsg("Kode salah! Coba lagi.");
      handleRefreshCaptcha();
    }
  };

  const handleCaptchaInputKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleVerifyCaptcha(e);
    }
  };

  useEffect(() => {
    if (showCaptchaChallenge && canvasRef.current && captchaCode) {
      drawCaptcha(canvasRef.current, captchaCode);
    }
  }, [showCaptchaChallenge, captchaCode]);

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

    if (!loginData.isNotRobot) {
      newErrors.isNotRobot = "Verifikasi bahwa Anda bukan robot";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
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

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrors({});
    try {
      const authData = await pb.collection("limit_users").authWithOAuth2({
        provider: "google",
      });

      setSuccessMessage("Login Google berhasil! Mengarahkan...");
      localStorage.setItem("userInfo", JSON.stringify(authData.record));

      setTimeout(() => {
        if (authData.record.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/user");
        }
      }, 1200);
    } catch (error) {
      console.error("Google Login error:", error);
      setErrors({ api: "Gagal login dengan Google. Coba lagi." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h1 className={styles.title}>Login ke Akun</h1>
        <p className={styles.subtitle}>Selamat datang kembali di Kalkulus.</p>
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

        {/* Custom CAPTCHA Widget */}
        <div
          className={`${styles.captchaWidget} ${
            errors.isNotRobot ? styles.captchaWidgetError : ""
          }`}
        >
          <div className={styles.captchaLeft} onClick={handleCaptchaCheckboxClick}>
            <div className={styles.captchaCheckboxWrapper}>
              {isCaptchaLoading ? (
                <div className={styles.captchaSpinner} />
              ) : (
                <div
                  className={styles.captchaCheckbox}
                  style={{
                    backgroundColor: isCaptchaVerified ? "#00875a" : "#ffffff",
                    borderColor: "#000000",
                  }}
                >
                  {isCaptchaVerified && <FiCheck className={styles.checkmarkIcon} />}
                </div>
              )}
            </div>
            <span className={styles.captchaLabel}>Saya bukan robot</span>
          </div>
          <div className={styles.captchaRight}>
            <FiShield className={styles.captchaLogoIcon} />
            <span className={styles.captchaLogoText}>SECURITY</span>
          </div>
        </div>

        {/* Captcha Challenge Box */}
        {showCaptchaChallenge && (
          <div className={styles.challengeBox}>
            <p className={styles.challengeTitle}>Masukkan kode keamanan:</p>
            <div className={styles.captchaCanvasWrapper}>
              <canvas
                ref={canvasRef}
                width={150}
                height={50}
                className={styles.captchaCanvas}
              />
              <button
                type="button"
                className={styles.refreshButton}
                onClick={handleRefreshCaptcha}
                title="Muat ulang kode"
              >
                <FiRefreshCw />
              </button>
            </div>
            <div className={styles.challengeInputWrapper}>
              <input
                type="text"
                placeholder="Ketik kode"
                className={styles.captchaInput}
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
                onKeyDown={handleCaptchaInputKeyDown}
                maxLength={5}
                autoFocus
              />
              <button
                type="button"
                className={styles.verifyBtn}
                onClick={handleVerifyCaptcha}
              >
                Verifikasi
              </button>
            </div>
            {captchaErrorMsg && <p className={styles.errorText}>{captchaErrorMsg}</p>}
          </div>
        )}
        {errors.isNotRobot && <p className={styles.errorText}>{errors.isNotRobot}</p>}

        <div className={styles.actionWrapper}>
          <Button type="submit" variant="primary" fullWidth disabled={isLoading}>
            {isLoading ? "Memproses..." : "Login"}
          </Button>
        </div>
      </form>

      {/* <div className={styles.divider}>atau</div>

      <button
        type="button"
        className={styles.googleBtn}
        onClick={handleGoogleLogin}
        disabled={isLoading}
      >
        <FcGoogle size={24} />
        Login dengan Google
      </button> */}

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
