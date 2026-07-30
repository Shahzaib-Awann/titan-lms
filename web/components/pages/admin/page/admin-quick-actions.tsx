import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bell,
  BookOpen,
  ClipboardCheck,
  GraduationCap,
  Layers,
  Settings,
  UserPlus,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const quickActionsForAdmin = [
  {
    label: "Create Student",
    description: "Register a new learner",
    icon: UserPlus,
    color: "bg-primary/10 text-primary",
    url: "/admin/students/create",
  },
  {
    label: "Create Trainer",
    description: "Add a new instructor",
    icon: UserPlus,
    color: "bg-green/10 text-green",
    url: "/admin/trainers/create",
  },
  {
    label: "Create Course",
    description: "Publish a new course",
    icon: BookOpen,
    color: "bg-yellow/10 text-yellow",
    url: "/admin/courses/create",
  },
  {
    label: "Create Batch",
    description: "Organize students",
    icon: Layers,
    color: "bg-primary/10 text-primary",
    url: "/admin/batches/create",
  },
  {
    label: "Attendance",
    description: "Manage attendance",
    icon: ClipboardCheck,
    color: "bg-green/10 text-green",
    url: "/admin/attendance/students",
  },
  {
    label: "Progress",
    description: "Track learning",
    icon: GraduationCap,
    color: "bg-yellow/10 text-yellow",
    url: "/admin/learning/progress",
  },
  {
    label: "Reports",
    description: "Platform analytics",
    icon: BarChart3,
    color: "bg-primary/10 text-primary",
    url: "/admin/reports",
  },
  {
    label: "Announcements",
    description: "Notify users",
    icon: Bell,
    color: "bg-red/10 text-red",
    url: "/admin/announcements",
  },
  {
    label: "Settings",
    description: "Configure Titan LMS",
    icon: Settings,
    color: "bg-muted text-muted-foreground",
    url: "/admin/settings",
  },
];

const AdminQuickActions = () => {
  return (
    <Card className="overflow-hidden border-border/60 shadow-card">
      <CardHeader className="border-b border-border/50 pb-6">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Shortcuts
        </p>

        <CardTitle className="mt-2 text-xl">Quick Actions</CardTitle>

        <CardDescription className="mt-2">
          Frequently used administrator tools.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3 py-1 max-h-100 overflow-y-auto">
        {quickActionsForAdmin.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.url}
              href={action.url}
              className="group flex items-center gap-4 rounded-xl border border-border/50 bg-card p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-accent/30 hover:shadow-card"
            >
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${action.color}`}
              >
                <Icon className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground transition-colors group-hover:text-primary">
                  {action.label}
                </p>

                <p className="text-xs text-muted-foreground">
                  {action.description}
                </p>
              </div>

              <ArrowRight className="h-4 w-4 text-muted-foreground transition-all duration-300 group-hover:translate-x-1 group-hover:text-primary" />
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default AdminQuickActions;
