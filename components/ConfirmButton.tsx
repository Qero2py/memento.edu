"use client";
import type { ComponentProps } from "react";
import SubmitButton from "./SubmitButton";

// A submit button that asks "are you sure?" first (used for deleting).
export default function ConfirmButton({ message, ...props }: ComponentProps<typeof SubmitButton> & { message: string }) {
  return <SubmitButton {...props} onClick={(e) => { if (!window.confirm(message)) e.preventDefault(); }} />;
}
