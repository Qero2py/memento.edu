import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getT, isLocale } from "@/lib/i18n";
import { et } from "@/lib/errorText";
import { getUser } from "@/lib/auth";
import { login } from "@/lib/actions";
import SubmitButton from "@/components/SubmitButton";
import AuthShell from "@/components/AuthShell";
import { Alert, Field } from "@/components/ui";

export const metadata = { title: "Log in" };

export default async function Login({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ error?: string; reset?: string }> }) {
  const { locale } = await params;
  const { error, reset } = await searchParams;
  if (!isLocale(locale)) notFound();
  if (await getUser()) redirect(`/${locale}/dashboard`);
  const t = getT(locale);
  return (
    <AuthShell locale={locale} title={t("login.title")} sub={t("login.sub")}>
      <form action={login} className="space-y-4">
        <input type="hidden" name="locale" value={locale} />
        {error && <Alert>{error === "session" ? et(locale, "session") : t("err.invalid")}</Alert>}
        {reset && <Alert tone="ok">{t("reset.done")}</Alert>}
        <Field label={t("field.email")} name="email" type="email" autoComplete="email" />
        <div>
          <Field label={t("field.password")} name="password" type="password" autoComplete="current-password" />
          <Link href={`/${locale}/forgot-password`} className="mt-2 inline-block text-sm font-medium text-sage hover:underline">{t("login.forgot")}</Link>
        </div>
        <SubmitButton className="btn btn-primary w-full">{t("login.submit")}</SubmitButton>
      </form>
      <p className="mt-6 text-sm text-ink-soft">
        {t("login.noacc")} <Link href={`/${locale}/register`} className="font-semibold text-sage hover:underline">{t("nav.register")}</Link>
      </p>
      <p className="mt-8 rounded-xl bg-sage-tint px-4 py-3 text-sm text-sage-deep">{t("login.demo", { email: "ahmeth@memento.edu", pw: "memento123" })}</p>
    </AuthShell>
  );
}
