import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, BookMarked, FileEdit, Users } from "lucide-react";
import { SyllabusStats } from "../_data/mock-data";

interface SyllabusStatsCardsProps {
  stats: SyllabusStats;
}

interface StatCardConfig {
  title: string;
  value: number;
  description: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
}

export function SyllabusStatsCards({ stats }: SyllabusStatsCardsProps) {
  const cards: StatCardConfig[] = [
    {
      title: "Total Courses",
      value: stats.totalCourses,
      description: "Courses in the system",
      icon: BookOpen,
      iconColor: "text-primary",
      iconBg: "bg-primary/15",
    },
    {
      title: "Syllabus Created",
      value: 0,
      description: "Published & draft syllabuses",
      icon: BookMarked,
      iconColor: "text-green",
      iconBg: "bg-green/15",
    },
    {
      title: "Draft Syllabus",
      value: 0,
      description: "Awaiting finalization",
      icon: FileEdit,
      iconColor: "text-yellow",
      iconBg: "bg-yellow/15",
    },
    {
      title: "Active Batches",
      value: stats.activeBatches,
      description: "Running course batches",
      icon: Users,
      iconColor: "text-blue-400",
      iconBg: "bg-blue-400/15",
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
