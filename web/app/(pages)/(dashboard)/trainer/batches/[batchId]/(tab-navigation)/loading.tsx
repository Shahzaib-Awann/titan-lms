export default function Loading() {
  return (
    <div className="flex flex-1 flex-col">
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
