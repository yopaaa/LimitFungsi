/**
 * Utility untuk menyimpan dan membaca activity log admin dari cookie.
 * Menyimpan maksimal 20 aktivitas terakhir.
 */

const COOKIE_KEY = "admin_activity_log";
const MAX_ITEMS = 20;

/**
 * Ambil semua activity dari cookie
 * @returns {Array} list of activity objects
 */
export const getActivities = () => {
  if (typeof document === "undefined") return [];

  const raw = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${COOKIE_KEY}=`))
    ?.split("=")[1];

  if (!raw) return [];

  try {
    const parsed = JSON.parse(decodeURIComponent(raw));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

/**
 * Simpan activity baru ke cookie
 * @param {Object} activity - { type: 'quiz'|'task'|'video'|'material'|'class', action: 'create'|'update'|'delete', title: string }
 */
export const logActivity = ({ type, action, title }) => {
  const activities = getActivities();

  const newActivity = {
    id: Date.now(),
    type,
    action,
    title,
    timestamp: new Date().toISOString(),
  };

  const updated = [newActivity, ...activities].slice(0, MAX_ITEMS);

  document.cookie = `${COOKIE_KEY}=${encodeURIComponent(JSON.stringify(updated))}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 hari
};

/**
 * Hapus semua activity dari cookie
 */
export const clearActivities = () => {
  document.cookie = `${COOKIE_KEY}=; path=/; max-age=0`;
};
