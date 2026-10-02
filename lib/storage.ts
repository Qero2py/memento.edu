import { createClient } from "@supabase/supabase-js";

// File uploads use Supabase Storage. They are optional: without these variables, lecturers paste links instead.
export const BUCKET = process.env.SUPABASE_BUCKET || "materials";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const storageConfig = { url: url ?? "", anon: anon ?? "", bucket: BUCKET };
export const storageEnabled = () => !!(url && anon && service);
const admin = () => createClient(url!, service!, { auth: { persistSession: false } });

export const MAX_UPLOAD_MB = 50;
export const ALLOWED_EXT = ["pdf", "ppt", "pptx", "doc", "docx", "xls", "xlsx", "csv", "txt", "zip", "png", "jpg", "jpeg", "mp4", "mov"];

// A one-time URL the browser uploads to directly, so large files never pass through our server.
export async function signedUpload(path: string) {
  const { data, error } = await admin().storage.from(BUCKET).createSignedUploadUrl(path);
  if (error || !data) throw error ?? new Error("Could not create upload URL");
  return data; // { signedUrl, token, path }
}
export const publicUrl = (path: string) => admin().storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
export async function removeFiles(paths: string[]) {
  if (!storageEnabled() || !paths.length) return;
  try { await admin().storage.from(BUCKET).remove(paths); } catch { /* the database record is still removed */ }
}
export async function ensureBucket() {
  const { error } = await admin().storage.createBucket(BUCKET, { public: true, fileSizeLimit: `${MAX_UPLOAD_MB}MB` });
  if (error && !/already exists/i.test(error.message)) throw error;
}
