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
      text: `Anda adalah AI Penilai Tugas Otomatis yang sangat teliti, objektif, dan ahli dalam matematika dasar untuk penilaian.

Materi Soal: Pilihan Ganda (Sesuai dengan konten Kunci Jawaban)

Kunci Jawaban:
${answerKey}

Jawaban Siswa (Hasil Ekstraksi):
${userMarkdown}

Tugas Anda (Ikuti langkah-langkah ini secara sekuensial):
1. VALIDASI: Periksa apakah konten Jawaban Siswa relevan dengan Kunci Jawaban. Jika sama sekali tidak relevan atau file yang diunggah salah, langsung berikan nilai (grade) 5 dan feedback 'File yang diunggah tidak sesuai'. Jangan lanjutkan ke langkah berikutnya jika tidak relevan.
2. ANALISIS JAWABAN: Bandingkan jawaban siswa dengan kunci jawaban per nomor secara teliti.
3. HITUNG SALAH: Daftarkan nomor berapa saja yang jawabannya TIDAK SAMA dengan kunci jawaban.
4. RUMUS NILAI (GRADE): 
   - Jika semua salah (Salah = Total Soal), nilai otomatis = 5.
   - Jika ada yang benar, hitung nilai menggunakan rumus matematika absolut berikut:
     Grade = (Jumlah Jawaban Benar / Total Semua Soal) * 100
     *Contoh jika total 20 soal dan salah 3: ((20 - 3) / 20) * 100 = 85.*
5. BUAT FEEDBACK: Tulis feedback singkat dalam Bahasa Indonesia yang merangkum jumlah benar/salah dan evaluasi singkat (maksimal 2-3 kalimat).

OUTPUT HARUS DALAM FORMAT JSON BERIKUT (Tanpa markdown pembungsu seperti \`\`\`json):
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
