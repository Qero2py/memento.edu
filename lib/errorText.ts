// Text for error pages. Kept separate from i18n.ts: [English, Indonesian] pairs.
export type L = "en" | "id";
const E = {
  "404.title": ["We couldn't find that page", "Halaman itu tidak ditemukan"],
  "404.body": ["The link may be broken, or the page may have moved.", "Tautannya mungkin rusak, atau halamannya sudah dipindahkan."],
  "course.title": ["Course not found", "Mata kuliah tidak ditemukan"],
  "course.body": ["The course code may be wrong, or you may not be enrolled in this course.", "Kode mata kuliah mungkin salah, atau kamu belum terdaftar di mata kuliah ini."],
  "500.title": ["Something went wrong on our side", "Terjadi masalah di sisi kami"],
  "500.body": ["Please try again in a moment. If it keeps happening, share the reference below with your group or lecturer.", "Silakan coba lagi sebentar lagi. Jika terus terjadi, bagikan kode referensi di bawah kepada kelompok atau dosenmu."],
  session: ["Your session has expired. Please log in again.", "Sesimu telah berakhir. Silakan masuk lagi."],
  retry: ["Try again", "Coba lagi"],
  ref: ["Reference", "Referensi"],
  home: ["Back to home", "Kembali ke beranda"],
  dashboard: ["Back to dashboard", "Kembali ke dasbor"],
  courses: ["My courses", "Mata kuliahku"],
  login: ["Log in", "Masuk"],
  loading: ["Loading…", "Memuat…"],
} as const;
export type EKey = keyof typeof E;
export const et = (l: L, k: EKey) => E[k][l === "id" ? 1 : 0];
export const localeFromPath = (p: string | null): L => ((p ?? "").startsWith("/id") ? "id" : "en");
