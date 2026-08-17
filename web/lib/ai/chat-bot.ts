"use server";

import { auth } from "@/auth";
import Groq from "groq-sdk";
import { createCompletionWithModelFallback } from "@/lib/ai/groq-fallback";

const ROLE_PROMPTS = {
  admin: `
You are the Titan LMS Support Assistant for Administrators.

SCOPE: Full platform access (Admins, Trainers, Students, Courses, Batches, Enrollments, Syllabus, Announcements, Attendance).
FORMAT: For "how do I" questions, provide the path first (e.g., Dashboard → Courses → Create), then brief steps.
BOUNDARIES: Explain Trainer/Student tasks only from a management view. Never invent features or pages. Keep answers concise and practical.
`.trim(),

  trainer: `
You are the Titan LMS Support Assistant for Trainers.

SCOPE: My Batches, Progress, Assignments & Grading, Schedule, Announcements, Manual & AI Quizzes.
AI QUIZ: 1–15 questions (Easy/Medium/Hard), MCQ (4 options: a,b,c,d) & Boolean (a=True, b=False).
NO ACCESS: User/Course/Batch creation, Bulk Enrollments, Global Syllabus, Platform Admin.
FORMAT: Give exact navigation paths first (e.g., My Batches → Select Batch → Assignments), then brief steps.
BOUNDARIES: Refer Admin tasks to Administrators. Never invent features. Be concise and practical.
`.trim(),

  student: `
You are the Titan LMS Support Assistant for Students.

SCOPE: My Courses, Enrolled Batches, Progress (read-only), Assignments (view/submit), Quizzes (1 attempt, auto-submits on timeout), Schedule, Announcements.
NO ACCESS: Creating, editing, or managing users, courses, batches, quizzes, assignments, syllabus, or grading.
FORMAT: Give exact navigation paths first (e.g., Dashboard → My Courses → Select Batch → Quizzes), then brief steps.
BOUNDARIES: Redirect restricted feature requests to Trainers or Admins. Never invent features. Be concise and clear.
`.trim(),
} as const;

type Message = {
  role: "user" | "assistant";
  content: string;
};

export async function chatBot(messages: Message[]) {
  try {
    const session = await auth();

    if (!session?.user?.role) {
      return {
        success: false as const,
        error: "Unauthorized",
      };
    }


    const role = session.user.role.toLowerCase() as keyof typeof ROLE_PROMPTS;

    if (!ROLE_PROMPTS[role]) {
      return {
        success: false as const,
        error: "Invalid role",
      };
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return {
        success: false as const,
        error: "Messages are required",
      };
    }

    // Sanitize the API key.
    const rawKey = process.env.GROQ_API_KEY || "";
    const GROQ_API_KEY = rawKey.replace(/^["']|["']$/g, "").trim();

    if (!GROQ_API_KEY || !GROQ_API_KEY.startsWith("gsk_")) {
      return {
        success: false as const,
        error: "Server configuration error: Invalid Groq API Key.",
      };
    }

    const groq = new Groq({ apiKey: GROQ_API_KEY });

    const apiMessages = [
      {
        role: "system" as const,
        content: ROLE_PROMPTS[role],
      },
      ...messages.map((message) => ({
        role: message.role,
        content: String(message.content),
      })),
    ];

    // Generate the completion with model fallback.
    const { completion } = await createCompletionWithModelFallback({
      groq,
      params: {
        messages: apiMessages,
        max_tokens: 1024,
        temperature: 0.2,
        stream: false,
      },
    });

    const content = completion.choices[0]?.message?.content?.trim() ?? "";

    if (!content) {
      return {
        success: false as const,
        error: "The assistant returned an empty response.",
      };
    }

    return {
      success: true as const,
      message: content,
    };
  } catch (error) {
    console.error("Chat Bot Error:", error);

    return {
      success: false as const,
      error: "An error occurred while processing your request.",
    };
  }
}