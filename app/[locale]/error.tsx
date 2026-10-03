"use client";
import { useEffect } from "react";
import ErrorView from "@/components/ErrorView";

export default function ErrorPage({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => { console.error(error); }, [error]);
  // A full reload re-fetches everything from the server, so it recovers once the problem is gone.
  const retry = () => window.location.reload();
  return <ErrorView kind="error" variant="page" digest={error.digest} onRetry={retry} />;
}
