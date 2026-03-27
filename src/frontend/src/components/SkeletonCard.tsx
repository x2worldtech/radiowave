export function SkeletonCard() {
  return (
    <div className="card-gradient rounded-2xl border border-border p-4 flex flex-col gap-4 shadow-card">
      <div className="mx-auto w-20 h-20 rounded-xl bg-muted animate-pulse" />
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded animate-pulse w-3/4 mx-auto" />
        <div className="h-3 bg-muted rounded animate-pulse w-1/2 mx-auto" />
      </div>
      <div className="flex gap-2 justify-center">
        <div className="h-5 w-14 bg-muted rounded-full animate-pulse" />
        <div className="h-5 w-10 bg-muted rounded-full animate-pulse" />
      </div>
      <div className="flex justify-between items-center mt-auto">
        <div className="h-3 w-12 bg-muted rounded animate-pulse" />
        <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
      </div>
    </div>
  );
}

const SKELETON_KEYS = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
];

export function SkeletonGrid({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {SKELETON_KEYS.slice(0, count).map((k) => (
        <SkeletonCard key={k} />
      ))}
    </div>
  );
}
