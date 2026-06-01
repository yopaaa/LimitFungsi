import { NextResponse } from "next/server";
import axios from "axios";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_ENDPOINT = process.env.GEMINI_ENDPOINT;

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
    }

    // Konversi file ke base64
    const buffer = await file.arrayBuffer();
    const base64Data = Buffer.from(buffer).toString("base64");
    const mimeType = file.type;

    const requestPayload = {
      contents: [
        {
          parts: [
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Data,
              },
            },
            {
              text: "Ekstrak soal dan kunci jawaban dari file ini ke dalam format Markdown yang rapi.",
            },
          ],
        },
      ],
    };

    const response = await axios.post(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, requestPayload, {
      headers: { "Content-Type": "application/json" },
    });

    if (!response.data.candidates || response.data.candidates.length === 0) {
      throw new Error("Tidak ada respon dari Gemini");
    }

    const textPart = response.data.candidates[0].content.parts[0].text.trim();

    return NextResponse.json({ markdown: textPart });
  } catch (error) {
    console.error("Gemini API Error:", error.response?.data || error.message);
    return NextResponse.json(
      { error: "Terjadi kesalahan memanggil Gemini API." },
      { status: 500 }
    );
  }
}
