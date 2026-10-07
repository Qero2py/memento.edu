import { getT, type Locale } from "@/lib/i18n";

type AssignmentStatusData = { grade?: number | null; submitted_at?: string | null; overdue?: boolean };

export function AssignmentStatus({ a, locale }: { a: AssignmentStatusData; locale: Locale }) {
  const t = getT(locale);
  const [text, cls] =
    a.grade != null ? [t("status.graded", { g: a.grade }), "bg-sage text-white"] :
    a.submitted_at ? [t("status.submitted"), "bg-sage-tint text-sage-deep"] :
    a.overdue ? [t("status.overdue"), "bg-warn/10 text-warn"] : [t("status.pending"), "border border-line text-ink-soft"];
  return <span className={`inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>{text}</span>;
}
