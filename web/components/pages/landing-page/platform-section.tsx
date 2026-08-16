import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Sparkles, MessageSquare, BookOpen, TrendingUp, CheckCircle, Users } from "lucide-react";
import React from "react";

const features = [
  {
    title: "AI Quiz Generation",
    description: "Trainers can quickly generate quizzes and assessments from their course content using AI.",
    icon: Sparkles,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    title: "AI Chat Assistant",
    description: "Learners can ask questions, get explanations, and receive learning support through an intelligent AI assistant.",
    icon: MessageSquare,
    color: "text-blue-500 dark:text-blue-400",
    bgColor: "bg-blue-500/10",
  },
  {
    title: "Course Management",
    description: "Create, organize, and manage courses, lessons, modules, and learning materials with an intuitive builder.",
    icon: BookOpen,
    color: "text-emerald-500 dark:text-emerald-400",
    bgColor: "bg-emerald-500/10",
  },
  {
    title: "Learner Progress Tracking",
    description: "Monitor learner progress, completion rates, performance metrics, and engagement across all batches.",
    icon: TrendingUp,
    color: "text-amber-500 dark:text-amber-400",
    bgColor: "bg-amber-500/10",
  },
  {
    title: "Assessments & Results",
    description: "Manage quizzes, assignments, evaluations, and comprehensive results in one centralized dashboard.",
    icon: CheckCircle,
    color: "text-rose-500 dark:text-rose-400",
    bgColor: "bg-rose-500/10",
  },
  {
    title: "Trainer & Learner Experience",
    description: "Provide dedicated, focused experiences that make teaching efficient and learning frictionless.",
    icon: Users,
    color: "text-purple-500 dark:text-purple-400",
    bgColor: "bg-purple-500/10",
  }
];

const PlatformSection = () => {
  return (
    <section id="platform" className="py-24 container w-full">
      <div className="flex flex-col items-center text-center space-y-4 mb-16 max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
          A platform built for modern learning
        </h2>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Titan LMS provides all the tools trainers need to teach effectively, and the intuitive experience learners need to stay engaged and focused.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, idx) => (
          <Card 
            key={idx} 
            interactive 
            className="h-full border-border/60 bg-card/50 backdrop-blur-sm"
          >
            <CardHeader className="pb-2">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${feature.bgColor} ${feature.color}`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <CardTitle className="text-xl">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base text-muted-foreground">
                {feature.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default PlatformSection;
