export default function Loading() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Page heading */}
      <section className="space-y-3">
        <div className="h-11 w-56 animate-pulse rounded-lg bg-muted motion-reduce:animate-none" />
      </section>

      {/* Main content */}
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="h-36 animate-pulse rounded-(--radius) border bg-card shadow-card motion-reduce:animate-none" />
        <div className="h-36 animate-pulse rounded-(--radius) border bg-card shadow-card motion-reduce:animate-none" />
        <div className="h-36 animate-pulse rounded-(--radius) border bg-card shadow-card motion-reduce:animate-none" />
      </section>

      {/* Content panel */}
      <section className="flex flex-1 flex-col rounded-(--radius) border bg-card p-6 shadow-card">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-6 w-40 animate-pulse rounded-md bg-muted motion-reduce:animate-none" />
            <div className="h-4 w-64 max-w-full animate-pulse rounded-md bg-muted motion-reduce:animate-none" />
          </div>

          <div className="h-10 w-28 animate-pulse rounded-lg bg-muted motion-reduce:animate-none" />
        </div>

        {/* Generic rows */}
        <div className="mt-8 divide-y divide-border">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
            >
              <div className="size-10 shrink-0 animate-pulse rounded-xl bg-muted motion-reduce:animate-none" />

              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-4 w-2/5 animate-pulse rounded-md bg-muted motion-reduce:animate-none" />
                <div className="h-3 w-3/5 animate-pulse rounded-md bg-muted motion-reduce:animate-none" />
              </div>

              <div className="hidden h-8 w-20 animate-pulse rounded-lg bg-muted sm:block motion-reduce:animate-none" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
