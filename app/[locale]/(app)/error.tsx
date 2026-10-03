"use client";
import { useEffect } from "react";
import ErrorView from "@/components/ErrorView";

// Errors inside the signed-in area keep the sidebar visible.
export default function AppError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => { console.error(error); }, [error]);
  // A full reload re-fetches everything from the server, so it recovers once the problem is gone.
  const retry = () => window.location.reload();
  return <ErrorView kind="error" variant="app" digest={error.digest} onRetry={retry} />;
}
