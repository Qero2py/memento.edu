import { notFound } from "next/navigation";
import { getT, isLocale, type Key } from "@/lib/i18n";
import { resetPassword } from "@/lib/actions";
import AuthShell from "@/components/AuthShell";
import { Alert, Field } from "@/components/ui";

export const metadata = { title: "Reset password" };

export default async function Reset({ params, searchParams }: { params: Promise<{ locale: string; token: string }>; searchParams: Promise<{ error?: string }> }) {
  const { locale, token } = await params;
  const { error } = await searchParams;
  if (!isLocale(locale)) notFound();
  const t = getT(locale);
  return (
    <AuthShell locale={locale} title={t("reset.title")} sub="">
      <form action={resetPassword} className="space-y-4">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="token" value={token} />
        {error && <Alert>{t(`err.${error}` as Key)}</Alert>}
        <Field label={t("field.password")} name="password" type="password" autoComplete="new-password" />
        <Field label={t("field.confirm")} name="confirm" type="password" autoComplete="new-password" />
        <button className="btn btn-primary w-full">{t("reset.submit")}</button>
      </form>
    </AuthShell>
  );
}
