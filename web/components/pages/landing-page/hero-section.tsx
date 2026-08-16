import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MainBanner } from "@/components/ui/main-banner";
import { ArrowRight, SparkleIcon } from "lucide-react";
import Link from "next/link";
import React from "react";

const HeroSection = () => {
  return (
    <div className="pt-30 flex container w-full">
      <MainBanner className="w-full flex-1 min-h-[50vh] space-y-5">
        <Badge
          variant="outline"
          className="rounded-full border-primary-foreground hover:bg-transparent"
        >
          <SparkleIcon /> New: Adaptive Learning Paths
        </Badge>

        <h1 className="text-6xl max-w-5xl mt-5">
          Learning that keeps its own momementum
        </h1>
        <p className="max-w-2xl mt-6 text-lg text-secondary-foreground">
          Titan LMS brings courses, multiple batches, assignments, quizzes and
          progress into one calm workspace - so student spend their energy
          learning, not navigating{" "}
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button
            size="lg"
            className="h-12 rounded-full bg-white px-7 text-sm font-semibold text-[#6048ee] shadow-lg shadow-black/10 hover:bg-white/90"
          >
            <Link href="/sign-in" className="flex flex-row gap-2 items-center">
              Enroll for free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>

          <Link href="/student">
            <Button
              size="lg"
              variant="outline"
              className="h-12 rounded-full border-transparent hover:border-primary-foreground bg-white/8 px-7 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/15 hover:text-white"
            >
              Explore the dashboard
            </Button>
          </Link>
        </div>
      </MainBanner>
    </div>
  );
};

export default HeroSection;
