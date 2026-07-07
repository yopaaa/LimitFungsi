export const POST = async (req) => {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return Response.json({ error: "File berkas wajib dilampirkan" }, { status: 400 });
    }

    const fileType = file.type || "";
    const fileName = file.name || "";
    const isPdf = fileType === "application/pdf" || fileName.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      return Response.json({ 
        error: "Untuk ekstraksi langsung via Gemini API, harap gunakan berkas berformat PDF. Simpan dokumen Word Anda sebagai PDF terlebih dahulu." 
      }, { status: 400 });
    }

    // Ubah file dokumen ke buffer lalu ke format Base64 string
    const arrayBuffer = await file.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString("base64");

    const apiKey = process.env.GEMINI_API_KEY;
    const endpoint = process.env.GEMINI_ENDPOINT || "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
    const url = `${endpoint.split("?")[0]}?key=${apiKey}`;

    const promptText = `
Anda adalah asisten AI pembuat kuis kalkulus limit fungsi.
Tugas Anda adalah membaca berkas PDF soal yang dilampirkan, mengekstrak seluruh pertanyaan pilihan ganda yang ada, beserta pilihan jawaban (A, B, C, D) dan kunci jawaban yang benar.

Instruksi:
1. Analisis isi dokumen PDF ini dengan teliti. Temukan semua soal pilihan ganda di dalamnya.
2. Jika kunci jawaban tidak tertulis secara eksplisit di dokumen, pecahkan soal kalkulus tersebut secara mandiri untuk menentukan kunci jawaban yang paling tepat.
3. Kembalikan data hanya dalam format JSON yang valid sesuai dengan skema JSON berikut:
{
  "questions": [
    {
      "text": "Teks pertanyaan soal...",
      "options": ["Teks Pilihan A", "Teks Pilihan B", "Teks Pilihan C", "Teks Pilihan D"],
      "answer": "A", // Kunci jawaban yang benar (HANYA boleh bernilai satu karakter string kapital: "A", "B", "C", atau "D")
      "image": "",
      "optionImages": ["", "", "", ""]
    }
  ]
}

PENTING:
- Pilihan jawaban (options) harus selalu berjumlah tepat 4 item (A, B, C, D).
- Jangan sertakan penjelasan apa pun sebelum atau sesudah JSON. Kembalikan HANYA string JSON yang valid agar bisa langsung di-parse.
- Gunakan format notasi matematika yang rapi.
`;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: "application/pdf",
                data: base64Data
              }
            },
            {
              text: promptText
            }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: "application/json"
      }
    };

    const geminiRes = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error("Gemini API Error:", errText);
      throw new Error(`Gemini API Error: ${geminiRes.status} ${geminiRes.statusText}`);
    }

    const geminiData = await geminiRes.json();
    const jsonResponseString = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!jsonResponseString) {
      throw new Error("Gemini gagal menghasilkan respons kuis.");
    }

    // Parse JSON hasil ekstraksi dari Gemini
    const quizData = JSON.parse(jsonResponseString);

    // Validasi & regenerasi ID unik kuis agar React merender dengan benar
    if (quizData && Array.isArray(quizData.questions)) {
      quizData.questions = quizData.questions.map((q, idx) => ({
        ...q,
        id: `q-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 5)}`,
        image: q.image || "",
        optionImages: q.optionImages || ["", "", "", ""],
        options: Array.isArray(q.options) && q.options.length === 4 ? q.options : ["", "", "", ""]
      }));
    }

    return Response.json({ success: true, questions: quizData.questions || [] });

  } catch (error) {
    console.error("Error generate-quiz API:", error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
};
