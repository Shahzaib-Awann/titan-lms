"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const Navbar = () => {
  const navItems = [
    { label: "Courses", href: "#courses" },
    { label: "Platform", href: "#platform" },
    { label: "Progress", href: "#progress" },
    { label: "Pricing", href: "#pricing" },
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-50 w-full container mx-auto border-b border-white/8] bg-background backdrop-blur-xl">
      <nav className="flex h-20 w-full items-center justify-between px-5">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="relative h-9 w-9 overflow-hidden rounded-full bg-blurple shadow-[0_0_24px_rgba(118,88,255,0.35)]">
            <Image
              src="/titan-logo.jpeg"
              alt="Titan LMS"
              fill
              sizes="36px"
              className="object-cover"
            />
          </div>

          <span className="text-[16px] font-bold tracking-tight text-foreground">
            Titan LMS
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center  gap-8 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="relative py-6 text-sm font-medium text-secondary-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="h-full flex items-center">
          {/* Desktop Actions */}
          <div className="hidden md:flex items-center justify-center gap-4 ">
            <Link href="/sign-in">
              <Button variant="ghost">Sign in</Button>
            </Link>

            <Link href="/#">
              <Button>Start learning</Button>
            </Link>
          </div>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10  rounded-lg text-slate-300 hover:bg-white/10 hover:text-white md:hidden"
                />
              }
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </SheetTrigger>

            <SheetContent side="right" className="w-75">
              <SheetHeader className="border-b border-white/0 pb-5">
                <SheetTitle className="flex items-center gap-2.5 text-white">
                  <div className="relative h-9 w-9 overflow-hidden rounded-full bg-[#7658FF]">
                    <Image
                      src="/titan-logo.jpeg"
                      alt="Titan LMS"
                      fill
                      sizes="36px"
                      className="object-cover"
                    />
                  </div>
                  <span>Titan LMS</span>
                </SheetTitle>
              </SheetHeader>

              <div className="flex flex-col gap-2 pt-6">
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="rounded-xl px-4 py-3 text-sm font-medium text-slate-300 transition-colors hover:bg-white/0 hover:text-white"
                  >
                    {item.label}
                  </Link>
                ))}

                <div className="my-4 h-px bg-white/0" />

                <Link
                  href="/sign-in"
                  className="rounded-xl px-4 py-3 text-sm font-medium text-slate-300 transition-colors hover:bg-white/0 hover:text-white"
                >
                  Sign in
                </Link>

                <Button className="mt-2 h-11 rounded-full bg-linear-to-r from-[#6246ea] to-[#8b5cf6] font-semibold text-white shadow-[0_8px_25px_rgba(118,88,255,0.3)]">
                  <Link href="#">Start learning</Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
