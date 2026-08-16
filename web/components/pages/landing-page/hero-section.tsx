import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MainBanner } from "@/components/ui/main-banner";
import {
  ArrowRight,
  Sparkles,
  PlayCircle,
  BarChart,
  BookOpen,
  Clock,
  GraduationCap,
  LucideIcon,
  Users,
  CircleCheck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const HeroSection = () => {
  type StatCard = {
    title: string;
    value: number | string;
    icon: LucideIcon;
    status: string;
    color: string;
  };

  const cards: StatCard[] = [
    {
      title: "Courses",
      value: "25+",
      icon: BookOpen,
      status: "All",
      color: "text-primary",
    },
    {
      title: "Instructors",
      value: "100+",
      icon: Users,
      status: "Top Lecturers",
      color: "text-primary",
    },
    {
      title: "Enrollments",
      value: "1000+",
      icon: GraduationCap,
      status: "Youth",
      color: "text-primary",
    },
    {
      title: "Completion Rate",
      value: "95%",
      icon: CircleCheck,
      status: "Best",
      color: "text-primary",
    },
  ];

  return (
    <section
      id="home"
      className="pt-32 pb-16 flex flex-col gap-10 container w-full"
    >
      <MainBanner className="w-full flex-1 min-h-[65vh]">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8 h-full w-full">
          {/* Left Content */}
          <div className="flex-1 flex flex-col items-start space-y-8 z-10 w-full">
            <Badge
              variant="outline"
              className="rounded-full border-white/30 bg-white/10 text-white backdrop-blur-md px-4 py-1.5 text-sm font-medium"
            >
              <Sparkles className="w-4 h-4 mr-2 text-yellow-300" /> New:
              Adaptive Learning Paths
            </Badge>

            <div className="space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-[42px] xl:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
                Learning that keeps its own{" "}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-white to-white/70">
                  momentum
                </span>
              </h1>
              <p className="max-w-xl text-lg sm:text-xl text-white/90 font-normal leading-relaxed">
                Titan LMS brings courses, multiple batches, assignments, quizzes
                and progress into one calm workspace—so students spend their
                energy learning, not navigating.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4 w-full sm:w-auto">
              <Link
                href="/sign-in"
                className="flex items-center justify-center w-full sm:w-auto"
              >
                <Button
                  size="lg"
                  className="h-14 rounded-full flex items-center justify-center w-full sm:w-auto bg-white px-8 text-base font-bold text-blurple shadow-lg hover:bg-white/90 hover:scale-[1.02] transition-all duration-300"
                >
                  Enroll for free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>

              <Link href="/student">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 rounded-full border-white/20 bg-white/5 px-8 text-base font-semibold text-white backdrop-blur-md hover:bg-white/15 hover:border-white/30 hover:text-white hover:scale-[1.02] transition-all duration-300"
                >
                  Explore dashboard
                </Button>
              </Link>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-4 pt-8">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full border-2 border-[#7658FF] bg-card flex items-center justify-center overflow-hidden"
                  >
                    <Image
                      width={100}
                      height={100}
                      src={`https://i.pravatar.cc/100?img=${i + 10}`}
                      alt={`Student ${i}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <div className="text-sm text-white/90 font-medium">
                <span className="text-white font-bold">4.9/5</span> from over
                10,000+ students
              </div>
            </div>
          </div>

          {/* Right Visual - LMS Dashboard Mockup */}
          <div className="flex-1 w-full max-w-xl rounded-xl relative lg:h-125 flex items-center justify-center lg:flex mt-10 lg:mt-0">
            {/* Main floating card */}
            <div className="relative z-20 rounded--lg w-full bg-card rounded-[24px] shadow-elevated border border-border/50 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
              {/* Header */}
              <div className="p-5 border-b border-border/50 flex  items-center justify-between bg-muted/30 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">
                      Advanced React Patterns
                    </h3>
                    <p className="text-sm text-muted-foreground font-medium">
                      Module 4: Performance
                    </p>
                  </div>
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none font-semibold">
                  75% Complete
                </Badge>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Progress */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground font-medium">
                      Current Progress
                    </span>
                    <span className="text-foreground font-semibold">
                      12/16 Lessons
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-secondary overflow-hidden">
                    <div className="w-[75%] h-full bg-primary rounded-full relative">
                      <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full"></div>
                    </div>
                  </div>
                </div>

                {/* Modules list */}
                <div className="space-y-3">
                  {[
                    {
                      title: "React Context Deep Dive",
                      time: "45 mins",
                      active: true,
                      icon: PlayCircle,
                    },
                    {
                      title: "Memoization Strategies",
                      time: "30 mins",
                      active: false,
                      icon: Clock,
                    },
                    {
                      title: "Concurrent Features",
                      time: "55 mins",
                      active: false,
                      icon: Clock,
                    },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center justify-between p-3.5 rounded-2xl transition-colors ${item.active ? "bg-primary/10 border border-primary/20" : "bg-background border border-transparent hover:border-border"}`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center ${item.active ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30" : "bg-muted text-muted-foreground"}`}
                        >
                          <item.icon className="w-4 h-4" />
                        </div>
                        <span
                          className={`text-sm font-semibold ${item.active ? "text-foreground" : "text-foreground/80"}`}
                        >
                          {item.title}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground font-medium">
                        {item.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating elements */}
            <div className="absolute -right-6 top-12 z-30 bg-card p-4 rounded-2xl shadow-xl border border-border/50 flex items-center gap-4 animate-in fade-in zoom-in duration-1000 delay-300 ease-out">
              <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-600 dark:text-yellow-400">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium mb-0.5">
                  Achievement Unlocked
                </p>
                <p className="text-sm text-foreground font-bold">
                  Fast Learner
                </p>
              </div>
            </div>

            <div className="absolute -left-8 bottom-20 z-30 bg-card p-5 rounded-2xl shadow-xl border border-border/50 flex flex-col gap-3 animate-in fade-in zoom-in duration-1000 delay-500 ease-out">
              <div className="flex items-center gap-2">
                <BarChart className="w-5 h-5 text-emerald-500" />
                <span className="text-sm font-semibold text-foreground">
                  Weekly Activity
                </span>
              </div>
              <div className="flex items-end gap-2 h-16 mt-1">
                {[40, 70, 45, 90, 60, 30, 80].map((h, i) => (
                  <div
                    key={i}
                    className={`w-3.5 rounded-t-sm transition-all duration-500 ${i === 3 ? "bg-primary" : "bg-primary/20"}`}
                    style={{ height: `${h}%` }}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </MainBanner>

      <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/50 p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:bg-card/70 hover:shadow-lg hover:shadow-primary/5"
            >
              {/* Subtle glow */}
              <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/5 blur-2xl transition-all duration-300 group-hover:bg-primary/10" />

              <div className="relative flex items-start justify-between">
                {/* Icon */}
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-105">
                  <Icon className="h-5 w-5" />
                </div>

                {/* Status */}
                <span className="rounded-full border border-border/60 bg-background/50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {card.status}
                </span>
              </div>

              {/* Stat */}
              <div className="relative mt-5">
                <p className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {card.value}
                </p>

                <p className="mt-1 text-sm font-medium text-muted-foreground">
                  {card.title}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default HeroSection;
