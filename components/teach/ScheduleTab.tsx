import type { Locale } from "@/lib/i18n";
import { ttAll } from "@/lib/teachText";
import { addEvent, deleteEvent, updateEvent } from "@/lib/teach-actions";
import type { Row } from "@/lib/db";
import { Icon } from "@/components/ui";
import SubmitButton from "@/components/SubmitButton";
import ConfirmButton from "@/components/ConfirmButton";
import { F } from "./Fields";

// Weekday names in the reader's language (2024-01-01 was a Monday).
const dayName = (d: number, locale: Locale) =>
  new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-GB", { weekday: "long", timeZone: "UTC" }).format(new Date(Date.UTC(2024, 0, d)));

function SlotFields({ locale, L, slot }: { locale: Locale; L: Record<string, string>; slot?: Row }) {
  return (
    <>
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-ink-soft">{L["f.day"]}</span>
        <select name="day" className="input" defaultValue={slot?.day ?? 1}>
          {[1, 2, 3, 4, 5, 6, 7].map((d) => <option key={d} value={d}>{dayName(d, locale)}</option>)}
        </select>
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-ink-soft">{L["f.kind"]}</span>
        <select name="kind" className="input" defaultValue={slot?.kind ?? "lecture"}>
          <option value="lecture">{L["kind.lecture"]}</option><option value="practicum">{L["kind.practicum"]}</option>
        </select>
      </label>
      <div className="grid grid-cols-2 gap-3 sm:col-span-2">
        <F label={L["f.start"]} name="start" type="time" required defaultValue={slot?.start} />
        <F label={L["f.end"]} name="end" type="time" required defaultValue={slot?.end} />
      </div>
      <F label={L["f.room"]} name="room" defaultValue={slot?.room} className="sm:col-span-2" />
    </>
  );
}

export default function ScheduleTab({ course, events, locale, path, error }: { course: Row; events: Row[]; locale: Locale; path: string; error?: string }) {
  const L = ttAll(locale);
  return (
    <div className="space-y-6">
      {error === "time" && <p role="alert" className="rounded-xl border border-warn/30 bg-warn/5 px-4 py-3 text-sm text-warn">{L["e.time"]}</p>}
      <details className="card" open={events.length === 0}>
        <summary className="flex items-center justify-between p-4 font-semibold">{L["sch.add"]}<Icon name="chev" className="chev h-4 w-4 transition-transform" /></summary>
        <form action={addEvent.bind(null, course.id, path)} className="grid gap-3 border-t border-line p-4 sm:grid-cols-2">
          <SlotFields locale={locale} L={L} />
          <p className="text-xs text-ink-soft sm:col-span-2">{L["sch.weekly"]}</p>
          <div className="sm:col-span-2"><SubmitButton className="btn btn-primary btn-sm">{L["add"]}</SubmitButton></div>
        </form>
      </details>

      {events.length === 0 ? <p className="card p-6 text-ink-soft">{L["sch.none"]}</p> : (
        <ul className="space-y-3">
          {events.map((e) => (
            <li key={e.id}>
              <details className="card">
                <summary className="flex items-center gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-serif text-xl leading-snug">{dayName(e.day, locale)}, {e.start} - {e.end}</p>
                    <p className="truncate text-sm text-ink-soft">{L[`kind.${e.kind}` as "kind.lecture"]}{e.room ? `, ${e.room}` : ""}</p>
                  </div>
                  <Icon name="chev" className="chev h-4 w-4 shrink-0 text-ink-soft transition-transform" />
                </summary>
                <div className="space-y-4 border-t border-line p-4">
                  <form action={updateEvent.bind(null, e.id, path)} className="grid gap-3 sm:grid-cols-2">
                    <SlotFields locale={locale} L={L} slot={e} />
                    <div className="sm:col-span-2"><SubmitButton className="btn btn-primary btn-sm">{L["save"]}</SubmitButton></div>
                  </form>
                  <form action={deleteEvent.bind(null, e.id, path)}>
                    <ConfirmButton message={L["c.event"]} className="btn btn-ghost btn-sm !text-warn">{L["delete"]}</ConfirmButton>
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
