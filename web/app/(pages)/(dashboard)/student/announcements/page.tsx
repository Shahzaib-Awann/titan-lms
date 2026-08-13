import React from "react";
import { Pin, CalendarDays } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { getRoleBasedAnnouncements } from "@/lib/actions/announcements.action";
import { formatDate } from "@/lib/helpers/date-fns";

export default async function AnnouncementsPage() {
  const announcements = await getRoleBasedAnnouncements("student");

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold">Announcements</h1>

      <div className="space-y-6">
        {announcements?.map((item) => (
          <div key={item.id} className="flex gap-5">
            {/* Timeline */}
            <div className="flex flex-col items-center">
              <div
                className={`h-5 w-5 rounded-full border-4 border-background shadow-sm ${
                  item.status === "live" ? "bg-emerald-400" : "bg-blue-400"
                }`}
              />

              <div
                className={`mt-1 w-1 flex-1 rounded-full ${
                  item.status === "live"
                    ? "bg-linear-to-b from-emerald-400 via-emerald-300 to-transparent"
                    : "bg-linear-to-b from-blue-400 via-cyan-300 to-transparent"
                }`}
              />
            </div>

            {/* Card */}
            <Card className="group flex-1 transition-all duration-300 hover:border-primary/20 hover:shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <CardTitle className="text-xl">{item.title}</CardTitle>

                    <div className="flex flex-wrap gap-2">
                      <Badge
                        variant={
                          item.audience === "all" ? "default" : "secondary"
                        }
                        className="uppercase rounded-lg"
                      >
                        {item.audience}
                      </Badge>

                      <Badge
                        variant={
                          item.status === "live"
                            ? "success"
                            : item.status === "scheduled"
                              ? "info"
                              : "destructive"
                        }
                        className="uppercase rounded-lg"
                      >
                        {item.status === "scheduled" ? "Upcoming" : item.status}
                      </Badge>
                    </div>
                  </div>

                  {item.isPinned && (
                    <Pin className="h-5 w-5 fill-amber-500 text-amber-500" />
                  )}
                </div>
              </CardHeader>

              <CardContent>
                <p className="leading-relaxed text-muted-foreground">
                  {item.description}
                </p>

                <Separator className="my-5" />

                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarDays className="h-4 w-4" />
                    <span>
                      {formatDate(item.startDate)}
                      {item.endDate && ` — ${formatDate(item.endDate)}`}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Avatar className="h-9 w-9">
                      <AvatarImage
                        src={item.createdBy.avatarUrl ?? undefined}
                        alt={item.createdBy.name}
                      />
                      <AvatarFallback initial={item.createdBy.name} />
                    </Avatar>

                    <div className="text-sm text-muted-foreground">
                      {item.createdBy.name}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </section>
  );
}
