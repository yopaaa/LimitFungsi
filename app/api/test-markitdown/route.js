import { exec } from "child_process";
import path from "path";
import fs from "fs/promises";
import { promisify } from "util";

const execPromise = promisify(exec);

// Endpoint GET untuk mengetes apakah binary markitdown dapat dieksekusi di server/Vercel
export const GET = async () => {
  try {
    const binaryPath = path.join(process.cwd(), "utils", "markitdown");
    const { stdout, stderr } = await execPromise(`"${binaryPath}" --help`);

    return Response.json({
      success: true,
      message: "Binary markitdown berhasil dieksekusi di server!",
      output: stdout,
      errorOutput: stderr || null,
    });
  } catch (error) {
    return Response.json({
      success: false,
      message: "Gagal mengeksekusi binary markitdown di server.",
      error: error.message,
    }, { status: 500 });
  }
};

export const POST = async (req) => {
  let tempFilePath = null;

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return Response.json(
        { success: false, error: "Harap lampirkan berkas dengan key 'file'." },
        { status: 400 }
      );
    }

    // Ubah file ke ArrayBuffer kemudian ke Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Ambil nama asli berkas dan tentukan lokasi penyimpanan sementara di /tmp
    const originalName = file.name || "temp_document";
    const tempDir = "/tmp";
    
    // Gunakan timestamp untuk memastikan nama berkas unik
    const uniqueFileName = `${Date.now()}_${originalName}`;
    tempFilePath = path.join(tempDir, uniqueFileName);

    // Tulis berkas sementara ke /tmp
    await fs.writeFile(tempFilePath, buffer);

    // Path absolut ke executable binary markitdown
    const binaryPath = path.join(process.cwd(), "utils", "markitdown");

    // Jalankan eksekusi biner markitdown
    const { stdout, stderr } = await execPromise(`"${binaryPath}" "${tempFilePath}"`);

    if (stderr && !stdout) {
      console.warn("Peringatan dari executable markitdown:", stderr);
    }

    // Kembalikan teks markdown hasil ekstraksi
    return Response.json({
      success: true,
      fileName: originalName,
      markdown: stdout,
    });

  } catch (error) {
    console.error("Error pada API test-markitdown:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  } finally {
    // Selalu hapus berkas sementara agar tidak membebani ruang penyimpanan /tmp
    if (tempFilePath) {
      try {
        await fs.unlink(tempFilePath);
      } catch (unlinkError) {
        console.error("Gagal menghapus berkas sementara:", unlinkError);
      }
    }
  }
};
