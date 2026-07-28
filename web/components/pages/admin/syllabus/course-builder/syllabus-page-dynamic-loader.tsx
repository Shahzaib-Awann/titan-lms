"use client";

import dynamic from "next/dynamic";
import { SyllabusModule } from "@/types/syllabus";

const SyllabusClientPage = dynamic(
  () =>
    import("./client-page").then((mod) => ({
      default: mod.SyllabusClientPage,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-100 items-center justify-center">
        Loading syllabus...
      </div>
    ),
  },
);

interface Props {
  course: {
    id: string;
    title: string;
    description: string;
  };
  initialModules: SyllabusModule[];
}

export function DynamicSyllabusLoader({ course, initialModules }: Props) {
  return <SyllabusClientPage course={course} initialModules={initialModules} />;
}
