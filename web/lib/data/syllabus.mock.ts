import { CourseSyllabusSummary } from "@/types/syllabus";

export const mockCourses: CourseSyllabusSummary[] = [
  {
    id: "c1",
    title: "Full Stack Web Development",
    description:
      "A comprehensive program covering modern frontend and backend technologies including React, Node.js, and PostgreSQL.",
    durationWeeks: 24,
    moduleCount: 12,
    lessonCount: 96,
    hasSyllabus: true,
    batches: [
      {
        id: "b1",
        name: "Jan 2026 Batch",
        trainer: "Ahmed Khan",
        startDate: "Jan 10, 2026",
        studentCount: 25,
        progressPercentage: 85,
      },
      {
        id: "b2",
        name: "Mar 2026 Batch",
        trainer: "Sara Ali",
        startDate: "Mar 5, 2026",
        studentCount: 18,
        progressPercentage: 45,
      },
    ],
  },
  {
    id: "c2",
    title: "UI/UX Design Fundamentals",
    description:
      "Learn the principles of user-centered design, from wireframing to high-fidelity prototypes using Figma.",
    durationWeeks: 12,
    moduleCount: 8,
    lessonCount: 64,
    hasSyllabus: true,
    batches: [
      {
        id: "b3",
        name: "Feb 2026 Batch",
        trainer: "Zara Mahmood",
        startDate: "Feb 1, 2026",
        studentCount: 20,
        progressPercentage: 30,
      },
    ],
  },
  {
    id: "c3",
    title: "Data Science & Machine Learning",
    description:
      "Dive into data analysis, visualization, and predictive modeling using Python, Pandas, and scikit-learn.",
    durationWeeks: 20,
    moduleCount: 10,
    lessonCount: 80,
    hasSyllabus: true,
    batches: [
      {
        id: "b4",
        name: "Apr 2026 Batch",
        trainer: "Omar Farooq",
        startDate: "Apr 15, 2026",
        studentCount: 22,
        progressPercentage: 100,
      },
      {
        id: "b5",
        name: "Jun 2026 Batch",
        trainer: "Nadia Iqbal",
        startDate: "Jun 1, 2026",
        studentCount: 15,
        progressPercentage: 0,
      },
    ],
  },
  {
    id: "c4",
    title: "Mobile App Development with Flutter",
    description:
      "Build cross-platform mobile applications for iOS and Android with a single Dart codebase.",
    durationWeeks: 16,
    moduleCount: 9,
    lessonCount: 72,
    hasSyllabus: false,
    batches: [],
  },
  {
    id: "c5",
    title: "Cloud Computing & DevOps",
    description:
      "Master cloud infrastructure on AWS, containerization with Docker, and CI/CD pipeline automation.",
    durationWeeks: 18,
    moduleCount: 11,
    lessonCount: 88,
    hasSyllabus: true,
    batches: [
      {
        id: "b6",
        name: "May 2026 Batch",
        trainer: "Bilal Hussain",
        startDate: "May 20, 2026",
        studentCount: 12,
        progressPercentage: 62,
      },
    ],
  },
  {
    id: "c6",
    title: "Cybersecurity Essentials",
    description:
      "Learn ethical hacking, network security, penetration testing, and security best practices.",
    durationWeeks: 14,
    moduleCount: 7,
    lessonCount: 56,
    hasSyllabus: false,
    batches: [],
  },
];

