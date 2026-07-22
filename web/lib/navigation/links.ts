import { Role } from "@/types/common";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ClipboardList,
  FileText,
  FolderOpen,
  Calendar,
  Bell,
  BarChart3,
  Settings,
  UserCog,
  MessageSquare,
  Award,
  HelpCircle,
  PenSquare,
  Clock,
  Bookmark,
  UserPlus,
  PlusCircle,
  CalendarCheck,
  Layers,
  GraduationCap,
  ClipboardCheck,
} from "lucide-react";
import { NavItem } from "./types";

export const adminNav: NavItem[] = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: LayoutDashboard,
  },

  {
    title: "User Management",
    url: "#",
    icon: Users,
    children: [
      {
        title: "Students",
        url: "/admin/students",
        children: [
          {
            title: "Create Student",
            url: "/admin/students/create",
          },
        ],
      },

      {
        title: "Trainers",
        url: "/admin/trainers",
        children: [
          {
            title: "Create Trainer",
            url: "/admin/trainers/create",
          },
        ],
      },

      {
        title: "Administration",
        url: "/admin/admins",
        children: [
          {
            title: "Create Admin",
            url: "/admin/admins/create",
          },
        ],
      },
    ],
  },
  {
    title: "Courses",
    url: "/admin/courses",
    icon: BookOpen,
    children: [
      {
        title: "Create Course",
        url: "/admin/courses/create",
      },
    ],
  },

  {
    title: "Batches",
    url: "/admin/batches",
    icon: Layers,
    children: [
      {
        title: "Create Batch",
        url: "/admin/batches/create",
      },
    ],
  },

  {
    title: "Syllabus",
    url: "/admin/syllabus",
    icon: Layers,
    children: [
      {
        title: "Syllabus",
        url: "/admin/syllabus/syllabus",
      },
      {
        title: "Topics",
        url: "/admin/syllabus/topics",
      },
    ],
  },

  {
    title: "Enrollments",
    url: "/admin/enrollments",
    icon: UserPlus,
    children: [
      {
        title: "Active Enrollments",
        url: "/admin/enrollments/active",
      },

      {
        title: "Completed Enrollments",
        url: "/admin/enrollments/completed",
      },
    ],
  },

  {
    title: "Attendance",
    url: "#",
    icon: ClipboardCheck,
    children: [
      {
        title: "Students Attendance",
        url: "/admin/attendance/students",
      },

      {
        title: "Trainers Attendance",
        url: "/admin/attendance/trainers",
      },
    ],
  },

  {
    title: "Learning Management",
    url: "/admin/learning",
    icon: GraduationCap,
    children: [
      {
        title: "Syllabus Topics",
        url: "/admin/learning/topics",
      },

      {
        title: "Sub Topics",
        url: "/admin/learning/subtopics",
      },

      {
        title: "Progress Tracking",
        url: "/admin/learning/progress",
      },
    ],
  },

  {
    title: "Assets",
    url: "/admin/assets",
    icon: FolderOpen,
  },

  {
    title: "Reports",
    url: "/admin/reports",
    icon: BarChart3,
    children: [
      {
        title: "Student Reports",
        url: "/admin/reports/students",
      },

      {
        title: "Trainers Reports",
        url: "/admin/reports/trainers",
      },

      {
        title: "Course Reports",
        url: "/admin/reports/courses",
      },
    ],
  },

  {
    title: "Announcements",
    url: "/admin/announcements",
    icon: Bell,
  },

  {
    title: "Settings",
    url: "/admin/settings",
    icon: Settings,
  },
];

/* ========================================
   TEACHER NAVIGATION
======================================== */

export const trainerNav: NavItem[] = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "My Courses",
    url: "/courses",
    icon: BookOpen,
  },
  {
    title: "Assignments",
    url: "/assignments",
    icon: FileText,
    children: [
      {
        title: "Create Assignment",
        url: "/assignments/create",
      },
      {
        title: "Submissions",
        url: "/assignments/submissions",
      },
    ],
  },
  {
    title: "Quizzes",
    url: "/quizzes",
    icon: ClipboardList,
    children: [
      {
        title: "Create Quiz",
        url: "/quizzes/create",
      },
      {
        title: "AI Quiz Generator",
        url: "/quizzes/ai-generator",
      },
      {
        title: "Results",
        url: "/quizzes/results",
      },
    ],
  },
  {
    title: "Content Library",
    url: "/library",
    icon: FolderOpen,
    children: [
      {
        title: "Assets",
        url: "/library/assets",
      },
      {
        title: "Documents",
        url: "/library/documents",
      },
      {
        title: "Videos",
        url: "/library/videos",
      },
      {
        title: "Uploads",
        url: "/library/uploads",
      },
    ],
  },
  {
    title: "Announcements",
    url: "/announcements",
    icon: Bell,
  },
  {
    title: "Profile",
    url: "/profile",
    icon: UserCog,
  },
];

/* ========================================
   STUDENT NAVIGATION
======================================== */

export const studentNav: NavItem[] = [
  {
    title: "Dashboard",
    url: "/student",
    icon: LayoutDashboard,
  },
  {
    title: "My Courses",
    url: "/student/courses",
    icon: BookOpen,
    children: [
      {
        title: "Enrolled Courses",
        url: "/student/courses",
      },
      {
        title: "Completed Courses",
        url: "/student/courses/completed",
      },
      {
        title: "Bookmarks",
        url: "/student/courses/bookmarks",
      },
    ],
  },
  {
    title: "Assignments",
    url: "/student/assignments",
    icon: FileText,
    children: [
      {
        title: "Pending",
        url: "/student/assignments/pending",
      },
      {
        title: "Submitted",
        url: "/student/assignments/submitted",
      },
      {
        title: "Grades",
        url: "/student/assignments/grades",
      },
    ],
  },
  {
    title: "Quizzes",
    url: "/student/quizzes",
    icon: PenSquare,
    children: [
      {
        title: "Available Quizzes",
        url: "/student/quizzes",
      },
      {
        title: "Attempt History",
        url: "/student/quizzes/history",
      },
      {
        title: "Results",
        url: "/student/quizzes/results",
      },
    ],
  },
  {
    title: "Learning Progress",
    url: "/student/progress",
    icon: BarChart3,
  },
  {
    title: "Certificates",
    url: "/student/certificates",
    icon: Award,
  },
  {
    title: "Schedule",
    url: "/student/schedule",
    icon: Calendar,
  },
  {
    title: "Deadlines",
    url: "/student/deadlines",
    icon: Clock,
  },
  {
    title: "Announcements",
    url: "/student/announcements",
    icon: Bell,
  },
  {
    title: "Messages",
    url: "/student/messages",
    icon: MessageSquare,
  },
  {
    title: "Resources",
    url: "/student/resources",
    icon: Bookmark,
  },
  {
    title: "Help & Support",
    url: "/student/support",
    icon: HelpCircle,
  },
];

const navConfig: Record<Role, NavItem[]> = {
  admin: adminNav,
  trainer: trainerNav,
  student: studentNav,
};

export const getNavByRole = (role?: string): NavItem[] =>
  navConfig[role?.toLowerCase() as Role] ?? [];

export const quickActionsForAdmin = [
  { label: "Add User", icon: UserPlus, url: "/users/create" },
  { label: "Create Course", icon: PlusCircle, url: "/courses/create" },
  {
    label: "Approve Leaves",
    icon: CalendarCheck,
    url: "/attendance/approve-leaves",
  },
  { label: "Manage Instructors", icon: UserCog, url: "/users/trainers" },
  { label: "View Reports", icon: FileText, url: "/reports" },
  { label: "Settings", icon: Settings, url: "/settings" },
];
