export default function Loading() {
  return (
    <div className="flex flex-1 flex-col">
      {/* Batch header */}
      <header className="my-2 flex items-end justify-between gap-6">
        <section className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-6 w-20 animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
            <div className="h-4 w-28 animate-pulse rounded-md bg-muted motion-reduce:animate-none" />
          </div>

          <div className="h-6 w-48 animate-pulse rounded-md bg-muted motion-reduce:animate-none" />

          <div className="h-4 w-36 animate-pulse rounded-md bg-muted motion-reduce:animate-none" />
        </section>

        <section className="space-y-2 text-right">
          <div className="ml-auto h-4 w-20 animate-pulse rounded-md bg-muted motion-reduce:animate-none" />
          <div className="ml-auto h-4 w-40 animate-pulse rounded-md bg-muted motion-reduce:animate-none" />
        </section>
      </header>

      {/* Tab navigation */}
      <nav
        aria-label="Loading batch navigation"
        className="mt-4 flex items-center gap-1 overflow-x-auto border-b"
      >
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="h-10 w-24 shrink-0 animate-pulse rounded-t-lg bg-muted motion-reduce:animate-none"
          />
        ))}
      </nav>

      {/* Page content */}
      <main className="flex flex-1 flex-col gap-4 p-5">
        <section className="rounded-(--radius) border bg-card p-6 shadow-card">
          <div className="space-y-2">
            <div className="h-6 w-44 animate-pulse rounded-md bg-muted motion-reduce:animate-none" />
            <div className="h-4 w-72 max-w-full animate-pulse rounded-md bg-muted motion-reduce:animate-none" />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-28 animate-pulse rounded-(--radius) bg-muted motion-reduce:animate-none"
              />
            ))}
          </div>
        </section>

        <section className="rounded-(--radius) border bg-card p-6 shadow-card">
          <div className="h-5 w-32 animate-pulse rounded-md bg-muted motion-reduce:animate-none" />

          <div className="mt-5 space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-12 animate-pulse rounded-lg bg-muted motion-reduce:animate-none"
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
