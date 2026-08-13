import { Role } from "@/types/common";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FolderOpen,
  Calendar,
  Bell,
  BarChart3,
  Settings,
  UserCog,
  Award,
  Clock,
  UserPlus,
  Layers,
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
  },

  {
    title: "Enrollments",
    url: "/admin/enrollments",
    icon: UserPlus,
    children: [
      {
        title: "Bulk Enrollments",
        url: "/admin/enrollments/create",
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
    title: "Announcements",
    url: "/admin/announcements",
    icon: Bell,
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
    url: "/trainer",
    icon: LayoutDashboard,
  },
  {
    title: "My Batches",
    url: "/trainer/batches",
    icon: BookOpen,
  },
  {
    title: "Schedule",
    url: "/trainer/schedule",
    icon: Clock,
  },
  {
    title: "Announcements",
    url: "/trainer/announcements",
    icon: Bell,
  },
  {
    title: "Profile",
    url: "/trainer/profile",
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
    url: "/student/my-courses",
    icon: BookOpen,
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
    title: "Announcements",
    url: "/student/announcements",
    icon: Bell,
  },
  {
    title: "Profile",
    url: "/student/profile",
    icon: UserCog,
  },
];

const navConfig: Record<Role, NavItem[]> = {
  admin: adminNav,
  trainer: trainerNav,
  student: studentNav,
};

export const getNavByRole = (role?: string): NavItem[] =>
  navConfig[role?.toLowerCase() as Role] ?? [];
