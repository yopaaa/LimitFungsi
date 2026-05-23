import PocketBase from 'pocketbase';

const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090';

// Inisialisasi PocketBase
export const pb = new PocketBase(pbUrl);

// Sinkronisasi AuthStore dengan Cookie (agar bisa dibaca oleh Middleware)
if (typeof document !== 'undefined') {
  pb.authStore.onChange(() => {
    document.cookie = pb.authStore.exportToCookie({ httpOnly: false });
  });
}

/**
 * Helper untuk mendapatkan admin client (hanya untuk server-side)
 */
export const getAdminClient = async () => {
  const adminEmail = process.env.POCKETBASE_ADMIN_EMAIL;
  const adminPassword = process.env.POCKETBASE_ADMIN_PASSWORD;
  
  if (adminEmail && adminPassword) {
    try {
      await pb.admins.authWithPassword(adminEmail, adminPassword);
    } catch (error) {
      console.error("Gagal autentikasi admin PocketBase:", error.message);
    }
  }
  return pb;
};

// Disable auto cancellation to avoid issues with Next.js fast refresh or multiple requests
pb.autoCancellation(false);
