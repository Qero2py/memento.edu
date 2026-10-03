import { Bar, Busy } from "@/components/Skeleton";

export default function CoursesLoading() {
  return (
    <Busy>
      <Bar className="h-10 w-56" />
      <Bar className="mb-8 mt-3 h-4 w-72 max-w-full" />
      <div className="grid gap-4 sm:grid-cols-2">{[0, 1, 2, 3, 4, 5].map((i) => <Bar key={i} className="h-32" />)}</div>
    </Busy>
  );
}
