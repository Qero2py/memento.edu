import { notFound } from "next/navigation";
import { getT, isLocale } from "@/lib/i18n";
import AuthShell from "@/components/AuthShell";
import ForgotPasswordForm from "@/components/ForgotPasswordForm";

export const metadata = { title: "Forgot password" };

export default async function Forgot({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ error?: string }> }) {
  const { locale } = await params;
  const { error } = await searchParams;
  if (!isLocale(locale)) notFound();
  const t = getT(locale);
  return (
    <AuthShell locale={locale} title={t("forgot.title")} sub={t("forgot.sub")}>
      <ForgotPasswordForm locale={locale} error={error} />
    </AuthShell>
  );
}
