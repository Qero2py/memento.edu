"use client";
import { useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { addMaterial, getUploadUrl } from "@/lib/teach-actions";
import SubmitButton from "./SubmitButton";

type Storage = { enabled: boolean; url: string; anon: string; bucket: string };

// Adds a material to a session: either a pasted link, or a file sent straight to Supabase Storage.
export default function MaterialForm({ sessionId, courseId, path, labels: L, storage }: {
  sessionId: number; courseId: number; path: string; labels: Record<string, string>; storage: Storage;
}) {
  const [mode, setMode] = useState<"link" | "file">("link");
  const [error, setError] = useState("");
  const ref = useRef<HTMLFormElement>(null);
  const msg = (key: string) => L[key] ?? L["e.up"];

  async function submit(fd: FormData) {
    setError("");
    if (mode === "file") {
      const file = fd.get("file");
      if (!(file instanceof File) || !file.size) return setError(msg("e.file"));
      const res = await getUploadUrl(courseId, file.name, file.size, path);
      if ("error" in res) return setError(msg(res.error));
      const sb = createClient(storage.url, storage.anon, { auth: { persistSession: false } });
      const { error: upErr } = await sb.storage.from(storage.bucket).uploadToSignedUrl(res.path, res.token, file);
      if (upErr) return setError(msg("e.up"));
      fd.set("storage_path", res.path);
    }
    fd.delete("file"); // the file itself never goes through our server
    if (mode === "file") fd.delete("url");
    const r = await addMaterial(sessionId, path, fd);
    if (r.error) return setError(msg(r.error));
    ref.current?.reset();
  }

  const tab = (m: "link" | "file", disabled = false) => (
    <button type="button" disabled={disabled} onClick={() => { setMode(m); setError(""); }} aria-pressed={mode === m}
      className={`rounded-full border px-3 py-1 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${mode === m ? "border-sage bg-sage-tint text-sage-deep" : "border-line text-ink-soft hover:border-ink"}`}>
      {m === "link" ? L["mode.link"] : L["mode.file"]}
    </button>
  );

  return (
    <form ref={ref} action={submit} className="mt-4 rounded-xl border border-dashed border-line p-4">
      <p className="mb-3 text-sm font-semibold">{L["m.add"]}</p>
      <div className="mb-3 flex flex-wrap gap-2">{tab("link")}{tab("file", !storage.enabled)}</div>
      {!storage.enabled && <p className="mb-3 text-xs text-ink-soft">{L["upload.off"]}</p>}
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block"><span className="mb-1 block text-xs font-medium text-ink-soft">{L["f.mtitle"]} (EN)</span><input name="title_en" className="input" /></label>
        <label className="block"><span className="mb-1 block text-xs font-medium text-ink-soft">{L["f.mtitle"]} (ID)</span><input name="title_id" className="input" /></label>
        <label className="block"><span className="mb-1 block text-xs font-medium text-ink-soft">{L["f.kind"]}</span>
          <select name="kind" className="input" defaultValue="slide">
            {(["slide", "pdf", "video", "link"] as const).map((k) => <option key={k} value={k}>{L[`kind.${k}`]}</option>)}
          </select>
        </label>
        {mode === "link" ? (
          <label className="block"><span className="mb-1 block text-xs font-medium text-ink-soft">{L["f.url"]}</span><input name="url" type="url" required placeholder="https://" className="input" /></label>
        ) : (
          <label className="block"><span className="mb-1 block text-xs font-medium text-ink-soft">{L["f.file"]}</span>
            <input name="file" type="file" required className="input file:mr-3 file:rounded-full file:border-0 file:bg-sage-tint file:px-3 file:py-1 file:text-sm file:font-semibold file:text-sage-deep" />
            <span className="mt-1 block text-xs text-ink-soft">{L["upload.hint"]}</span>
          </label>
        )}
      </div>
      {error && <p role="alert" className="mt-3 text-sm text-warn">{error}</p>}
      <SubmitButton className="btn btn-primary btn-sm mt-4">{L["add"]}</SubmitButton>
    </form>
  );
}
