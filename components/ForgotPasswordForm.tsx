"use client";

import { useActionState } from "react";
import Link from "next/link";
import { forgotPassword, resetPassword, type ForgotPasswordState, type ResetPasswordState } from "@/lib/actions";
import { getT, type Key } from "@/lib/i18n";
import { Alert, Field } from "@/components/ui";
import SubmitButton from "@/components/SubmitButton";

const initialForgot: ForgotPasswordState = {};
const initialReset: ResetPasswordState = {};

export default function ForgotPasswordForm({ locale, error }: { locale: "en" | "id"; error?: string }) {
  const t = getT(locale);
  const [state, action] = useActionState(forgotPassword, initialForgot);
  const [resetState, resetAction] = useActionState(resetPassword, initialReset);
  return (
    <>
      {!state.sent && !state.throttled ? (
        <form action={action} className="space-y-4">
          <input type="hidden" name="locale" value={locale} />
          <Field label={t("field.email")} name="email" type="email" autoComplete="email" />
          {error && <Alert>{t(((["token", "short", "mismatch"]).includes(error) ? `err.${error}` : "err.fields") as Key)}</Alert>}
          <SubmitButton className="btn btn-primary w-full">{t("forgot.submit")}</SubmitButton>
        </form>
      ) : state.throttled ? (
        <Alert>{locale === "en" ? "Too many attempts. Please wait before trying again." : "Terlalu banyak percobaan. Tunggu sebelum mencoba lagi."}</Alert>
      ) : (
        <div className="space-y-4">
          <Alert tone="ok">{t("forgot.sent")}</Alert>
          {state.token ? (
            <>
              <p className="text-sm text-ink-soft">{t("forgot.demo")}</p>
              <form action={resetAction} className="space-y-4 rounded-xl border border-line p-4">
                <input type="hidden" name="locale" value={locale} />
                <input type="hidden" name="token" value={state.token} />
                {resetState.throttled ? <Alert>{locale === "en" ? "Too many attempts. Please wait before trying again." : "Terlalu banyak percobaan. Tunggu sebelum mencoba lagi."}</Alert> : resetState.error && <Alert>{t(`err.${resetState.error}` as Key)}</Alert>}
                <Field label={t("field.password")} name="password" type="password" autoComplete="new-password" />
                <Field label={t("field.confirm")} name="confirm" type="password" autoComplete="new-password" />
                <SubmitButton className="btn btn-primary w-full">{t("reset.submit")}</SubmitButton>
              </form>
            </>
          ) : null}
        </div>
      )}
      <Link href={`/${locale}/login`} className="mt-6 inline-block text-sm font-semibold text-sage hover:underline">{t("forgot.back")}</Link>
    </>
  );
}
