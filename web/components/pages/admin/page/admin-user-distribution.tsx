import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserDistribution } from "@/lib/actions/admin/dashboard.action";

const AdminUserDistribution = async () => {
  const result = await getUserDistribution();

  const data = result.data;
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-5">
        <CardTitle className="text-lg font-semibold">
          User Distribution
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          {data.map((item) => (
            <div key={item.id} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2.5 font-medium text-foreground">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{
                      backgroundColor: item.color,
                    }}
                  />

                  {item.label}
                </span>

                <span className="font-medium text-muted-foreground">
                  {item.count.toLocaleString()} ({item.percentage}%)
                </span>
              </div>

              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminUserDistribution;
