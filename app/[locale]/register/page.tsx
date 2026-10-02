import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getT, isLocale, type Key } from "@/lib/i18n";
import { getUser } from "@/lib/auth";
import { register } from "@/lib/actions";
import SubmitButton from "@/components/SubmitButton";
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
        {error && <Alert>{t((["fields", "short", "mismatch", "exists"]).includes(error) ? (`err.${error}` as Key) : "err.fields")}</Alert>}
        <Field label={t("field.name")} name="name" autoComplete="name" />
        <Field label={t("field.email")} name="email" type="email" autoComplete="email" />
        <Field label={t("field.password")} name="password" type="password" autoComplete="new-password" />
        <Field label={t("field.confirm")} name="confirm" type="password" autoComplete="new-password" />
        <SubmitButton className="btn btn-primary w-full">{t("register.submit")}</SubmitButton>
      </form>
      <p className="mt-6 text-sm text-ink-soft">
        {t("register.have")} <Link href={`/${locale}/login`} className="font-semibold text-sage hover:underline">{t("nav.login")}</Link>
      </p>
    </AuthShell>
  );
}
