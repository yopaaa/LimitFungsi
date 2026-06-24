import { NextResponse } from "next/server";
import axios from "axios";
import { pb } from "@/utils/db";

const USER_API_URL = process.env.USER_API_URL || process.env.GEMINI_ENDPOINT;
const USER_API_KEY = process.env.USER_API_KEY || process.env.GEMINI_API || process.env.GEMINI_API_KEY;
const GEMINI_ENDPOINT = process.env.GEMINI_ENDPOINT;
const GEMINI_API_KEY = process.env.GEMINI_API || process.env.GEMINI_API_KEY;

export const GET = () => {
  return NextResponse.json({ message: "Chat API proxy is up" });
};

export async function POST(req) {
  try {
    // 1. Ambil token dari cookie 'pb_auth'
    const authCookie = req.cookies.get('pb_auth');
    
    if (!authCookie) {
      return NextResponse.json({ error: "Unauthorized: Silakan login terlebih dahulu" }, { status: 401 });
    }

    // 2. Load token ke store dan validasi menggunakan instance pb dari utils/db
    try {
      pb.authStore.loadFromCookie(`pb_auth=${authCookie.value}`);
      if (!pb.authStore.isValid) {
        throw new Error("Invalid token");
      }
    } catch (err) {
      return NextResponse.json({ error: "Unauthorized: Sesi tidak valid" }, { status: 401 });
    }

    const body = await req.json();

    // 4. Ambil data user untuk identitas
    const user = pb.authStore.model;
    const userName = user?.nama || "Siswa";
    const instansi = user?.instansi;

    // 5. Konversi riwayat pesan ke format Gemini
    let contents = [];
    if (body.messages && Array.isArray(body.messages)) {
      contents = body.messages.map(m => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }]
      }));
    } else {
      contents = [{
        role: "user",
        parts: [{ text: typeof body === "string" ? body : (body.prompt || JSON.stringify(body)) }]
      }];
    }

    // Tambahkan instruksi sistem agar Gemini tahu siapa dia dan siapa user-nya
    let systemInstruction = `Nama kamu adalah Kalkulus Bot, asisten AI untuk aplikasi Kalkulus Interaktif. 
    Kamu sedang berbicara dengan ${userName} dari ${instansi || "Polman Babel"}. 
    Tugas utama kamu adalah membantu ${userName} belajar tentang matematika, khususnya materi Kalkulus (Limit, Turunan, Integral) dan Grafik Fungsi (Graph).
    Gunakan bahasa Indonesia yang ramah tapi kritis dalam memberikan penjelasan.
    Selalu panggil user dengan nama ${userName}.`;

    // Jika ada konteks materi tambahan dari client
    if (body.materialContext) {
      systemInstruction += `\n\nKONTEKS MATERI SAAT INI:
      Kamu harus menjawab pertanyaan user berdasarkan atau berkaitan dengan materi berikut:
      ---
      ${body.materialContext}
      ---`;
    }

    const requestPayload = {
      contents: contents,
      system_instruction: {
        parts: [{ text: systemInstruction }]
      }
    };

    if (!USER_API_URL) {
      return NextResponse.json({ error: "USER_API_URL is not configured" }, { status: 500 });
    }

    // If using Gemini endpoint
    if (GEMINI_ENDPOINT && USER_API_URL === GEMINI_ENDPOINT) {
      if (!GEMINI_API_KEY) {
        return NextResponse.json({ error: "GEMINI_API_KEY is not configured" }, { status: 500 });
      }

      const upstream = await axios.post(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, requestPayload, {
        headers: { "Content-Type": "application/json" }
      });

      return NextResponse.json(upstream.data, { status: upstream.status });
    }

    // Fallback: forward to USER_API_URL with optional Bearer auth
    const headers = { "Content-Type": "application/json" };
    if (USER_API_KEY) headers["Authorization"] = `Bearer ${USER_API_KEY}`;

    const upstream = await axios.post(USER_API_URL, requestPayload, { headers });

    return NextResponse.json(upstream.data, { status: upstream.status });
  } catch (error) {
    console.error("/api/chat error:", error.response?.data || error.message);
    const message = error.response?.data || { error: error.message || "Unknown error" };
    return NextResponse.json(message, { status: error.response?.status || 500 });
  }
}
