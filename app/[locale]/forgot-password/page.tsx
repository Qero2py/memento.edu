import Link from "next/link";
import { notFound } from "next/navigation";
import { getT, isLocale } from "@/lib/i18n";
import { forgotPassword } from "@/lib/actions";
import AuthShell from "@/components/AuthShell";
import { Alert, Field } from "@/components/ui";

export const metadata = { title: "Forgot password" };

export default async function Forgot({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ sent?: string; token?: string }> }) {
  const { locale } = await params;
  const { sent, token } = await searchParams;
  if (!isLocale(locale)) notFound();
  const t = getT(locale);
  return (
    <AuthShell locale={locale} title={t("forgot.title")} sub={t("forgot.sub")}>
      {sent ? (
        <div className="space-y-4">
          <Alert tone="ok">{t("forgot.sent")}</Alert>
          {token && <Link href={`/${locale}/reset/${token}`} className="btn btn-primary w-full">{t("forgot.open")}</Link>}
          <p className="text-sm text-ink-soft">{t("forgot.demo")}</p>
        </div>
      ) : (
        <form action={forgotPassword} className="space-y-4">
          <input type="hidden" name="locale" value={locale} />
          <Field label={t("field.email")} name="email" type="email" autoComplete="email" />
          <button className="btn btn-primary w-full">{t("forgot.submit")}</button>
        </form>
      )}
      <Link href={`/${locale}/login`} className="mt-6 inline-block text-sm font-semibold text-sage hover:underline">{t("forgot.back")}</Link>
    </AuthShell>
  );
}
