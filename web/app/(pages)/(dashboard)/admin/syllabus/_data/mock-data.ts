// Mock data types and data for the Syllabus Management Dashboard

export type SyllabusStatus = "published" | "draft" | "not_created";

export interface BatchProgress {
  id: string;
  name: string;
  trainer: string;
  startDate: string;
  students: number;
  progress: number;
}

export interface CourseSyllabus {
  id: string;
  title: string;
  description: string;
  durationWeeks: number;
  totalModules: number;
  totalLessons: number;
  hasSyllabus: boolean;
  batches: BatchProgress[];
}

export const mockCourses: CourseSyllabus[] = [
  {
    id: "c1",
    title: "Full Stack Web Development",
    description:
      "A comprehensive program covering modern frontend and backend technologies including React, Node.js, and PostgreSQL.",
    durationWeeks: 24,
    totalModules: 12,
    totalLessons: 96,
    hasSyllabus: true,
    batches: [
      {
        id: "b1",
        name: "Jan 2026 Batch",
        trainer: "Ahmed Khan",
        startDate: "Jan 10, 2026",
        students: 25,
        progress: 85,
      },
      {
        id: "b2",
        name: "Mar 2026 Batch",
        trainer: "Sara Ali",
        startDate: "Mar 5, 2026",
        students: 18,
        progress: 45,
      },
    ],
  },
  {
    id: "c2",
    title: "UI/UX Design Fundamentals",
    description:
      "Learn the principles of user-centered design, from wireframing to high-fidelity prototypes using Figma.",
    durationWeeks: 12,
    totalModules: 8,
    totalLessons: 64,
    hasSyllabus: true,
    batches: [
      {
        id: "b3",
        name: "Feb 2026 Batch",
        trainer: "Zara Mahmood",
        startDate: "Feb 1, 2026",
        students: 20,
        progress: 30,
      },
    ],
  },
  {
    id: "c3",
    title: "Data Science & Machine Learning",
    description:
      "Dive into data analysis, visualization, and predictive modeling using Python, Pandas, and scikit-learn.",
    durationWeeks: 20,
    totalModules: 10,
    totalLessons: 80,
    hasSyllabus: true,
    batches: [
      {
        id: "b4",
        name: "Apr 2026 Batch",
        trainer: "Omar Farooq",
        startDate: "Apr 15, 2026",
        students: 22,
        progress: 100,
      },
      {
        id: "b5",
        name: "Jun 2026 Batch",
        trainer: "Nadia Iqbal",
        startDate: "Jun 1, 2026",
        students: 15,
        progress: 0,
      },
    ],
  },
  {
    id: "c4",
    title: "Mobile App Development with Flutter",
    description:
      "Build cross-platform mobile applications for iOS and Android with a single Dart codebase.",
    durationWeeks: 16,
    totalModules: 9,
    totalLessons: 72,
    hasSyllabus: false,
    batches: [],
  },
  {
    id: "c5",
    title: "Cloud Computing & DevOps",
    description:
      "Master cloud infrastructure on AWS, containerization with Docker, and CI/CD pipeline automation.",
    durationWeeks: 18,
    totalModules: 11,
    totalLessons: 88,
    hasSyllabus: true,
    batches: [
      {
        id: "b6",
        name: "May 2026 Batch",
        trainer: "Bilal Hussain",
        startDate: "May 20, 2026",
        students: 12,
        progress: 62,
      },
    ],
  },
  {
    id: "c6",
    title: "Cybersecurity Essentials",
    description:
      "Learn ethical hacking, network security, penetration testing, and security best practices.",
    durationWeeks: 14,
    totalModules: 7,
    totalLessons: 56,
    hasSyllabus: false,
    batches: [],
  },
];

export interface SyllabusStats {
  totalCourses: number;
  activeBatches: number;
}

export function computeStats(courses: CourseSyllabus[]): SyllabusStats {
  const activeBatches = courses.reduce((acc, c) => acc + c.batches.length, 0);

  return {
    totalCourses: courses.length,
    activeBatches,
  };
}
