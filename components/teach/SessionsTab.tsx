import { fmt, getT, pick, type Locale } from "@/lib/i18n";
import { ttAll } from "@/lib/teachText";
import { toDateInput, } from "@/lib/teach";
import { storageConfig, storageEnabled } from "@/lib/storage";
import { addSession, deleteMaterial, deleteSession, updateSession } from "@/lib/teach-actions";
import type { Row } from "@/lib/db";
import { Icon, kindIcon } from "@/components/ui";
import SubmitButton from "@/components/SubmitButton";
import ConfirmButton from "@/components/ConfirmButton";
import MaterialForm from "@/components/MaterialForm";
import { F, formGrid } from "./Fields";

export default function SessionsTab({ course, sessions, locale, path }: { course: Row; sessions: Row[]; locale: Locale; path: string }) {
  const L = ttAll(locale), t = getT(locale);
  const storage = { enabled: storageEnabled(), ...storageConfig };
  return (
    <div className="space-y-6">
      <details className="card" open={sessions.length === 0}>
        <summary className="flex items-center justify-between p-4 font-semibold">{L["s.add"]}<Icon name="chev" className="chev h-4 w-4 transition-transform" /></summary>
        <form action={addSession.bind(null, course.id, path)} className={`${formGrid} border-t border-line p-4`}>
          <F label={L["f.title.en"]} name="title_en" /><F label={L["f.title.id"]} name="title_id" />
          <F label={L["f.sum.en"]} name="summary_en" rows={2} /><F label={L["f.sum.id"]} name="summary_id" rows={2} />
          <F label={L["f.date"]} name="date" type="date" defaultValue={toDateInput(new Date().toISOString())} />
          <p className="text-xs text-ink-soft sm:col-span-2">{L["f.opt"]}</p>
          <div className="sm:col-span-2"><SubmitButton className="btn btn-primary btn-sm">{L["add"]}</SubmitButton></div>
        </form>
      </details>

      {sessions.length === 0 ? <p className="card p-6 text-ink-soft">{L["s.none"]}</p> : (
        <ul className="space-y-3">
          {sessions.map((s) => (
            <li key={s.id}>
              <details className="card">
                <summary className="flex items-center gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-ink-soft">{t("session.label", { n: s.num })} - {fmt(s.held_on, locale, { day: "numeric", month: "short", year: "numeric" })}</p>
                    <p className="font-serif text-xl leading-snug">{pick(s, "title", locale)}</p>
                  </div>
                  <span className="hidden text-xs text-ink-soft sm:inline">{s.materials.length} <Icon name="file" className="inline h-3.5 w-3.5" /></span>
                  <Icon name="chev" className="chev h-4 w-4 shrink-0 text-ink-soft transition-transform" />
                </summary>
                <div className="space-y-5 border-t border-line p-4">
                  <form action={updateSession.bind(null, s.id, path)} className={formGrid}>
                    <F label={L["f.title.en"]} name="title_en" defaultValue={s.title_en} /><F label={L["f.title.id"]} name="title_id" defaultValue={s.title_id} />
                    <F label={L["f.sum.en"]} name="summary_en" rows={2} defaultValue={s.summary_en} /><F label={L["f.sum.id"]} name="summary_id" rows={2} defaultValue={s.summary_id} />
                    <F label={L["f.date"]} name="date" type="date" defaultValue={toDateInput(s.held_on)} />
                    <div className="flex items-end"><SubmitButton className="btn btn-primary btn-sm">{L["save"]}</SubmitButton></div>
                  </form>

                  <div>
                    {s.materials.length === 0 ? <p className="text-sm text-ink-soft">{L["m.none"]}</p> : (
                      <ul className="divide-y divide-line rounded-xl border border-line">
                        {s.materials.map((m: Row) => (
                          <li key={m.id} className="flex items-center gap-3 p-3">
                            <Icon name={kindIcon(m.kind)} className="h-4 w-4 shrink-0 text-sage" />
                            <a href={m.url} target="_blank" rel="noreferrer" className="min-w-0 flex-1 truncate hover:underline">{pick(m, "title", locale)}</a>
                            <span className="hidden text-xs text-ink-soft sm:inline">{L[`kind.${m.kind}` as "kind.pdf"]}{m.storage_path ? " (file)" : ""}</span>
                            <form action={deleteMaterial.bind(null, m.id, path)}>
                              <ConfirmButton message={L["c.material"]} spinner={false} aria-label={L["delete"]} className="rounded-lg px-2 py-1 text-xs font-semibold text-warn hover:bg-warn/10">{L["delete"]}</ConfirmButton>
                            </form>
                          </li>
                        ))}
                      </ul>
                    )}
                    <MaterialForm sessionId={s.id} courseId={course.id} path={path} labels={L} storage={storage} />
                  </div>

                  <form action={deleteSession.bind(null, s.id, path)}>
                    <ConfirmButton message={L["c.session"]} className="btn btn-ghost btn-sm !text-warn">{L["delete"]}</ConfirmButton>
                  </form>
                </div>
              </details>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
