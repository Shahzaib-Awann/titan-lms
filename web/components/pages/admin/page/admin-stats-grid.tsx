import { Card, CardContent } from "@/components/ui/card";
import { adminStatCards } from "@/lib/data/admin.mock";

const AdminStatsGrid = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {adminStatCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card
            key={index}
            className="shadow-sm hover:-translate-y-1 transition-all duration-300"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold tracking-tight">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`h-12 w-12 rounded-xl bg-muted flex items-center justify-center ${stat.color} bg-opacity-10`}
                >
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span
                  className={
                    stat.trend.startsWith("+")
                      ? "text-emerald-500 font-medium"
                      : "text-amber-500 font-medium"
                  }
                >
                  {stat.trend}
                </span>
                <span className="text-muted-foreground ml-2">
                  from last month
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default AdminStatsGrid;
