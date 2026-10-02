import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getT, isLocale, type Key } from "@/lib/i18n";
import { getUser } from "@/lib/auth";
import { register } from "@/lib/actions";
import SubmitButton from "@/components/SubmitButton";
import { tt } from "@/lib/teachText";
import AuthShell from "@/components/AuthShell";
import { Alert, Field } from "@/components/ui";

export const metadata = { title: "Sign up" };

export default async function Register({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ error?: string }> }) {
  const { locale } = await params;
  const { error } = await searchParams;
  if (!isLocale(locale)) notFound();
  if (await getUser()) redirect(`/${locale}/dashboard`);
  const t = getT(locale);
  return (
    <AuthShell locale={locale} title={t("register.title")} sub={t("register.sub")}>
      <form action={register} className="space-y-4">
        <input type="hidden" name="locale" value={locale} />
        {error && <Alert>{error === "lecturercode" ? tt(locale, "err.lecturercode") : t((["fields", "short", "mismatch", "exists"]).includes(error) ? (`err.${error}` as Key) : "err.fields")}</Alert>}
        <Field label={t("field.name")} name="name" autoComplete="name" />
        <Field label={t("field.email")} name="email" type="email" autoComplete="email" />
        <Field label={t("field.password")} name="password" type="password" autoComplete="new-password" />
        <Field label={t("field.confirm")} name="confirm" type="password" autoComplete="new-password" />
        <fieldset>
          <legend className="mb-1.5 text-sm font-medium">{tt(locale, "role.label")}</legend>
          <div className="grid grid-cols-2 gap-3">
            {(["student", "lecturer"] as const).map((r, i) => (
              <label key={r} className="cursor-pointer">
                <input type="radio" name="role" value={r} defaultChecked={i === 0} className="peer sr-only" />
                <span className="block rounded-xl border border-line bg-card px-4 py-3 text-center text-sm font-medium transition-colors peer-checked:border-sage peer-checked:bg-sage-tint peer-checked:text-sage-deep peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-sage">
                  {tt(locale, r === "student" ? "role.student" : "role.lecturer")}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        {process.env.LECTURER_CODE && (
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">{tt(locale, "role.code")}</span>
            <input className="input" name="code" type="password" autoComplete="off" />
            <span className="mt-1 block text-xs text-ink-soft">{tt(locale, "role.code.hint")}</span>
          </label>
        )}
        <SubmitButton className="btn btn-primary w-full">{t("register.submit")}</SubmitButton>
      </form>
      <p className="mt-6 text-sm text-ink-soft">
        {t("register.have")} <Link href={`/${locale}/login`} className="font-semibold text-sage hover:underline">{t("nav.login")}</Link>
      </p>
    </AuthShell>
  );
}
