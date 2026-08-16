export default function Loading() {
  return (
    <main
      className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground"
      aria-label="Loading Titan LMS"
    >
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="relative flex size-16 items-center justify-center">
          <div className="absolute inset-0 animate-pulse rounded-2xl bg-primary/20 blur-xl motion-reduce:animate-none" />

          <div className="relative flex size-14 items-center justify-center rounded-2xl bg-linear-to-br from-blurple-hover via-blurple to-[#9268FF] shadow-[0_10px_30px_rgba(118,88,255,0.3)]">
            <span
              className="size-5 animate-spin rounded-full border-[3px] border-primary-foreground/30 border-t-primary-foreground motion-reduce:animate-none"
              aria-hidden="true"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <p className="text-base font-semibold tracking-tight text-foreground">
            Titan LMS
          </p>

          <p className="text-sm font-medium text-muted-foreground">
            Preparing your learning experience…
          </p>
        </div>
      </div>
    </main>
  );
}
