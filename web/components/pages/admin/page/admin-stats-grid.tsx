import { Card, CardContent } from "@/components/ui/card";
import { getAdminStats } from "@/lib/actions/admin/dashboard.action";
import { BookOpen, CalendarCheck, UserCog, Users } from "lucide-react";

const AdminStatsGrid = async () => {
  const stats = await getAdminStats();

  if (!stats.success) {
    return <div>Error loading stats</div>;
  }

  const adminStatCards = [
    {
      title: "Total Users",
      value: stats.data.totalUsers.toLocaleString(),
      icon: Users,
      status: "Current count",
      color: "text-primary",
    },
    {
      title: "Total Courses",
      value: stats.data.totalCourses.toLocaleString(),
      icon: BookOpen,
      status: "Current count",
      color: "text-primary",
    },
    {
      title: "Pending Leave Approvals",
      value: stats.data.pendingLeaveApprovals.toLocaleString(),
      icon: CalendarCheck,
      status: "Requires attention",
      color: "text-amber-500",
    },
    {
      title: "Active Instructors",
      value: stats.data.activeInstructors.toLocaleString(),
      icon: UserCog,
      status: "Currently active",
      color: "text-emerald-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {adminStatCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card
            key={index}
            className="shadow-sm hover:-translate-y-1 transition-all duration-300"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold tracking-tight">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`h-12 w-12 rounded-xl bg-muted flex items-center justify-center ${stat.color} bg-opacity-10`}
                >
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <div className="text-sm text-muted-foreground">
                  {stat.status}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default AdminStatsGrid;
