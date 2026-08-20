interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular" | "card";
}

const variantClasses = {
  text: "h-4 w-full rounded",
  circular: "rounded-full",
  rectangular: "rounded-lg",
  card: "rounded-xl h-64 w-full",
};

export function Skeleton({ className = "", variant = "text", style, ...props }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-gym-elevated ${variantClasses[variant]} ${className}`}
      style={style}
      aria-hidden="true"
      {...props}
    />
  );
}

export function VideoCardSkeleton() {
  return (
    <div className="rounded-xl border border-gym-border bg-gym-surface p-0 overflow-hidden">
      <Skeleton variant="rectangular" className="aspect-video w-full !rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex gap-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </div>
  );
}


export function GridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <VideoCardSkeleton key={i} />
      ))}
    </div>
  );
}
