import { Bar, Busy } from "@/components/Skeleton";
export default function Loading() {
  return (
    <Busy>
      <Bar className="h-10 w-56" /><Bar className="mt-3 h-4 w-80" />
      <Bar className="mt-10 h-7 w-44" />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">{[0, 1].map((i) => <Bar key={i} className="h-36" />)}</div>
      <Bar className="mt-12 h-7 w-44" /><Bar className="mt-4 h-40" />
    </Busy>
  );
}
