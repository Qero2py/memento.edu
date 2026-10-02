import { fmt, pick, type Locale } from "@/lib/i18n";
import { tt, ttAll } from "@/lib/teachText";
import { toDateTimeInput } from "@/lib/teach";
import { addAssignment, deleteAssignment, gradeSubmission, updateAssignment } from "@/lib/teach-actions";
import type { Row } from "@/lib/db";
import { Icon } from "@/components/ui";
import SubmitButton from "@/components/SubmitButton";
import ConfirmButton from "@/components/ConfirmButton";
import { F, formGrid } from "./Fields";

const isUrl = (s: string) => /^https?:\/\/\S+$/i.test(s.trim());

export default function AssignmentsTab({ course, assignments, locale, path }: { course: Row; assignments: Row[]; locale: Locale; path: string }) {
  const L = ttAll(locale);
  const when = (iso: string) => fmt(iso, locale, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: false });
  return (
    <div className="space-y-6">
      <details className="card" open={assignments.length === 0}>
        <summary className="flex items-center justify-between p-4 font-semibold">{L["a.add"]}<Icon name="chev" className="chev h-4 w-4 transition-transform" /></summary>
        <form action={addAssignment.bind(null, course.id, path)} className={`${formGrid} border-t border-line p-4`}>
          <F label={L["f.title.en"]} name="title_en" /><F label={L["f.title.id"]} name="title_id" />
          <F label={L["f.desc.en"]} name="desc_en" rows={3} /><F label={L["f.desc.id"]} name="desc_id" rows={3} />
          <F label={L["f.due"]} name="due" type="datetime-local" required />
          <p className="text-xs text-ink-soft sm:col-span-2">{L["f.opt"]}</p>
          <div className="sm:col-span-2"><SubmitButton className="btn btn-primary btn-sm">{L["add"]}</SubmitButton></div>
        </form>
      </details>

      {assignments.length === 0 ? <p className="card p-6 text-ink-soft">{L["a.none"]}</p> : (
        <ul className="space-y-3">
          {assignments.map((a) => (
            <li key={a.id}>
              <details className="card">
                <summary className="flex items-center gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-serif text-xl leading-snug">{pick(a, "title", locale)}</p>
                    <p className="text-sm text-ink-soft">{tt(locale, "a.due", { date: when(a.due_at) })} - {tt(locale, "a.subs", { n: a.submissions.length, total: a.students })}</p>
                  </div>
                  <Icon name="chev" className="chev h-4 w-4 shrink-0 text-ink-soft transition-transform" />
                </summary>
                <div className="space-y-6 border-t border-line p-4">
                  <form action={updateAssignment.bind(null, a.id, path)} className={formGrid}>
                    <F label={L["f.title.en"]} name="title_en" defaultValue={a.title_en} /><F label={L["f.title.id"]} name="title_id" defaultValue={a.title_id} />
                    <F label={L["f.desc.en"]} name="desc_en" rows={3} defaultValue={a.desc_en} /><F label={L["f.desc.id"]} name="desc_id" rows={3} defaultValue={a.desc_id} />
                    <F label={L["f.due"]} name="due" type="datetime-local" required defaultValue={toDateTimeInput(a.due_at)} />
                    <div className="flex items-end"><SubmitButton className="btn btn-primary btn-sm">{L["save"]}</SubmitButton></div>
                  </form>

                  <section>
                    <h3 className="mb-3 text-sm font-semibold">{tt(locale, "a.subs", { n: a.submissions.length, total: a.students })}</h3>
                    {a.submissions.length === 0 ? <p className="text-sm text-ink-soft">{L["a.nosubs"]}</p> : (
                      <ul className="space-y-3">
                        {a.submissions.map((s: Row) => (
                          <li key={s.id} className="rounded-xl border border-line p-4">
                            <div className="flex flex-wrap items-baseline justify-between gap-2">
                              <p className="font-medium">{s.student}</p>
                              <p className="text-xs text-ink-soft">{tt(locale, "a.at", { date: when(s.submitted_at) })}</p>
                            </div>
                            <p className="mt-2 whitespace-pre-wrap break-words text-sm text-ink-soft">
                              {isUrl(s.content ?? "") ? <a href={s.content} target="_blank" rel="noreferrer" className="text-sage underline">{s.content}</a> : s.content}
                            </p>
                            <form action={gradeSubmission.bind(null, s.id, path)} className="mt-3 grid gap-3 sm:grid-cols-[110px_1fr_auto] sm:items-end">
                              <F label={L["g.grade"]} name="grade" type="number" min={0} max={100} defaultValue={s.grade} />
                              <F label={L["g.fb"]} name="feedback" defaultValue={s.feedback} />
                              <SubmitButton className="btn btn-primary btn-sm">{L["g.save"]}</SubmitButton>
                            </form>
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>

                  <form action={deleteAssignment.bind(null, a.id, path)}>
                    <ConfirmButton message={L["c.assignment"]} className="btn btn-ghost btn-sm !text-warn">{L["delete"]}</ConfirmButton>
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
