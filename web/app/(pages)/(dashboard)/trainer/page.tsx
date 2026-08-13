import AnnouncementsCalenderCard from "@/components/pages/dashboards/announcements-calender-card";
import BatchesCardsGrid from "@/components/pages/dashboards/batches-cards-grid";
import DashboardStatsGrid from "@/components/pages/dashboards/stats-cards-grid";
import { MainBanner } from "@/components/ui/main-banner";
import { getCurrentUser } from "@/lib/actions/auth.action";
import {
  getDashboardBatches,
  getTrainerStats,
} from "@/lib/actions/dashboard.action";
import { BookOpen, CalendarDays, Clock, Layers3, Users } from "lucide-react";
import Link from "next/link";
import React from "react";

const TrainerDashboardPage = async () => {
  const [user, result, batchesResponse] = await Promise.all([
    getCurrentUser(),
    getTrainerStats(),
    getDashboardBatches(),
  ]);

  const data = result.data;

  const stats = [
    {
      title: "My Courses",
      value: data.coursesCount,
      icon: BookOpen,
      status: "Assigned courses",
      color: "text-primary",
    },
    {
      title: "My Batches",
      value: data.batchesCount,
      icon: Layers3,
      status: "Active batches",
      color: "text-violet-500",
    },
    {
      title: "My Students",
      value: data.studentsCount,
      icon: Users,
      status: "Active students",
      color: "text-emerald-500",
    },
    {
      title: "Today's Classes",
      value: data.totalClasses,
      icon: CalendarDays,
      status: "Scheduled today",
      color: "text-amber-500",
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
              Ready to inspire and guide your learners today? Review your
              schedule, stay on top of your upcoming training sessions, and make
              the most of your day.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/trainer/schedule"
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
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 items-start gap-8">
          {/* Main Column - Recent Users */}
          <div className="lg:col-span-3 flex flex-col gap-8">
            <BatchesCardsGrid
              success={batchesResponse.success}
              role={"trainer"}
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

export default TrainerDashboardPage;
