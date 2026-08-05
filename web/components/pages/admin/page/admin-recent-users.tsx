import Link from "next/link";
import React from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { getRecentUsers } from "@/lib/actions/dashboard.action";
import { cn } from "@/lib/utils";

const AdminRecentUsers = async () => {
  const result = await getRecentUsers();

  if (!result.success) {
    return (
      <Card className="flex-1 border-border/60 shadow-card">
        <CardHeader>
          <CardTitle>Recent Users</CardTitle>
          <CardDescription>Unable to load recent users.</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex h-56 items-center justify-center rounded-xl border border-dashed border-border bg-muted/20">
            <div className="space-y-2 text-center">
              <p className="font-medium text-foreground">
                Something went wrong
              </p>

              <p className="text-sm text-muted-foreground">
                {result.message ?? "Please try again later."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const users = result.data;

  return (
    <Card className="flex-1 overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md">
      <CardContent className="p-0">
        <CardHeader className="border-b border-border/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Administration
              </p>

              <CardTitle className="mt-2 text-2xl">Recent Users</CardTitle>

              <CardDescription className="mt-2">
                Latest members who joined your learning platform.
              </CardDescription>
            </div>

            <Link href="/admin/students">
              <Button>View All</Button>
            </Link>
          </div>
        </CardHeader>

        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="px-6 py-2">User</TableHead>

              <TableHead>Role</TableHead>

              <TableHead>Status</TableHead>

              <TableHead className="px-6 text-right">Joined</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {users.map((user) => (
              <TableRow
                key={user.id}
                className="border-border/40 transition-all duration-200 hover:bg-accent/30"
              >
                <TableCell className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-11 w-11 border border-primary/15 bg-primary/10">
                      <AvatarFallback
                        initial={user.name}
                        className="bg-primary/10 font-semibold text-primary"
                      />
                    </Avatar>

                    <div>
                      <p className="font-semibold text-foreground">
                        {user.name}
                      </p>

                      <p className="text-sm text-muted-foreground">
                        {user.cnic}
                      </p>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <Badge
                    variant="outline"
                    className="rounded-full border-primary/20 bg-primary/10 text-primary"
                  >
                    {user.role}
                  </Badge>
                </TableCell>

                <TableCell>
                  <Badge
                    className={cn(
                      "rounded-full",
                      user.status === "Active"
                        ? "border-0 bg-green/15 text-green"
                        : user.status === "Pending"
                          ? "border-0 bg-yellow/15 text-yellow"
                          : "border-0 bg-red/15 text-red",
                    )}
                  >
                    {user.status}
                  </Badge>
                </TableCell>

                <TableCell className="px-6 text-right text-sm text-muted-foreground">
                  {user.joinDate}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {users.length === 0 && (
          <div className="flex h-56 items-center justify-center border-t border-border">
            <div className="space-y-2 text-center">
              <p className="font-medium">No users yet</p>

              <p className="text-sm text-muted-foreground">
                New registrations will appear here.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminRecentUsers;
