import React from "react";
import { Card, CardContent } from "./ui/card";
import { Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { useSidebar } from "@/components/ui/sidebar";

const SideBarFooter = () => {
  const { state } = useSidebar();

  const collapsed = state === "collapsed";

  return (
    <div
      className={`overflow-hidden transition-all duration-300 ease-in-out ${
        collapsed ? "max-h-0 opacity-0" : "max-h-96 opacity-100"
      }`}
    >
      <Card className="bg-linear-to-br from-primary to-primary/80 text-primary-foreground border-none shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-20">
          <Sparkles className="h-16 w-16" />
        </div>

        <div className="absolute -bottom-6 -left-6 opacity-10">
          <Sparkles className="h-32 w-32" />
        </div>

        <CardContent className="relative z-10 space-y-2 px-5">
          <h3 className="text-xl font-bold text-primary-foreground">
            Need Help?
          </h3>

          <p className="text-sm leading-relaxed font-medium text-primary-foreground/90">
            Learn best practices for managing your LMS.
          </p>

          <Button
            variant="secondary"
            className="mt-2 border-none bg-white/20 text-white hover:bg-white/30"
          >
            View Guide
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SideBarFooter;
