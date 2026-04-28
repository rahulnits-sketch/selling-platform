export default function LoadingGrid({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-card rounded-2xl overflow-hidden border border-border/50 animate-pulse">
          <div className="aspect-[3/2] bg-muted" />
          <div className="p-4 space-y-3">
            <div className="h-4 bg-muted rounded-md w-3/4" />
            <div className="h-6 bg-muted rounded-md w-1/3" />
            <div className="flex gap-2">
              <div className="h-6 bg-muted rounded-md w-16" />
              <div className="h-6 bg-muted rounded-md w-16" />
              <div className="h-6 bg-muted rounded-md w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}