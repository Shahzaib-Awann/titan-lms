import { PlusCircle } from "lucide-react";
import { MainBanner } from "@/components/ui/main-banner";
import AdminStatsGrid from "@/components/pages/admin/page/admin-stats-grid";
import AdminRecentUsers from "@/components/pages/admin/page/admin-recent-users";
import AdminQuickActions from "@/components/pages/admin/page/admin-quick-actions";
import AdminUserDistribution from "@/components/pages/admin/page/admin-user-distribution";
import { adminUserDistribution } from "@/lib/data/admin.mock";
import Link from "next/link";

export default function AdminDashboard() {
  return (
    <div className="flex flex-col gap-8 p-6 lg:p-8 max-w-[1600px] mx-auto w-full animate-in fade-in duration-500">
      {/* Hero Welcome Section */}
      <MainBanner>
        <div className="max-w-3xl">
          <h1 className="mb-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Welcome back, Admin
          </h1>

          <p className="mb-8 max-w-2xl text-lg leading-relaxed text-white/80">
            Here&apos;s what&apos;s happening in your learning platform today.
            You have <span className="font-semibold text-white">24</span>{" "}
            pending leave approvals and{" "}
            <span className="font-semibold text-white">112</span> new
            registrations to review.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              href="/student/create"
              className="h-12 flex items-center gap-1 rounded-xl bg-white px-6 font-semibold text-[#7658FF] shadow-sm transition-all hover:scale-[1.02] hover:bg-white/90"
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              Add New Student
            </Link>
          </div>
        </div>
      </MainBanner>

      <AdminStatsGrid />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Column - Recent Users */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          <AdminRecentUsers />
        </div>

        {/* Right Column - Activity & Overview */}
        <div className="flex flex-col gap-8">
          <AdminQuickActions />
          <AdminUserDistribution data={adminUserDistribution} />
        </div>
      </div>
    </div>
  );
}
