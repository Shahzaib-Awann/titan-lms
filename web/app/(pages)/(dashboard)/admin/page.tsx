import {
  BookOpen,
  CalendarCheck,
  PlusCircle,
  UserCog,
  Users,
} from "lucide-react";
import { MainBanner } from "@/components/ui/main-banner";
import AdminRecentUsers from "@/components/pages/admin/page/admin-recent-users";
import AdminQuickActions from "@/components/pages/admin/page/admin-quick-actions";
import AdminUserDistribution from "@/components/pages/admin/page/admin-user-distribution";
import Link from "next/link";
import AnnouncementsCalenderCard from "@/components/pages/dashboards/announcements-calender-card";
import { getAdminStats } from "@/lib/actions/dashboard.action";
import DashboardStatsGrid from "@/components/pages/dashboards/stats-cards-grid";
import { getCurrentUser } from "@/lib/actions/auth.action";

export default async function AdminDashboard() {
  const user = await getCurrentUser();
  const result = await getAdminStats();
  const data = result.data;

  const stats = [
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
    <div className="grid grid-cols-4 gap-8 p-6 lg:p-8 max-w-[1600px] mx-auto w-full animate-in fade-in duration-500">
      {/* Hero Welcome Section */}
      <div className="col-span-3 flex flex-col mx-auto w-full animate-in fade-in duration-500 gap-8 ">
        <MainBanner>
          <div className="max-w-3xl">
            <h1 className="mb-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Welcome back,
              <span className="underline underline-offset-8">
                {`${user?.fullName ?? "Guest"}!`}
              </span>
            </h1>

            <p className="mb-8 max-w-2xl text-lg leading-relaxed text-white/80">
              Here&apos;s an overview of your learning platform. Manage
              students, registrations, leave requests, and other administrative
              activities from your dashboard.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/admin/students/create"
                className="h-12 flex items-center gap-1 rounded-xl bg-white px-6 font-semibold text-[#7658FF] shadow-sm transition-all hover:scale-[1.02] hover:bg-white/90"
              >
                <PlusCircle className="mr-2 h-5 w-5" />
                Add New Student
              </Link>
            </div>
          </div>
        </MainBanner>

        <DashboardStatsGrid
          success={result.success}
          cards={stats}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 items-start gap-8">
          {/* Main Column - Recent Users */}
          <div className="lg:col-span-3 flex flex-col gap-8">
            <AdminRecentUsers />
            <AdminUserDistribution />
          </div>
        </div>
      </div>

      <div className="col-span-1 flex flex-col gap-8">
        <AnnouncementsCalenderCard />
        <AdminQuickActions />
      </div>
    </div>
  );
}
