import { NextResponse } from "next/server";
import PocketBase from "pocketbase";

export const dynamic = "force-dynamic";

export async function GET() {
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

    const records = await pb.collection("limit_subscriptions").getFullList({
      filter: `class_id = "0wfobxnibqtaun5"`,
      expand: "user_id",
    });

    const students = records
      .map((r) => {
        const user = r.expand?.user_id;
        if (!user) return null;
        return {
          id: user.id,
          nama: user.nama,
          instansi: user.instansi,
          profile: user.profile,
          collectionId: user.collectionId,
          collectionName: user.collectionName,
        };
      })
      .filter(Boolean);

    // Hapus duplikat siswa
    const uniqueStudentsMap = {};
    students.forEach((s) => {
      uniqueStudentsMap[s.id] = s;
    });

    return NextResponse.json(Object.values(uniqueStudentsMap));
  } catch (error) {
    console.error("Gagal mengambil data mahasiswa via API:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
