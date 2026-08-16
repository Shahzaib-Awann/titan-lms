import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Student Portal",
    template: "%s | Student Portal | Titan LMS",
  },
  description:
    "Titan LMS Student Portal — enroll in courses, attend classes, submit assignments, and track your learning progress from one powerful dashboard.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
