import { NextResponse } from "next/server";
import { getAdminClient } from "@/utils/db";
import axios from "axios";

const GEMINI_API_KEY = process.env.GEMINI_API || process.env.GEMINI_API_KEY;
const GEMINI_ENDPOINT = process.env.GEMINI_ENDPOINT;

export async function POST(req) {
  try {
    const formData = await req.formData();
    const taskId = formData.get("task_id");
    const userId = formData.get("user_id");
    const note = formData.get("note");
    const file = formData.get("file");

    if (!taskId || !userId || !file) {
      return NextResponse.json(
        { error: "Data tugas, user, dan file wajib diisi." },
        { status: 400 }
      );
    }

    const pbAdmin = await getAdminClient();

    // 1. Cek duplikasi
    try {
      const existing = await pbAdmin.collection("limit_submissions").getFirstListItem(
        `task_id = "${taskId}" && user_id = "${userId}"`
      );
      if (existing) {
        return NextResponse.json(
          { error: "Anda sudah mengumpulkan tugas ini sebelumnya." },
          { status: 400 }
        );
      }
    } catch (err) {
      if (err.status !== 404) throw err;
    }

    // 2. Ambil Kunci Jawaban dari Tugas
    const task = await pbAdmin.collection("limit_tasks").getOne(taskId);
    const answerKey = task.answer || "";

    // 3. Ekstrak Jawaban Siswa dari File (Gemini)
    const buffer = await file.arrayBuffer();
    const base64Data = Buffer.from(buffer).toString("base64");
    const mimeType = file.type;

    const extractPayload = {
      contents: [{
        parts: [
          { inline_data: { mime_type: mimeType, data: base64Data } },
          { text: "Ekstrak jawaban dari file ini ke dalam format Markdown yang sangat detail. Abaikan instruksi soal jika ada, fokus pada jawaban yang diberikan oleh pengirim." }
        ]
      }]
    };

    const extractRes = await axios.post(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, extractPayload);
    const userMarkdown = extractRes.data.candidates[0].content.parts[0].text.trim();

    // 4. Bandingkan dengan Kunci Jawaban (Gemini)
    const comparePayload = {
      contents: [{
        parts: [{
          text: `Anda adalah asisten penilai tugas kalkulus (limit fungsi) dan graph.
          
Kunci Jawaban:
${answerKey}

Jawaban Siswa (Hasil Ekstraksi):
${userMarkdown}

Tugas Anda:
1. Bandingkan jawaban siswa dengan kunci jawaban.
2. Jika jawaban tidak relevan sama sekali dengan materi atau file yang diupload bukan jawaban tugas, berikan nilai 5 dan feedback 'File yang diunggah tidak sesuai'.
3. Jika relevan, berikan nilai antara 0-100 berdasarkan ketepatan langkah dan hasil akhir.
4. Berikan feedback singkat (maksimal 2 kalimat) dalam Bahasa Indonesia.

OUTPUT HARUS DALAM FORMAT JSON BERIKUT:
{
  "grade": number,
  "feedback": "string"
}`
        }]
      }],
      generationConfig: { response_mime_type: "application/json" }
    };

    const compareRes = await axios.post(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, comparePayload);
    const evaluation = JSON.parse(compareRes.data.candidates[0].content.parts[0].text);

    // 5. Simpan ke PocketBase
    // Menambahkan field answer, grade, dan feedback sesuai permintaan
    const submissionData = new FormData();
    submissionData.append("task_id", taskId);
    submissionData.append("user_id", userId);
    submissionData.append("file", file);
    submissionData.append("note", note);
    submissionData.append("answer", userMarkdown);
    submissionData.append("grade", evaluation.grade);
    submissionData.append("feedback", evaluation.feedback);

    const newSubmission = await pbAdmin.collection("limit_submissions").create(submissionData);

    return NextResponse.json({
      success: true,
      message: "Tugas berhasil dinilai dan dikirim!",
      data: newSubmission,
    });

  } catch (error) {
    console.error("Submission/AI Error:", error.response?.data || error.message);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memproses penilaian AI: " + (error.response?.data?.error?.message || error.message) },
      { status: 500 }
    );
  }
}
