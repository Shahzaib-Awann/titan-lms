import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React from "react";
import { Button } from "@/components/ui/button";
import { adminRecentUsers } from "@/lib/data/admin.mock";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const AdminRecentUsers = () => {
  return (
    <Card className="shadow-sm overflow-hidden flex-1">
      <CardHeader className="px-6 py-5 border-b border-border/40 bg-muted/10">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold">
              Recent Users
            </CardTitle>
            <CardDescription className="mt-1">
              Latest users joined the platform
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" className="rounded-lg h-9">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-muted/5">
            <TableRow className="border-border/40 hover:bg-transparent">
              <TableHead className="font-semibold px-6 py-4">User</TableHead>
              <TableHead className="font-semibold py-4">Role</TableHead>
              <TableHead className="font-semibold py-4">Status</TableHead>
              <TableHead className="font-semibold px-6 py-4 text-right">
                Join Date
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {adminRecentUsers.map((user) => (
              <TableRow
                key={user.id}
                className="border-border/40 hover:bg-muted/30 transition-colors"
              >
                <TableCell className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-border/50">
                      <AvatarFallback
                        initial={user.name}
                        className="bg-primary/10 text-primary font-semibold text-sm"
                      />
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium">{user.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {user.email}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4 text-muted-foreground font-medium">
                  <span className="text-sm">{user.role}</span>
                </TableCell>
                <TableCell className="py-4">
                  <Badge
                    variant="secondary"
                    className={`rounded-md px-2.5 py-0.5 font-medium border-0
                            ${
                              user.status === "Active"
                                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                : user.status === "Pending"
                                  ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                                  : "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                            }`}
                  >
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell className="px-6 py-4 text-right text-sm text-muted-foreground">
                  {user.joinDate}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default AdminRecentUsers;
