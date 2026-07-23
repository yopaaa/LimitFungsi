import PocketBase from "pocketbase";
import StudentsShowcaseClient from "./StudentsShowcaseClient";

const getStudentsData = async () => {
  const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || "http://localhost:8100";
  const pb = new PocketBase(pbUrl);

  try {
    const adminEmail = process.env.POCKETBASE_ADMIN_EMAIL;
    const adminPassword = process.env.POCKETBASE_ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.warn("StudentsShowcase Server: Kredensial PocketBase admin belum dikonfigurasi");
      return [];
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

    return Object.values(uniqueStudentsMap);
  } catch (error) {
    console.error("StudentsShowcase Server: Gagal mengambil data mahasiswa:", error.message);
    return [];
  }
};

const StudentsShowcase = async () => {
  const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || "http://localhost:8100";
  const students = await getStudentsData();

  return <StudentsShowcaseClient students={students} pbUrl={pbUrl} />;
};

export default StudentsShowcase;
