import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Users, LibraryBig, FileText } from "lucide-react";

interface SyllabusStatsCardsProps {
  stats: {
    courseCount: number;
    moduleCount: number;
    lessonCount: number;
    activeBatches: number;
  };
}
export function SyllabusStatsCards({ stats }: SyllabusStatsCardsProps) {
  const cards = [
    {
      title: "Total Courses",
      value: stats.courseCount,
      description: "Courses with syllabus",
      icon: BookOpen,
      iconColor: "text-primary",
      iconBg: "bg-primary/15",
    },
    {
      title: "Total Modules",
      value: stats.moduleCount,
      description: "Course modules",
      icon: LibraryBig,
      iconColor: "text-green-600",
      iconBg: "bg-green-500/15",
    },
    {
      title: "Total Lessons",
      value: stats.lessonCount,
      description: "Lessons across modules",
      icon: FileText,
      iconColor: "text-blue-500",
      iconBg: "bg-blue-500/15",
    },
    {
      title: "Active Batches",
      value: stats.activeBatches,
      description: "Running course batches",
      icon: Users,
      iconColor: "text-blue-500",
      iconBg: "bg-blue-500/15",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <Card
            key={card.title}
            className="shadow-sm hover:-translate-y-1 transition-all duration-300"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    {card.title}
                  </p>

                  <p className="text-3xl font-bold tracking-tight text-foreground">
                    {card.value}
                  </p>
                </div>

                <div
                  className={`
                    flex
                    size-12
                    items-center
                    justify-center
                    rounded-xl
                    ${card.iconBg}
                    transition-transform
                    duration-250
                    group-hover/stat:scale-110
                  `}
                >
                  <Icon
                    className={`
                      size-5
                      ${card.iconColor}
                    `}
                  />
                </div>
              </div>

              <div className="mt-5 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />

                <p className="text-xs font-medium text-muted-foreground">
                  {card.description}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
