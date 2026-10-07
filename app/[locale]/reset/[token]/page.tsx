import { redirect } from "next/navigation";

// Old emailed/demo links must not put reset credentials back into the address bar.
export default async function Reset({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect(`/${locale}/forgot-password?error=token`);
}
