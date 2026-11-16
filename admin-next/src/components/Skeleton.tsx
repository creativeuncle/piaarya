// Shared skeleton placeholders shown while a page/table is waiting on data,
// instead of a plain "Loading..." label.

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 animate-pulse ${className}`}>
      <div className="h-12 w-12 rounded-lg bg-gray-100 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-3/4 rounded-full bg-gray-100" />
        <div className="h-2.5 w-1/3 rounded-full bg-gray-100" />
      </div>
    </div>
  );
}

export function SkeletonPage({ rows = 4 }: { rows?: number }) {
  return (
    <div className="p-6 space-y-5">
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonTableRows({ colSpan, rows = 6 }: { colSpan: number; rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i}>
          <td className="px-4 py-4" colSpan={colSpan}>
            <SkeletonCard />
          </td>
        </tr>
      ))}
    </>
  );
}

export function SkeletonInline() {
  return (
    <div className="animate-pulse space-y-2 py-1">
      <div className="h-3 w-2/3 rounded-full bg-gray-100" />
      <div className="h-2.5 w-1/3 rounded-full bg-gray-100" />
    </div>
  );
}
