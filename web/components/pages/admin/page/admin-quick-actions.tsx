import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { quickActionsForAdmin } from "@/lib/navigation/links";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const AdminQuickActions = () => {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap justify-center gap-3">
          {quickActionsForAdmin.map((action, i) => {
            const Icon = action.icon;
            return (
              <Link href={action.url} key={i}>
                <Button
                  variant="outline"
                  className="h-12 justify-start px-4 rounded-xl border-border/60 hover:border-primary/50 hover:bg-primary/5 transition-all group shadow-sm"
                >
                  <Icon className="mr-3 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="font-medium text-sm text-foreground">
                    {action.label}
                  </span>
                </Button>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminQuickActions;
