import { LucideIcon } from "lucide-react";

export type NavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
  children?: {
    title: string;
    url: string;
    icon?: LucideIcon;
    children?: NavItem["children"];
  }[];
};