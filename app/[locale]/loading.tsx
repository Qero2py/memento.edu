import { Bar, Busy } from "@/components/Skeleton";

// Shown while the landing page loads.
export default function Loading() {
  return (
    <Busy>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Bar className="h-8 w-40" />
        <Bar className="h-8 w-56" />
      </div>
      <div className="mx-auto grid max-w-6xl gap-12 px-5 pt-16 lg:grid-cols-[1.25fr_1fr]">
        <div className="space-y-4">
          <Bar className="h-16 w-4/5" />
          <Bar className="h-16 w-3/5" />
          <Bar className="mt-6 h-5 w-2/3" />
          <Bar className="h-11 w-56 !rounded-full" />
        </div>
        <Bar className="h-80" />
      </div>
    </Busy>
  );
}
