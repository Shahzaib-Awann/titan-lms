import { ReactNode } from "react";

interface MainBannerProps {
  children: ReactNode;
  className?: string;
}

export function MainBanner({ children, className = "" }: MainBannerProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl bg-linear-to-r from-[#6548F8] via-[#7658FF] to-[#9268FF] p-8 sm:p-12 text-white shadow-sm ${className}`}
    >
      <div className="relative z-10">{children}</div>

      {/* Decorative elements */}
      <div className="pointer-events-none absolute right-0 top-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute right-40 bottom-0 -mb-16 h-40 w-40 rounded-full bg-[#4ADE80]/20 blur-2xl" />
    </div>
  );
}
