import {
  AlertCircle,
  BookOpen,
  CalendarCheck,
  UserCog,
  Users,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getAdminStats } from "@/lib/actions/dashboard.action";
import { Alert, AlertDescription } from "@/components/ui/alert";

const AdminStatsGrid = async () => {
  const result = await getAdminStats();

  const data = result.data;

  const adminStatCards = [
    {
      title: "Total Users",
      value: data.usersCount,
      icon: Users,
      status: "Registered users",
      color: "text-primary",
    },
    {
      title: "Total Courses",
      value: data.coursesCount,
      icon: BookOpen,
      status: "Published courses",
      color: "text-primary",
    },
    {
      title: "Active Enrollments",
      value: data.activeEnrollmentsCount,
      icon: CalendarCheck,
      status: "Currently active",
      color: "text-amber-500",
    },
    {
      title: "Active Instructors",
      value: data.activeInstructorsCount,
      icon: UserCog,
      status: "Currently active",
      color: "text-emerald-500",
    },
  ];

  return (
    <div className="space-y-6">
      {!result.success && (
        <Alert variant="destructive" className="items-center flex flex-row">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-destructive">
            We couldn&apos;t load the latest dashboard statistics. The values
            shown may be unavailable.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {adminStatCards.map((stat) => {
          const Icon = stat.icon;

          return (
            <Card
              key={stat.title}
              className="transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>

                    <p className="mt-2 text-3xl font-bold tracking-tight">
                      {stat.value.toLocaleString()}
                    </p>

                    <p className="mt-2 text-sm text-muted-foreground">
                      {stat.status}
                    </p>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AdminStatsGrid;
