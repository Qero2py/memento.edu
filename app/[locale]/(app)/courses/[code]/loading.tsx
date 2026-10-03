import { Bar, Busy } from "@/components/Skeleton";

export default function CourseLoading() {
  return (
    <Busy>
      <Bar className="mb-6 h-4 w-24" />
      <Bar className="h-6 w-20 !rounded-full" />
      <Bar className="mt-3 h-12 w-80 max-w-full" />
      <Bar className="mt-4 h-4 w-96 max-w-full" />
      <Bar className="mt-6 h-1.5 w-full max-w-sm" />
      <div className="mb-8 mt-8 flex gap-6 border-b border-line pb-3">{[0, 1, 2, 3].map((i) => <Bar key={i} className="h-4 w-20" />)}</div>
      <ol>
        {[0, 1, 2, 3].map((i) => (
          <li key={i} className="relative pb-4 pl-10">
            <span className="absolute left-0 top-4 h-6 w-6 animate-pulse rounded-full bg-sage-tint" />
            <Bar className="h-[72px] w-full" />
          </li>
        ))}
      </ol>
    </Busy>
  );
}
