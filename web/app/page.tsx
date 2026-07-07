import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetTrigger,
  SheetBody,
} from "@/components/ui/sheet";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-background font-sans">
      <Sheet>
        <SheetTrigger>
            Open Menu
        </SheetTrigger>

        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Titan LMS</SheetTitle>
            <SheetDescription>
              Learning dashboard navigation
            </SheetDescription>
          </SheetHeader>

          <SheetBody>
            <div className="mt-6 flex flex-col gap-2">
            {[
    "Dashboard",
    "My Courses",
    "Assignments",
    "Quizzes",
    "Calendar",
    "Messages",
    "Community",
    "Certificates",
    "Settings",
  ].map((item) => (
              <Button
                key={item}
                variant="ghost"
                className="justify-start"
              >
                {item}
              </Button>
            ))}
          </div>
          </SheetBody>

          <SheetFooter className="mt-auto">
            <Button className="w-full">
              Logout
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
