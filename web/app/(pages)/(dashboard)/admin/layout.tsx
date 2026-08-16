import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Admin Portal",
    template: "%s | Admin Portal | Titan LMS",
  },
  description:
    "Titan LMS Admin Portal — manage users, trainers, students, courses, classes, enrollments, and platform settings from a centralized administration dashboard.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
