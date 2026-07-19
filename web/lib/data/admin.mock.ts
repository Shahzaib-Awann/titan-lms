import {
  Activity,
  Book,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  FileText,
  UserCog,
  Users,
} from "lucide-react";

export const adminStatCards = [
  {
    title: "Total Users",
    value: "12,450",
    icon: Users,
    trend: "+12%",
    color: "text-primary",
  },
  {
    title: "Total Courses",
    value: "342",
    icon: BookOpen,
    trend: "+4%",
    color: "text-primary",
  },
  {
    title: "Pending Leave Approvals",
    value: "24",
    icon: CalendarCheck,
    trend: "-2",
    color: "text-amber-500",
  },
  {
    title: "Active Instructors",
    value: "186",
    icon: UserCog,
    trend: "+2",
    color: "text-emerald-500",
  },
];

export const adminRecentUsers = [
  {
    id: 1,
    name: "Alice Johnson",
    role: "Student",
    email: "alice@example.com",
    status: "Active",
    joinDate: "Oct 24, 2023",
  },
  {
    id: 2,
    name: "Michael Chang",
    role: "Instructor",
    email: "michael@example.com",
    status: "Active",
    joinDate: "Oct 23, 2023",
  },
  {
    id: 3,
    name: "Sarah Williams",
    role: "Student",
    email: "sarah@example.com",
    status: "Pending",
    joinDate: "Oct 23, 2023",
  },
  {
    id: 4,
    name: "David Miller",
    role: "Admin",
    email: "david@example.com",
    status: "Active",
    joinDate: "Oct 22, 2023",
  },
  {
    id: 5,
    name: "Emma Wilson",
    role: "Student",
    email: "emma@example.com",
    status: "Inactive",
    joinDate: "Oct 21, 2023",
  },
];

export const adminRecentActivity = [
  {
    id: 1,
    text: "System backup completed successfully.",
    time: "10 mins ago",
    icon: CheckCircle2,
    type: "success",
  },
  {
    id: 2,
    text: "New course 'Advanced React' published by Michael Chang.",
    time: "2 hours ago",
    icon: Book,
    type: "info",
  },
  {
    id: 3,
    text: "High server CPU usage detected.",
    time: "4 hours ago",
    icon: Activity,
    type: "warning",
  },
  {
    id: 4,
    text: "50 new users imported from CSV.",
    time: "5 hours ago",
    icon: Users,
    type: "info",
  },
  {
    id: 5,
    text: "Weekly analytics report generated.",
    time: "1 day ago",
    icon: FileText,
    type: "success",
  },
];

export const adminUserDistribution = [
  {
    id: 1,
    label: "Students",
    count: 8245,
    percentage: 95,
    color: "#7658FF",
  },
  {
    id: 2,
    label: "Instructors",
    count: 186,
    percentage: 3,
    color: "#22C55E",
  },
  {
    id: 3,
    label: "Admins",
    count: 19,
    percentage: 2,
    color: "#F59E0B",
  },
];
