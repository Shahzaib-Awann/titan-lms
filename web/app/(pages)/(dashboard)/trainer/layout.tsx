import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Trainer Portal",
    template: "%s | Trainer Portal | Titan LMS",
  },
  description:
    "Titan LMS Trainer Portal — manage courses, lessons, learners, assignments, and track training performance from one powerful dashboard.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function TrainerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
