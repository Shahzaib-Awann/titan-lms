"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const footerLinks = {
  Platform: [
    { label: "Courses", href: "#courses" },
    { label: "AI Features", href: "#ai-features" },
    { label: "Progress Tracking", href: "#progress" },
    { label: "Assessments", href: "#assessments" },
    { label: "AI Chat Assistant", href: "#ai-features" },
  ],
  Company: [
    { label: "About", href: "https://shahzaibawan.site" },
    { label: "Contact", href: "https://shahzaibawan.site/contact" },
    { label: "Pricing", href: "https://shahzaibawan.site/contact" },
    { label: "FAQ", href: "https://shahzaibawan.site/contact" },
  ],
  Resources: [
    { label: "Help Center", href: "https://shahzaibawan.site/" },
    { label: "Documentation", href: "#documentation" },
    { label: "Support", href: "#support" },
    { label: "Community", href: "#community" },
  ],
};

const Footer = () => {
  return (
    <footer className="relative border-t border-white/10 bg-background w-full container mx-auto">
      {/* Subtle top glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[#7658FF]/50 to-transparent" />

      <div className="container mx-auto px-5">
        {/* Main footer */}
        <div className="grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.6fr_repeat(3,1fr)] lg:gap-10 lg:py-20">
          {/* Brand */}
          <div className="max-w-sm">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="relative h-9 w-9 overflow-hidden rounded-full bg-[#7658FF] shadow-[0_0_24px_rgba(118,88,255,0.25)]">
                <Image
                  src="/titan-logo.jpeg"
                  alt="Titan LMS"
                  fill
                  sizes="36px"
                  className="object-cover"
                />
              </div>

              <span className="text-[16px] font-bold tracking-tight text-white">
                Titan LMS
              </span>
            </Link>

            <p className="mt-5 max-w-xs text-sm leading-6 text-slate-400">
              A modern learning platform built to help trainers teach better and
              learners learn smarter.
            </p>
          </div>

          {/* Footer links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-semibold text-white">{title}</h3>

              <ul className="mt-5 space-y-3.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="group inline-flex items-center gap-1 text-sm text-slate-400 transition-colors hover:text-white"
                    >
                      {link.label}

                      <ArrowUpRight className="h-3 w-3 opacity-0 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-70" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mb-10 overflow-hidden rounded-2xl border border-white/10 bg-white/3">
          <div className="flex flex-col gap-5 px-6 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div>
              <h3 className="text-base font-semibold text-white">
                Ready to transform the way you learn?
              </h3>

              <p className="mt-1.5 text-sm text-slate-400">
                Start learning with Titan LMS today.
              </p>
            </div>

            <Link
              href="#"
              className="inline-flex h-10 items-center justify-center rounded-full bg-linear-to-r from-[#6246ea] to-[#8b5cf6] px-5 text-sm font-semibold text-white shadow-[0_8px_25px_rgba(118,88,255,0.2)] transition-all hover:opacity-90"
            >
              Start learning
              <ArrowUpRight className="ml-1.5 h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col gap-4 border-t border-white/10 py-7 text-sm md:flex-row md:items-center md:justify-between">
          <p className="text-slate-500">
            © {new Date().getFullYear()} Titan LMS. All rights reserved.
          </p>

          <div className="flex items-center gap-5">
            <Link
              href="/privacy"
              className="text-slate-500 transition-colors hover:text-white"
            >
              Privacy Policy
            </Link>

            <Link
              href="/terms"
              className="text-slate-500 transition-colors hover:text-white"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
