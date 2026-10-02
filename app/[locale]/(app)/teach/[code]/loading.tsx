import { Bar, Busy } from "@/components/Skeleton";
export default function Loading() {
  return (
    <Busy>
      <Bar className="h-4 w-32" /><Bar className="mt-6 h-6 w-20 !rounded-full" /><Bar className="mt-4 h-12 w-96 max-w-full" />
      <div className="mt-8 flex gap-6 border-b border-line pb-3">{[0, 1, 2, 3].map((i) => <Bar key={i} className="h-5 w-20" />)}</div>
      <Bar className="mt-8 h-14" />
      <div className="mt-4 space-y-3">{[0, 1, 2].map((i) => <Bar key={i} className="h-20" />)}</div>
    </Busy>
  );
}
