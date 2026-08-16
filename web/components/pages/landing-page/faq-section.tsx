import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What is Titan LMS?",
    answer:
      "Titan LMS is a learning management platform that brings courses, batches, enrollments, lessons, assignments, quizzes, and learner progress into one workspace. It is designed for organizations, trainers, and students.",
  },
  {
    question: "Who can use Titan LMS?",
    answer:
      "Titan LMS supports three main roles: Admins manage the platform, courses, users, and enrollments; Trainers manage learning content and assessments; and Students access courses, complete learning activities, and track their progress.",
  },
  {
    question: "Can I manage multiple courses and batches?",
    answer:
      "Yes. Admins and trainers can organize courses and manage multiple batches, while keeping learner enrollments and progress organized across the platform.",
  },
  {
    question: "What can trainers manage?",
    answer:
      "Trainers can organize lessons and learning materials, create assignments and quizzes, review learner performance, and monitor progress across their courses and batches.",
  },
  {
    question: "How does AI Quiz Generation work?",
    answer:
      "Trainers can use AI to generate quiz and assessment questions from their course content, helping reduce repetitive preparation work while keeping assessments relevant to the material.",
  },
  {
    question: "What is the AI Chat Assistant?",
    answer:
      "The AI Chat Assistant helps learners ask questions about their learning material and receive contextual explanations and guidance while they study.",
  },
  {
    question: "Can Titan LMS track assignments, quizzes, and progress?",
    answer:
      "Yes. Titan LMS brings assignments, quizzes, results, completion, and learner progress together so trainers can monitor performance and identify where learners may need support.",
  },
  {
    question: "How do students get started?",
    answer:
      "Students can sign in to their account, access their enrolled courses, work through lessons and learning materials, complete assessments, and follow their progress from the student experience.",
  },
  {
    question: "How does authentication work?",
    answer:
      "Users sign in through their Titan LMS account and are provided with the appropriate experience based on their role. Access to platform functionality is managed according to that role.",
  },
  {
    question: "Is Titan LMS available with fixed pricing plans?",
    answer:
      "Titan LMS availability and pricing can depend on how the platform is provided. We don't list specific plans or prices here. Contact the team to learn about availability and the option that fits your organization.",
  },
];

const FAQSection = () => {
  return (
    <section
      id="faq"
      className="container relative w-full py-24"
      aria-labelledby="faq-heading"
    >
      <div className="mx-auto max-w-3xl text-center">
        <div className="mb-4 inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary">
          Frequently asked questions
        </div>

        <h2
          id="faq-heading"
          className="text-3xl font-bold tracking-tight text-foreground md:text-4xl"
        >
          Questions, answered clearly
        </h2>

        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          Everything you need to know about using Titan LMS for teaching,
          learning, and managing your platform.
        </p>
      </div>

      <div className="mx-auto mt-12 max-w-4xl">
        <Accordion className="grid gap-3 md:grid-cols-2 md:items-start">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={faq.question}
              value={`faq-${index}`}
              className="rounded-2xl border border-border/60 bg-card/50 px-5 backdrop-blur-sm transition-colors hover:border-border"
            >
              <AccordionTrigger className="py-5 text-left text-sm font-semibold text-foreground hover:no-underline">
                {faq.question}
              </AccordionTrigger>

              <AccordionContent className="pb-5 pr-6 text-sm leading-6 text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* Small closing prompt */}
      <div className="mx-auto mt-10 max-w-4xl rounded-2xl border border-border/60 bg-card/30 px-6 py-5 text-center">
        <p className="text-sm text-muted-foreground">
          Still have questions?{" "}
          <a
            href="#contact"
            className="font-semibold text-foreground underline decoration-primary/50 underline-offset-4 transition-colors hover:text-primary"
          >
            Get in touch with the Titan LMS team.
          </a>
        </p>
      </div>
    </section>
  );
};

export default FAQSection;
