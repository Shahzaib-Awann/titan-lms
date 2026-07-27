// app/admin/syllabus/[courseId]/page.tsx

import { SyllabusClientPage } from "./_components/client-page";
import { ModuleWithLessons } from "./_types/syllabus";

interface PageProps {
  params: Promise<{
    courseId: string;
  }>;
}

export default async function CourseSyllabusPage({ params }: PageProps) {
  const { courseId } = await params;

  // Mock initial data matching Drizzle schema struct
  const initialModules: ModuleWithLessons[] = [
    {
      id: "module-1",
      title: "Introduction to Web Development",
      description:
        "Learn the fundamentals of web development, including how websites work and the technologies used to build them.",
      orderIndex: 0,
      lessons: [
        {
          id: "lesson-1",
          title: "What is Web Development?",
          description:
            "Understand the basics of web development and the difference between frontend and backend development.",
          orderIndex: 0,
        },
        {
          id: "lesson-2",
          title: "How the Internet Works",
          description:
            "Learn about browsers, servers, HTTP requests, and how web pages are delivered to users.",
          orderIndex: 1,
        },
      ],
    },
    {
      id: "module-2",
      title: "Frontend Development Basics",
      description:
        "Explore the core technologies used to create interactive and responsive user interfaces.",
      orderIndex: 1,
      lessons: [
        {
          id: "lesson-3",
          title: "HTML Fundamentals",
          description:
            "Learn how to structure web pages using semantic HTML elements.",
          orderIndex: 0,
        },
        {
          id: "lesson-4",
          title: "CSS Styling Essentials",
          description:
            "Understand CSS basics, layouts, colors, and responsive design techniques.",
          orderIndex: 1,
        },
        {
          id: "lesson-5",
          title: "JavaScript Introduction",
          description:
            "Learn JavaScript fundamentals and how to add interactivity to websites.",
          orderIndex: 2,
        },
      ],
    },
    {
      id: "module-3",
      title: "Building Modern Applications",
      description:
        "Learn advanced concepts for creating scalable and maintainable web applications.",
      orderIndex: 2,
      lessons: [
        {
          id: "lesson-6",
          title: "Working with APIs",
          description:
            "Understand how frontend applications communicate with backend services.",
          orderIndex: 0,
        },
        {
          id: "lesson-7",
          title: "Introduction to React",
          description:
            "Learn the basics of React components, props, and state management.",
          orderIndex: 1,
        },
        {
          id: "lesson-8",
          title: "Deploying Applications",
          description:
            "Learn how to deploy web applications and make them available online.",
          orderIndex: 2,
        },
      ],
    },
  ];

  const courseInfo = {
    id: courseId,
    title: "Web Development Course",
    description: "Learn web development from scratch",
  };

  if (!initialModules) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Course not found
      </div>
    );
  }

  return (
    <SyllabusClientPage course={courseInfo} initialModules={initialModules} />
  );
}
