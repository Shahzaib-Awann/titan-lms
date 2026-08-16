import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://titan-lms-project.vercel.app/"),

  title: {
    default: "Titan LMS | Modern Learning Management System",
    template: "%s | Titan LMS",
  },

  description:
    "Titan LMS is a premium Learning Management System for modern education. Create and manage courses, empower trainers, support students, track learning progress, and deliver engaging online learning experiences.",

  keywords: [
    "Titan LMS",
    "Learning Management System",
    "LMS",
    "online learning platform",
    "education platform",
    "e-learning platform",
    "online courses",
    "course management system",
    "student management system",
    "trainer management system",
    "learning platform",
    "education management system",
  ],

  applicationName: "Titan LMS",

  authors: [
    {
      name: "Shahzaib Awan",
      url: "https://shahzaibawan.site/",
    },
    {
      name: "Shahzaib Awan",
      url: "https://shahzaib.is-a.dev/",
    },
  ],

  creator: "Shahzaib Awan",
  publisher: "Shahzaib Awan",

  category: "Education",

  alternates: {
    canonical: "/",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  openGraph: {
    type: "website",
    url: "/",
    title: "Titan LMS | Modern Learning Management System",
    description:
      "A premium Learning Management System designed for modern education. Manage courses, trainers, students, learning progress, and educational workflows with Titan LMS.",
    siteName: "Titan LMS",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Titan LMS - Modern Learning Management System",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Titan LMS | Modern Learning Management System",
    description:
      "Create courses, manage learners, track progress, and deliver engaging online learning experiences with Titan LMS.",
    images: ["/og-image.png"],
  },

  other: {
    "author-name": "Shahzaib Awan",
    "project-name": "Titan LMS",
    "project-type": "Learning Management System",
    "developer-portfolio": "https://shahzaibawan.site/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      suppressHydrationWarning
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
