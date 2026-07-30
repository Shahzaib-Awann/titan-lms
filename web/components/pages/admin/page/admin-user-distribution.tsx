import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserDistribution } from "@/lib/actions/dashboard.action";

const AdminUserDistribution = async () => {
  const result = await getUserDistribution();

  const distribution = result.data;

  const totalUsers =
    distribution.admin + distribution.trainer + distribution.student;

  const getPercentage = (value: number) =>
    totalUsers === 0 ? 0 : Math.round((value / totalUsers) * 100);

  const data = [
    {
      id: "admin",
      label: "Admins",
      count: distribution.admin,
      percentage: getPercentage(distribution.admin),
      color: "#7658FF",
    },
    {
      id: "trainer",
      label: "Trainers",
      count: distribution.trainer,
      percentage: getPercentage(distribution.trainer),
      color: "#4ADE80",
    },
    {
      id: "student",
      label: "Students",
      count: distribution.student,
      percentage: getPercentage(distribution.student),
      color: "#FBBF24",
    },
  ];

  return (
    <Card className="overflow-hidden border-border/60 bg-card shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated">
      <CardHeader className="space-y-1 border-b border-border/50 pb-6">
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

      <CardContent className="space-y-6 pt-0">
        {data.map((item) => (
          <div key={item.id} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span
                  className="h-3 w-3 rounded-full ring-4 ring-background"
                  style={{
                    backgroundColor: item.color,
                  }}
                />

                <div>
                  <p className="font-medium text-foreground">{item.label}</p>

                  <p className="text-xs text-muted-foreground">
                    {item.percentage}% of users
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-lg font-bold text-foreground">
                  {item.count.toLocaleString()}
                </p>

                <p className="text-xs text-muted-foreground">Users</p>
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
  );
};

export default AdminUserDistribution;
