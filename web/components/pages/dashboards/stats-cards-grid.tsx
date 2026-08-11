import { AlertCircle, LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

type StatCard = {
  title: string;
  value: number;
  icon: LucideIcon;
  status: string;
  color: string;
};

type StatsGridProps = {
  success: boolean;
  cards: StatCard[];
  className?: string;
};

const DashboardStatsGrid = ({ success, cards, className }: StatsGridProps) => {
  return (
    <div className="space-y-6">
      {!success && (
        <Alert variant="destructive" className="flex flex-row items-center">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            We couldn&apos;t load the latest dashboard statistics.
          </AlertDescription>
        </Alert>
      )}

      <div className={className}>
        {cards.map((stat) => {
          const Icon = stat.icon;

          return (
            <Card
              key={stat.title}
              className="shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>

                    <p className="mt-2 text-3xl font-bold tracking-tight">
                      {stat.value.toLocaleString()}
                    </p>

                    <p className="mt-2 text-sm text-muted-foreground">
                      {stat.status}
                    </p>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardStatsGrid;
