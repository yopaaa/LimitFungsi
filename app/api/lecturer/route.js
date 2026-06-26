import { NextResponse } from "next/server";
import PocketBase from "pocketbase";

export const dynamic = "force-dynamic";

export const GET = async () => {
  const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || "http://localhost:8100";
  const pb = new PocketBase(pbUrl);

  try {
    const adminEmail = process.env.POCKETBASE_ADMIN_EMAIL;
    const adminPassword = process.env.POCKETBASE_ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      return NextResponse.json({ error: "Kredensial admin belum dikonfigurasi" }, { status: 500 });
    }

    // Autentikasi sebagai admin untuk membaca data bypass API Rules
    await pb.admins.authWithPassword(adminEmail, adminPassword);

    // Ambil detail dosen berdasarkan ID
    const user = await pb.collection("limit_users").getOne("gvkqsrsorgtx5aa");

    return NextResponse.json({
      id: user.id,
      nama: user.nama,
      instansi: user.instansi,
      profile: user.profile,
      role: user.role,
      email: user.email,
      collectionId: user.collectionId,
      collectionName: user.collectionName,
    });
  } catch (error) {
    console.error("Gagal mengambil data dosen via API:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};
