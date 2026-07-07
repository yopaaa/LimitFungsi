import { list, put, del } from "@vercel/blob";

// GET: Mengambil daftar berkas gambar yang terkait dengan materialId tertentu dari Vercel Blob
export const GET = async (req) => {
  try {
    const { searchParams } = new URL(req.url);
    const materialId = searchParams.get("materialId");

    if (!materialId) {
      return Response.json({ error: "materialId is required" }, { status: 400 });
    }

    // Melakukan list data blobs berdasarkan prefix folder materialId
    const { blobs } = await list({
      prefix: `materials/${materialId}/`,
    });

    return Response.json({ success: true, blobs });
  } catch (error) {
    console.error("GET Blob Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
};

// POST: Mengunggah berkas gambar baru ke Vercel Blob
export const POST = async (req) => {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const materialId = formData.get("materialId");
    const folder = formData.get("folder");

    // Support folder generik ATAU materialId (backward compatible)
    const prefix = folder || (materialId ? `materials/${materialId}` : null);

    if (!file || !prefix) {
      return Response.json({ error: "file and (folder or materialId) are required" }, { status: 400 });
    }

    // Dapatkan nama unik dengan timestamp
    const filename = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
    const blobPath = `${prefix}/${filename}`;

    // Upload berkas menggunakan put() ke Vercel Blob
    const blob = await put(blobPath, file, {
      access: "public",
    });

    return Response.json({ success: true, blob });
  } catch (error) {
    console.error("POST Blob Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
};

// DELETE: Menghapus berkas dari Vercel Blob berdasarkan URL yang diberikan
export const DELETE = async (req) => {
  try {
    const { url } = await req.json();

    if (!url) {
      return Response.json({ error: "url is required" }, { status: 400 });
    }

    // Hapus berkas menggunakan del() dari Vercel Blob
    await del(url);

    return Response.json({ success: true });
  } catch (error) {
    console.error("DELETE Blob Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
};
