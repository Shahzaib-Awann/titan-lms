import AnnouncementsCalenderCard from "@/components/pages/dashboards/announcements-calender-card";
import BatchesCardsGrid from "@/components/pages/dashboards/batches-cards-grid";
import DashboardStatsGrid from "@/components/pages/dashboards/stats-cards-grid";
import { MainBanner } from "@/components/ui/main-banner";
import { getCurrentUser } from "@/lib/actions/auth.action";
import {
  getDashboardBatches,
  getStudentStats,
} from "@/lib/actions/dashboard.action";
import { BookOpen, Clock, Layers3, Users } from "lucide-react";
import Link from "next/link";
import React from "react";

export const dynamic = "force-dynamic";

const StudentDasboardPage = async () => {
  const [user, result, batchesResponse] = await Promise.all([
    getCurrentUser(),
    getStudentStats(),
    getDashboardBatches(),
  ]);

  const data = result.data;

  const stats = [
    {
      title: "Enrolled Batches",
      value: data.activeBatches,
      icon: BookOpen,
      status: "Enrolled batches",
      color: "text-primary",
    },
    {
      title: "Completed Batches",
      value: data.completedBatches,
      icon: Layers3,
      status: "Completed batches",
      color: "text-violet-500",
    },
    {
      title: "Today's Classes",
      value: data.todayClasses,
      icon: Users,
      status: "Scheduled today",
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
              Welcome Back,{" "}
              <span className="underline underline-offset-8">
                {`${user?.fullName ?? "Guest"}!`}
              </span>
            </h1>

            <p className="mb-8 max-w-2xl text-lg leading-relaxed text-white/80">
              Ready to start learning? Review your active courses and make the
              most of your day.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/student/schedule"
                className="flex h-12 items-center gap-2 rounded-xl bg-white px-6 font-semibold text-[#7658FF] shadow-sm transition-all hover:scale-[1.02] hover:bg-white/90"
              >
                <Clock className="h-5 w-5" />
                View Today&apos;s Schedule
              </Link>
            </div>
          </div>
        </MainBanner>

        <DashboardStatsGrid
          success={result.success}
          cards={stats}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 items-start gap-8">
          <div className="lg:col-span-3 flex flex-col gap-8">
            <BatchesCardsGrid
              success={batchesResponse.success}
              role="student"
              batches={batchesResponse.data}
            />
          </div>
        </div>
      </div>

      <div className="col-span-1 flex flex-col gap-8">
        <AnnouncementsCalenderCard />
      </div>
    </div>
  );
};

export default StudentDasboardPage;
