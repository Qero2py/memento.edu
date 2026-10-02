import type { Locale } from "@/lib/i18n";
import { ttAll } from "@/lib/teachText";
import { updateCourse } from "@/lib/teach-actions";
import type { Row } from "@/lib/db";
import SubmitButton from "@/components/SubmitButton";
import { F, formGrid } from "./Fields";

export default function InfoTab({ course, locale, path }: { course: Row; locale: Locale; path: string }) {
  const L = ttAll(locale);
  return (
    <form action={updateCourse.bind(null, course.id, path)} className={`${formGrid} card p-5`}>
      <F label={L["f.title.en"]} name="title_en" defaultValue={course.title_en} /><F label={L["f.title.id"]} name="title_id" defaultValue={course.title_id} />
      <F label={L["f.desc.en"]} name="desc_en" rows={3} defaultValue={course.desc_en} /><F label={L["f.desc.id"]} name="desc_id" rows={3} defaultValue={course.desc_id} />
      <F label={L["f.lecturer"]} name="lecturer" defaultValue={course.lecturer} /><F label={L["f.credits"]} name="credits" type="number" min={1} max={8} defaultValue={course.credits} />
      <div className="sm:col-span-2"><SubmitButton className="btn btn-primary btn-sm">{L["save"]}</SubmitButton></div>
    </form>
  );
}
