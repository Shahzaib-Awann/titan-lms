import React from "react";
import Link from "next/link";
import {
  UserPlus,
  BookOpen,
  Layers,
  ClipboardCheck,
  GraduationCap,
  BarChart3,
  Bell,
  Settings,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const quickActionsForAdmin = [
  {
    label: "Create Student",
    icon: UserPlus,
    url: "/admin/students/create",
  },
  {
    label: "Create Trainer",
    icon: UserPlus,
    url: "/admin/trainers/create",
  },
  {
    label: "Create Course",
    icon: BookOpen,
    url: "/admin/courses/create",
  },
  {
    label: "Create Batch",
    icon: Layers,
    url: "/admin/batches/create",
  },
  {
    label: "Student Attendance",
    icon: ClipboardCheck,
    url: "/admin/attendance/students",
  },
  {
    label: "Learning Progress",
    icon: GraduationCap,
    url: "/admin/learning/progress",
  },
  {
    label: "Reports",
    icon: BarChart3,
    url: "/admin/reports",
  },
  {
    label: "Announcements",
    icon: Bell,
    url: "/admin/announcements",
  },
  {
    label: "Settings",
    icon: Settings,
    url: "/admin/settings",
  },
];

const AdminQuickActions = () => {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="flex flex-wrap gap-2">
          {quickActionsForAdmin.map((action) => {
            const Icon = action.icon;

            return (
              <Link key={action.url} href={action.url}>
                <Button
                  variant="outline"
                  className="w-full justify-start rounded-xl border-border/60 hover:border-primary/50 hover:bg-primary/5 transition-all group"
                >
                  <Icon className="mr-3 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="text-sm font-medium">{action.label}</span>
                </Button>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminQuickActions;
