"use client";
import "./globals.css";

// Last resort: used only if the root layout itself crashes. Shows both languages.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body className="grid min-h-screen place-items-center px-6">
        <div role="alert" className="max-w-md">
          <p className="font-serif text-2xl font-semibold">memento<span className="text-sage">.edu</span></p>
          <h1 className="h-section mt-6 text-3xl">Something went wrong<br /><span className="text-ink-soft">Terjadi masalah</span></h1>
          {error.digest && <p className="mt-4 text-xs text-ink-soft">Ref: <code>{error.digest}</code></p>}
          <button onClick={reset} className="btn btn-primary mt-8">Try again / Coba lagi</button>
        </div>
      </body>
    </html>
  );
}
