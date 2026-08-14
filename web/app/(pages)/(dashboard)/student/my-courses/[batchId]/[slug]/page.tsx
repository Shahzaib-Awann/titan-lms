import { Card, CardContent } from "@/components/ui/card";
import { Hammer } from "lucide-react";
import React from "react";

const page = async ({
  params,
}: {
  params: Promise<{ batchId: string; slug: string }>;
}) => {
  const { batchId, slug } = await params;

  return (
    <Card>
      <CardContent className="flex min-h-100 items-center justify-center bg-muted/50">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Hammer className="h-8 w-8 text-primary" />
          </div>

          <h1 className="mt-4 text-2xl font-semibold capitalize">
            {slug} Coming Soon
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            This feature is currently under development.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default page;
