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
} from "lucide-react";
import { NavItem } from "./types";

/* ========================================
   ADMIN NAVIGATION
======================================== */
export const adminNav: NavItem[] = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Students",
    url: "/students",
    icon: Users,
    children: [
      {
        title: "Create Student",
        url: "/students/create",
      },
    ],
  },
  {
    title: "Trainers",
    url: "/trainers",
    icon: Users,
    children: [
      {
        title: "Create Trainers",
        url: "/trainers/create",
      },
    ],
  },
  {
    title: "Admins",
    url: "/admins",
    icon: Users,
    children: [
      {
        title: "Create Admin",
        url: "/admins/create",
      },
    ],
  },
  {
    title: "Courses",
    url: "/courses",
    icon: BookOpen,
    children: [
      {
        title: "Create Course",
        url: "/courses/create",
      },
      {
        title: "Enrollments",
        url: "/courses/enrollments",
      },
    ],
  },
  {
    title: "Attendance",
    url: "/attendance",
    icon: BookOpen,
    children: [
      {
        title: "Mark Student Attendance",
        url: "/attendance/mark-student",
      },
      {
        title: "Mark Trainer Attendance",
        url: "/attendance/mark-trainer",
      },
    ],
  },
  {
    title: "Certificates",
    url: "/certificates",
    icon: Award,
  },
  {
    title: "Announcements",
    url: "/announcements",
    icon: Bell,
  },
  {
    title: "Reports & Analytics",
    url: "/reports",
    icon: BarChart3,
    children: [
      {
        title: "Course Reports",
        url: "/reports/courses",
      },
      {
        title: "Student Performance",
        url: "/reports/students",
      },
      {
        title: "Teacher Performance",
        url: "/reports/teachers",
      },
      {
        title: "Attendance Reports",
        url: "/attendance/reports",
      },
    ],
  },
  {
    title: "Settings",
    url: "/settings",
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
  { label: "Approve Leaves", icon: CalendarCheck, url: "/attendance/approve-leaves" },
  { label: "Manage Instructors", icon: UserCog, url: "/users/trainers" },
  { label: "View Reports", icon: FileText, url: "/reports" },
  { label: "Settings", icon: Settings, url: "/settings" },
];