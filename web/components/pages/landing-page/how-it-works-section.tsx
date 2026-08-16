import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { BookOpen, Sparkles, LineChart } from "lucide-react";
import React from "react";

const steps = [
  {
    step: "1",
    title: "Create & Organize",
    description:
      "Admin can create courses, Trainers can upload learning materials, organize lessons, and build assessments.",
    icon: BookOpen,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    step: "2",
    title: "Teach & Engage",
    description:
      "Learners complete lessons and use the AI Chat Assistant for instant support, while trainers use AI Quiz Generation.",
    icon: Sparkles,
    color: "text-emerald-500 dark:text-emerald-400",
    bgColor: "bg-emerald-500/10",
  },
  {
    step: "3",
    title: "Track & Improve",
    description:
      "Trainers monitor learner progress, performance, quiz results, and engagement to continuously improve the experience.",
    icon: LineChart,
    color: "text-amber-500 dark:text-amber-400",
    bgColor: "bg-amber-500/10",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-24 container w-full relative">
      <div className="flex flex-col items-center text-center space-y-4 mb-16 max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
          How Titan LMS works
        </h2>
        <p className="text-lg text-muted-foreground leading-relaxed">
          From course creation to learner success, we&apos;ve streamlined the
          entire educational process into three simple steps.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
        {/* Decorative connecting line behind cards */}
        <div className="hidden md:block absolute top-[5.5rem] left-[16%] right-[16%] h-px bg-border z-0" />

        {steps.map((item, idx) => (
          <Card
            key={idx}
            interactive
            className="relative z-10 border-border/60 bg-card/50 backdrop-blur-sm h-full"
          >
            <CardHeader className="justify-items-center text-center pb-4">
              <div className="relative mb-4">
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center ${item.bgColor} ${item.color}`}
                >
                  <item.icon className="w-8 h-8" />
                </div>
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center text-sm font-extrabold shadow-sm border-[3px] border-card">
                  {item.step}
                </div>
              </div>
              <CardTitle className="text-xl">{item.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription className="text-base text-muted-foreground">
                {item.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default HowItWorksSection;
