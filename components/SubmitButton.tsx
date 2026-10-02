"use client";
import { useFormStatus } from "react-dom";
import type { ButtonHTMLAttributes } from "react";

// A submit button that disables itself and shows a small spinner while its form's action is running.
export default function SubmitButton({ children, className = "", spinner = true, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { spinner?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button {...rest} type="submit" disabled={pending} aria-busy={pending} className={`${className} ${pending ? "cursor-wait opacity-70" : ""}`}>
      {children}
      {pending && spinner && <span aria-hidden className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />}
    </button>
  );
}
