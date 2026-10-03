import { Bar, Busy } from "@/components/Skeleton";

export default function DashboardLoading() {
  return (
    <Busy>
      <Bar className="h-10 w-72 max-w-full" />
      <Bar className="mt-3 h-4 w-48" />
      <div className="mt-8 h-28 animate-pulse rounded-2xl bg-ink/10" />
      <div className="mt-10 grid gap-10 xl:grid-cols-[1.6fr_1fr]">
        <div className="space-y-10">
          <section>
            <Bar className="mb-4 h-7 w-40" />
            <div className="grid gap-4 sm:grid-cols-2">{[0, 1, 2, 3].map((i) => <Bar key={i} className="h-32" />)}</div>
          </section>
          <section>
            <Bar className="mb-4 h-7 w-32" />
            <Bar className="h-52 w-full" />
          </section>
        </div>
        <div className="space-y-10">
          <section>
            <Bar className="mb-4 h-7 w-32" />
            <div className="space-y-3">{[0, 1, 2].map((i) => <Bar key={i} className="h-16" />)}</div>
          </section>
          <section>
            <Bar className="mb-4 h-7 w-40" />
            <Bar className="h-44 w-full" />
          </section>
        </div>
      </div>
    </Busy>
  );
}
