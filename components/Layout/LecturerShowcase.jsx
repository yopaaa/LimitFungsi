import PocketBase from "pocketbase";
import Image from "next/image";
import styles from "./LecturerShowcase.module.css";

const getLecturerData = async () => {
  const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || "http://localhost:8100";
  const pb = new PocketBase(pbUrl);

  try {
    const adminEmail = process.env.POCKETBASE_ADMIN_EMAIL;
    const adminPassword = process.env.POCKETBASE_ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.warn("LecturerShowcase Server: Kredensial PocketBase admin belum dikonfigurasi");
      return null;
    }

    // Autentikasi sebagai admin untuk membaca data bypass API Rules
    await pb.admins.authWithPassword(adminEmail, adminPassword);

    // Ambil detail dosen berdasarkan ID
    const user = await pb.collection("limit_users").getOne("gvkqsrsorgtx5aa");

    return {
      id: user.id,
      nama: user.nama,
      instansi: user.instansi,
      profile: user.profile,
      role: user.role,
      email: user.email,
      collectionId: user.collectionId,
      collectionName: user.collectionName,
    };
  } catch (error) {
    console.error("LecturerShowcase Server: Gagal mengambil data dosen:", error.message);
    return null;
  }
};

const LecturerShowcase = async () => {
  const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || "http://localhost:8100";
  const lecturer = await getLecturerData();

  if (!lecturer) return null;

  const profileUrl = lecturer.profile
    ? `${pbUrl}/api/files/${lecturer.collectionName || "users"}/${lecturer.id}/${lecturer.profile}`
    : null;

  return (
    <section className={styles.lecturerSection} id="dosen">
      <div className={styles.sectionInner}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionNumber}>01</span>
          <h2 className={styles.sectionTitle}>DOSEN PENGAMPU</h2>
        </div>

        <div className={styles.cardContainer}>
          <div className={styles.lecturerCard}>
            <div className={styles.cardBorderTop} />
            <div className={styles.avatarContainer}>
              {profileUrl ? (
                <Image
                  src={profileUrl}
                  alt={lecturer.nama}
                  className={styles.avatarImg}
                  width={150}
                  height={150}
                  priority
                />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  {lecturer.nama?.charAt(0).toUpperCase() || "D"}
                </div>
              )}
            </div>
            <h3 className={styles.lecturerName}>{lecturer.nama}</h3>
            <p className={styles.lecturerInstansi}>{lecturer.instansi || "Polman Babel"}</p>
            <p className={styles.lecturerEmail}>{lecturer.email}</p>
            <span className={styles.roleBadge}>Dosen Pengampu</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LecturerShowcase;
