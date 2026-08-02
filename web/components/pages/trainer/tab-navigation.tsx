"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import React from "react";

const TrainerTabNavigation = ({ batchId }: { batchId: string }) => {
  const pathname = usePathname();

  const tabs = [
    {
      label: "Overview",
      href: `/trainer/batches/${batchId}`,
    },
    {
      label: "Progress",
      href: `/trainer/batches/${batchId}/progress`,
    },
    {
      label: "Attendance",
      href: `/trainer/batches/${batchId}/attendance`,
    },
    {
      label: "Students",
      href: `/trainer/batches/${batchId}/students`,
    },
    {
      label: "Settings",
      href: `/trainer/batches/${batchId}/settings`,
    },
  ];

  return (
    <nav className="flex gap-2 border-b">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`border-b-2 px-3 py-3 text-sm transition-colors ${
              isActive
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
};

export default TrainerTabNavigation;
