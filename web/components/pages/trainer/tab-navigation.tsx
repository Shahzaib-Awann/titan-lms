"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import React from "react";
import { Role } from "@/types/common";

type BatchLayoutTabNavigationProps = {
  batchId: string;
  role: Exclude<Role, "admin">;
};

const BatchLayoutTabNavigation = ({
  batchId,
  role,
}: BatchLayoutTabNavigationProps) => {
  const pathname = usePathname();

  const basePath =
    role === "trainer"
      ? `/trainer/batches/${batchId}`
      : `/student/my-courses/${batchId}`;

  const tabs = [
    {
      label: "Overview",
      href: basePath,
      visibleTo: "both",
    },
    {
      label: "Progress",
      href: `${basePath}/progress`,
      visibleTo: "both",
    },
    {
      label: "Assignments",
      href: `${basePath}/assignments`,
      visibleTo: "both",
    },
    {
      label: "Quizzes",
      href: `${basePath}/quizzes`,
      visibleTo: "both",
    },
    {
      label: "Attendance",
      href: `${basePath}/attendance`,
      visibleTo: "student",
    },
  ];

  const visibleTabs = tabs.filter(
    (tab) => tab.visibleTo === "both" || tab.visibleTo === role,
  );

  return (
    <nav className="flex gap-2 border-b">
      {visibleTabs.map((tab) => {
        const isActive = pathname === tab.href;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`border-b-2 px-3 py-3 text-sm transition-colors ${
              isActive
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:border-muted hover:text-foreground"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
};

export default BatchLayoutTabNavigation;
