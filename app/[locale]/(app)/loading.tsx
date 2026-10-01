// Shown instantly while a signed-in page loads its data.
export default function Loading() {
  const bar = "animate-pulse rounded-xl bg-sage-tint";
  return (
    <div aria-busy="true" aria-live="polite">
      <div className={`${bar} h-10 w-64`} />
      <div className={`${bar} mt-3 h-4 w-48`} />
      <div className={`${bar} mt-8 h-32 w-full`} />
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {[0, 1, 2, 3].map((i) => <div key={i} className={`${bar} h-32`} />)}
      </div>
    </div>
  );
}
