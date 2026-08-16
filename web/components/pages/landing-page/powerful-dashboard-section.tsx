"use client";

import React from "react";
import {
  ArrowRight,
  Bell,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Pin,
  Plus,
  UserRound,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const stats = [
  {
    title: "Total Users",
    value: "1,248",
    description: "Registered users",
    icon: Users,
    iconClass: "text-[#7c5cff]",
  },
  {
    title: "Total Courses",
    value: "25",
    description: "Published courses",
    icon: BookOpen,
    iconClass: "text-[#8b6cff]",
  },
  {
    title: "Active Enrollments",
    value: "874",
    description: "Currently active",
    icon: GraduationCap,
    iconClass: "text-amber-400",
  },
  {
    title: "Active Instructors",
    value: "42",
    description: "Currently active",
    icon: UserRound,
    iconClass: "text-emerald-400",
  },
];

const users = [
  {
    initials: "AR",
    name: "Ahmed Raza",
    phone: "03333333333",
    role: "Trainer",
    roleClass: "text-[#8065ff]",
  },
  {
    initials: "AF",
    name: "Ayesha Fatima",
    phone: "02222222222",
    role: "Admin",
    roleClass: "text-[#8065ff]",
  },
  {
    initials: "HA",
    name: "Hamza Ali",
    phone: "05555555555",
    role: "Student",
    roleClass: "text-[#8065ff]",
  },
];

const announcements = [
  {
    title: "System Maintenance Notice",
    description:
      "The LMS may experience brief interruptions while routine system maintenance is performed.",
    date: "Aug 14, 2026",
    live: true,
  },
  {
    title: "Assignment Submission Reminder",
    description:
      "Students are reminded to submit pending assignments before the respective due dates.",
    date: "Aug 1, 2026",
    live: true,
  },
  {
    title: "New Learning Resources Available",
    description:
      "New course materials and learning resources have been added to the platform.",
    date: "Jul 28, 2026",
    live: true,
  },
];

const calendarWeeks = [
  ["26", "27", "28", "29", "30", "31", "1"],
  ["2", "3", "4", "5", "6", "7", "8"],
  ["9", "10", "11", "12", "13", "14", "15"],
  ["16", "17", "18", "19", "20", "21", "22"],
  ["23", "24", "25", "26", "27", "28", "29"],
  ["30", "31", "1", "2", "3", "4", "5"],
];

const userDistribution = [
  {
    id: "admin",
    label: "Admins",
    count: 10,
    percentage: 10,
    color: "#7658FF",
  },
  {
    id: "trainer",
    label: "Trainers",
    count: 25,
    percentage: 25,
    color: "#4ADE80",
  },
  {
    id: "student",
    label: "Students",
    count: 65,
    percentage: 65,
    color: "#FBBF24",
  },
];

const PowerfulDashboardSection = () => {
  return (
    <section
      id="dashboard"
      className="relative w-full overflow-hidden bg-background py-24"
    >
      <div className="container mx-auto w-full px-5">
        {/* Heading */}
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary">
            <BarChartIcon className="mr-2 h-4 w-4" />
            Powerful dashboard
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            A powerful workspace for{" "}
            <span className="text-muted-foreground">your entire LMS</span>
          </h2>

          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Manage learners, courses, instructors, enrollments and announcements
            from one focused dashboard built for modern education teams.
          </p>
        </div>

        {/* Dashboard shell */}
        <div className="overflow-hidden rounded-[24px] border  bg-[#111522] shadow-2xl shadow-black/20">
          {/* Fake browser/header */}
          <div className="flex h-12 items-center border-b border-white/8 bg-[#151a29] px-4">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
            </div>

            <div className="mx-auto hidden h-7 max-w-md flex-1 rounded-md border border-white/5 bg-[#1b2131] sm:block" />

            <div className="w-10" />
          </div>

          {/* Dashboard */}
          <div className="p-4 sm:p-6 lg:p-8 bg-background">
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_325px]">
              {/* Left column */}
              <div className="min-w-0">
                {/* Welcome banner */}
                <div className="relative overflow-hidden rounded-[20px] bg-linear-to-br from-[#5c43ef] via-[#7652fa] to-[#9668fa] p-6 sm:p-8">
                  <div className="relative z-10 max-w-2xl">
                    <p className="text-sm font-medium text-white/75">
                      Welcome back
                    </p>

                    <h3 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
                      Muhammad Usman Khan!
                    </h3>

                    <p className="mt-3 max-w-xl text-sm leading-6 text-white/80 sm:text-base">
                      Here&apos;s an overview of your learning platform. Manage
                      students, registrations, leave requests, and other
                      administrative activities from your dashboard.
                    </p>

                    <Button className="mt-6 h-10 rounded-full bg-white px-5 text-sm font-semibold text-[#694cf2] shadow-none hover:bg-white/90">
                      <Plus className="mr-2 h-4 w-4" />
                      Add New Student
                    </Button>
                  </div>

                  {/* Decorative shapes */}
                  <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
                  <div className="pointer-events-none absolute -bottom-24 right-20 h-48 w-48 rounded-full bg-white/5 blur-3xl" />
                </div>

                {/* Stats */}
                <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
                  {stats.map((stat) => {
                    const Icon = stat.icon;

                    return (
                      <Card key={stat.title}>
                        <CardContent className="p-4 sm:p-5">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-[11px] font-medium text-muted-foreground sm:text-xs">
                                {stat.title}
                              </p>

                              <p className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                                {stat.value}
                              </p>

                              <p className="mt-1 text-[10px] text-muted-foreground sm:text-xs">
                                {stat.description}
                              </p>
                            </div>

                            <div
                              className={`rounded-xl bg-white/3 p-2 ${stat.iconClass}`}
                            >
                              <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Recent users */}
                <Card className="mt-5 overflow-hidden">
                  <CardHeader className="border-b border-white/8 px-5 py-5 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          Administration
                        </p>

                        <CardTitle className="text-lg text-foreground">
                          Recent Users
                        </CardTitle>

                        <p className="mt-1 text-xs text-muted-foreground">
                          Latest members who joined your learning platform.
                        </p>
                      </div>

                      <Button size="sm">View All</Button>
                    </div>
                  </CardHeader>

                  {/* Table header */}
                  <div className="hidden grid-cols-[1.8fr_0.7fr_0.8fr_0.8fr] border-b uppercase border-white/8 px-5 py-3 text-[10px] font-semibold text-muted-foreground sm:grid sm:px-6">
                    <span>User</span>
                    <span>Role</span>
                    <span>Status</span>
                    <span className="text-right">Created At</span>
                  </div>

                  <div className="divide-y divide-white/8">
                    {users.map((user) => (
                      <div
                        key={user.name}
                        className="grid gap-3 px-5 py-4 sm:grid-cols-[1.8fr_0.7fr_0.8fr_0.8fr] sm:items-center sm:px-6"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-muted-foreground">
                            {user.initials}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold text-foreground sm:text-sm">
                              {user.name}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {user.phone}
                            </p>
                          </div>
                        </div>

                        <div>
                          <Badge
                            variant="outline"
                            className={`rounded-full border-primary/10 bg-primary/10 px-2.5 py-0.5 text-[9px] ${user.roleClass}`}
                          >
                            {user.role}
                          </Badge>
                        </div>

                        <div>
                          <Badge className="rounded-full border-0 bg-emerald-500/15 px-2.5 py-0.5 text-[9px] text-emerald-400 hover:bg-emerald-500/15">
                            Active
                          </Badge>
                        </div>

                        <div className="text-left text-[10px] text-[#8290af] sm:text-right">
                          Aug 16, 2026
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="overflow-hidden mt-4 shadow-sm hover:shadow-md">
                  <CardHeader className="space-y-1 border-b border-border/50 pb-6 gap-0">
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                      Analytics
                    </p>

                    <CardTitle className="text-xl font-semibold">
                      User Distribution
                    </CardTitle>

                    <p className="text-sm text-muted-foreground">
                      Breakdown of platform users by role.
                    </p>
                  </CardHeader>

                  <CardContent className="flex w-full flex-row gap-8 pt-6">
                    {userDistribution.map((item) => (
                      <div key={item.id} className="w-full space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span
                              className="h-3 w-3 rounded-full ring-4 ring-background"
                              style={{
                                backgroundColor: item.color,
                              }}
                            />

                            <div>
                              <p className="font-medium text-foreground">
                                {item.label}
                              </p>

                              <p className="text-xs text-muted-foreground">
                                {item.percentage}% of users
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="text-lg font-bold text-foreground">
                              {item.count.toLocaleString()}
                            </p>

                            <p className="text-xs text-muted-foreground">
                              Users
                            </p>
                          </div>
                        </div>

                        <div className="h-2.5 overflow-hidden rounded-full bg-secondary">
                          <div
                            className="h-full rounded-full transition-all duration-700 ease-out"
                            style={{
                              width: `${item.percentage}%`,
                              backgroundColor: item.color,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Right column */}
              <div className="space-y-5">
                {/* Calendar */}
                <Card>
                  <CardContent className="p-5 sm:p-6">
                    <div className="flex items-center justify-between">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:bg-white/5 hover:text-white"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>

                      <p className="text-sm font-semibold text-foreground">
                        August 2026
                      </p>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:bg-white/5 hover:text-white"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="mt-6 grid grid-cols-7 gap-y-4 text-center">
                      {["SU", "MO", "TU", "WE", "TH", "FR", "SA"].map((day) => (
                        <span
                          key={day}
                          className="text-[9px] font-medium text-muted-foreground"
                        >
                          {day}
                        </span>
                      ))}

                      {calendarWeeks.flatMap((week, weekIndex) =>
                        week.map((day, dayIndex) => {
                          const isSelected = weekIndex === 3 && dayIndex === 1;
                          const isMuted =
                            (weekIndex === 0 && dayIndex < 6) ||
                            (weekIndex === 5 && dayIndex > 1);

                          return (
                            <div
                              key={`${weekIndex}-${dayIndex}`}
                              className="flex items-center justify-center"
                            >
                              <span
                                className={`flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-medium ${
                                  isSelected
                                    ? "bg-primary text-white shadow-[0_0_0_4px_rgba(115,83,245,0.15)]"
                                    : isMuted
                                      ? "text-muted-foreground/50"
                                      : "text-muted-foreground"
                                }`}
                              >
                                {day}
                              </span>
                            </div>
                          );
                        }),
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Announcements */}
                <Card className="overflow-hidden">
                  <CardHeader className="border-b border-white/8 px-5 py-5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Monday, August 17, 2026
                    </p>

                    <div className="mt-2 flex items-center justify-between">
                      <CardTitle className="text-lg text-foreground">
                        Announcements
                      </CardTitle>

                      <Badge className="border-0 bg-primary/10 text-[9px] text-primary hover:bg-primary/10">
                        4 Items
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="p-0">
                    <div className="divide-y divide-white/8">
                      {announcements.map((announcement) => (
                        <div key={announcement.title} className="relative p-5">
                          <div className="flex gap-3">
                            <div className="relative mt-1 flex h-3 w-3 shrink-0 items-center justify-center">
                              <span className="h-2 w-2 rounded-full bg-emerald-500" />
                              <span className="absolute h-3 w-3 rounded-full bg-emerald-500/15" />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="text-xs font-semibold text-foreground">
                                  {announcement.title}
                                </h4>

                                <Pin className="h-3 w-3 shrink-0 text-amber-400" />
                              </div>

                              <p className="mt-2 line-clamp-2 text-[10px] leading-5 text-muted-foreground">
                                {announcement.description}
                              </p>

                              <div className="mt-2 flex items-center gap-2 text-[9px] text-muted-foreground">
                                <span>{announcement.date}</span>

                                <span>•</span>

                                <span className="text-muted-foreground">
                                  Aug 16, 2026
                                </span>

                                {announcement.live && (
                                  <Badge className="ml-auto rounded-none border-0 bg-emerald-500/15 px-2 py-0.5 text-[8px] text-emerald-400 hover:bg-emerald-500/15">
                                    Live
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-white/8 p-4">
                      <Button
                        variant="ghost"
                        className="h-9 w-full justify-between text-xs text-muted-foreground hover:bg-white/5 hover:text-primary"
                      >
                        View all announcements
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Small supporting feature row */}
        <div className="mx-auto mt-8 grid max-w-5xl grid-cols-1 gap-3 sm:grid-cols-3">
          <DashboardFeature
            icon={CalendarDays}
            title="Stay organized"
            description="Schedules, announcements and activity in one place."
          />

          <DashboardFeature
            icon={CheckCircle2}
            title="Track progress"
            description="Monitor enrollments, completion and learner performance."
          />

          <DashboardFeature
            icon={Bell}
            title="Never miss activity"
            description="Keep instructors and learners aligned with timely updates."
          />
        </div>
      </div>
    </section>
  );
};

const DashboardFeature = ({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) => {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-border/60 bg-card/40 p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>

      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
};

const BarChartIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

export default PowerfulDashboardSection;
