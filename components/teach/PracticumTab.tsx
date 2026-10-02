import { getT, pick, type Locale } from "@/lib/i18n";
import { ttAll } from "@/lib/teachText";
import { addPracticum, deletePracticum } from "@/lib/teach-actions";
import type { Row } from "@/lib/db";
import { Icon } from "@/components/ui";
import SubmitButton from "@/components/SubmitButton";
import ConfirmButton from "@/components/ConfirmButton";
import { F, formGrid } from "./Fields";

export default function PracticumTab({ course, items, locale, path }: { course: Row; items: Row[]; locale: Locale; path: string }) {
  const L = ttAll(locale), t = getT(locale);
  return (
    <div className="space-y-6">
      <details className="card" open={items.length === 0}>
        <summary className="flex items-center justify-between p-4 font-semibold">{L["p.add"]}<Icon name="chev" className="chev h-4 w-4 transition-transform" /></summary>
        <form action={addPracticum.bind(null, course.id, path)} className={`${formGrid} border-t border-line p-4`}>
          <F label={L["f.title.en"]} name="title_en" /><F label={L["f.title.id"]} name="title_id" />
          <F label={L["f.desc.en"]} name="desc_en" rows={2} /><F label={L["f.desc.id"]} name="desc_id" rows={2} />
          <p className="text-xs text-ink-soft sm:col-span-2">{L["f.opt"]}</p>
          <div className="sm:col-span-2"><SubmitButton className="btn btn-primary btn-sm">{L["add"]}</SubmitButton></div>
        </form>
      </details>
      {items.length === 0 ? <p className="card p-6 text-ink-soft">{L["p.none"]}</p> : (
        <ul className="space-y-3">
          {items.map((p) => (
            <li key={p.id} className="card flex items-start gap-4 p-5">
              <div className="min-w-0 flex-1">
                <p className="text-sm text-ink-soft">{t("prac.task", { n: p.num })}</p>
                <h3 className="font-serif text-xl">{pick(p, "title", locale)}</h3>
                <p className="mt-1 text-ink-soft">{pick(p, "desc", locale)}</p>
              </div>
              <form action={deletePracticum.bind(null, p.id, path)}>
                <ConfirmButton message={L["c.practicum"]} spinner={false} className="rounded-lg px-2 py-1 text-xs font-semibold text-warn hover:bg-warn/10">{L["delete"]}</ConfirmButton>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
