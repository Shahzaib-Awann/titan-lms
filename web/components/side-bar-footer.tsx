import React from "react";
import { Card, CardContent } from "./ui/card";
import { Sparkles } from "lucide-react";
import { Button } from "./ui/button";

const SideBarFooter = () => {
  return (
    <Card className="bg-linear-to-br from-primary to-primary/80 text-primary-foreground border-none shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-20">
        <Sparkles className="w-16 h-16" />
      </div>

      <div className="absolute -bottom-6 -left-6 opacity-10">
        <Sparkles className="w-32 h-32" />
      </div>

      <CardContent className="px-5 space-y-2 relative z-10">
        <h3 className="font-bold text-primary-foreground text-xl">
          Need Help?
        </h3>

        <p className="text-sm text-primary-foreground/90 font-medium leading-relaxed">
          Learn best practices for managing your LMS.
        </p>

        <Button
          variant="secondary"
          className="bg-white/20 hover:bg-white/30 text-white border-none mt-2"
        >
          View Guide
        </Button>
      </CardContent>
    </Card>
  );
};

export default SideBarFooter;
