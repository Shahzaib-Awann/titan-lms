import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Sparkles,
  MessageSquare,
  BrainCircuit,
  Zap,
  CheckCircle2,
} from "lucide-react";
import React from "react";

const AIPoweredFeaturesSection = () => {
  return (
    <section id="ai-features" className="py-24 container w-full relative">
      <div className="flex flex-col items-center text-center space-y-4 mb-16 max-w-3xl mx-auto">
        <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
          <Sparkles className="mr-2 h-4 w-4" />
          Intelligence built-in
        </div>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
          Practical AI for real learning outcomes
        </h2>
        <p className="text-lg text-muted-foreground leading-relaxed">
          We use artificial intelligence where it actually matters—eliminating
          repetitive tasks for trainers and providing instant, personalized
          support for learners.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {/* Feature 1: AI Quiz Generation */}
        <Card
          interactive
          className="overflow-hidden flex flex-col h-full border-border/60 bg-card/50 backdrop-blur-sm"
        >
          <CardHeader>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-primary/10 text-primary">
              <Zap className="w-6 h-6" />
            </div>
            <CardTitle className="text-2xl">AI Quiz Generation</CardTitle>
            <CardDescription className="text-base">
              Trainers can generate quizzes and assessments from their course
              content in seconds, saving time while creating highly relevant
              questions.
            </CardDescription>
          </CardHeader>
          <div className="flex-1 mt-4 border-t border-border/50 bg-muted/20 p-6 sm:p-8 flex items-center justify-center relative overflow-hidden">
            {/* UI Mockup */}
            <div className="w-full max-w-sm rounded-xl border border-border/60 bg-background shadow-sm p-4 animate-in fade-in zoom-in duration-700">
              <div className="flex items-center justify-between mb-4 border-b border-border/50 pb-3">
                <span className="text-sm font-semibold">
                  Generate Assessment
                </span>
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div className="space-y-3">
                <div className="h-2 w-3/4 rounded bg-muted"></div>
                <div className="h-2 w-1/2 rounded bg-muted"></div>

                <div className="mt-4 space-y-2 pt-2">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/5 border border-primary/20">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span className="text-xs font-medium">
                      Multiple Choice Questions
                    </span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/5 border border-primary/20">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span className="text-xs font-medium">
                      Short Answer format
                    </span>
                  </div>
                </div>
                <div className="mt-4 pt-2">
                  <div className="w-full h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shadow-sm">
                    Generate Now
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Feature 2: AI Chat Assistant */}
        <Card
          interactive
          className="overflow-hidden flex flex-col h-full border-border/60 bg-card/50 backdrop-blur-sm"
        >
          <CardHeader>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-emerald-500/10 text-emerald-500">
              <MessageSquare className="w-6 h-6" />
            </div>
            <CardTitle className="text-2xl">AI Chat Assistant</CardTitle>
            <CardDescription className="text-base">
              Learners can ask questions about their course materials and
              receive helpful, contextual explanations and guidance whenever
              they need it.
            </CardDescription>
          </CardHeader>
          <div className="flex-1 mt-4 border-t border-border/50 bg-muted/20 p-6 sm:p-8 flex items-center justify-center relative overflow-hidden">
            {/* UI Mockup */}
            <div className="w-full max-w-sm rounded-xl border border-border/60 bg-background shadow-sm p-4 flex flex-col gap-3 animate-in fade-in zoom-in duration-700 delay-150">
              <div className="self-end max-w-[85%] rounded-2xl rounded-tr-sm bg-muted p-3 text-xs text-foreground">
                I&apos;m stuck on React hooks. What does useEffect do exactly?
              </div>
              <div className="self-start max-w-[85%] rounded-2xl rounded-tl-sm bg-primary/10 border border-primary/20 p-3 text-xs text-foreground">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span className="font-semibold text-primary">Titan AI</span>
                </div>
                <code>useEffect</code> lets you synchronize a component with an
                external system. Think of it as a way to handle side effects in
                your functional components.
              </div>
            </div>
          </div>
        </Card>

        {/* Feature 3: AI-Powered Learning Support */}
        <Card
          interactive
          className="overflow-hidden flex flex-col h-full border-border/60 bg-card/50 backdrop-blur-sm"
        >
          <CardHeader>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-blue-500/10 text-blue-500">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <CardTitle className="text-2xl">
              Contextual Learning Support
            </CardTitle>
            <CardDescription className="text-base">
              Help learners understand difficult concepts with inline
              explanations. Highlight any text to explore topics deeply without
              leaving the lesson.
            </CardDescription>
          </CardHeader>
          <div className="flex-1 mt-4 border-t border-border/50 bg-muted/20 p-6 sm:p-8 flex items-center justify-center relative overflow-hidden">
            {/* UI Mockup */}
            <div className="w-full max-w-sm rounded-xl border border-border/60 bg-background shadow-sm p-5 animate-in fade-in zoom-in duration-700 delay-300">
              <div className="text-sm text-muted-foreground leading-relaxed">
                The virtual DOM is a programming concept where an ideal, or{" "}
                <span className="bg-blue-500/20 text-blue-500 px-1 rounded cursor-pointer border border-blue-500/30 relative">
                  &quot;virtual&quot; representation
                  {/* Floating tooltip mockup */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-card border border-border shadow-elevated rounded-lg p-2.5 z-10">
                    <div className="flex items-center gap-1.5 mb-1">
                      <BrainCircuit className="w-3 h-3 text-blue-500" />
                      <span className="text-[10px] font-bold text-foreground">
                        Explain concept
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-tight">
                      A lightweight copy of the real DOM kept in memory to
                      optimize rendering speed.
                    </p>
                  </div>
                </span>{" "}
                of a UI is kept in memory.
              </div>
            </div>
          </div>
        </Card>

        {/* Feature 4: Smart Trainer Assistance */}
        <Card
          interactive
          className="overflow-hidden flex flex-col h-full border-border/60 bg-card/50 backdrop-blur-sm"
        >
          <CardHeader>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-amber-500/10 text-amber-500">
              <Sparkles className="w-6 h-6" />
            </div>
            <CardTitle className="text-2xl">Smart Trainer Assistance</CardTitle>
            <CardDescription className="text-base">
              Reduce repetitive administrative work. Automatically summarize
              long videos, generate lesson outlines, and build flashcards
              instantly.
            </CardDescription>
          </CardHeader>
          <div className="flex-1 mt-4 border-t border-border/50 bg-muted/20 p-6 sm:p-8 flex items-center justify-center relative overflow-hidden">
            {/* UI Mockup */}
            <div className="w-full max-w-sm rounded-xl border border-border/60 bg-background shadow-sm p-4 flex flex-col items-center gap-3 animate-in fade-in zoom-in duration-700 delay-500">
              <div className="w-full flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-muted/30">
                <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center text-primary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold">
                    Lecture_Transcript.pdf
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Uploaded 2 mins ago
                  </p>
                </div>
              </div>

              <div className="w-0.5 h-4 bg-border/80"></div>

              <div className="w-full flex items-center justify-between p-3 rounded-lg border border-amber-500/20 bg-amber-500/5">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                    Generate flashcards
                  </span>
                </div>
                <div className="h-5 w-5 rounded-full bg-amber-500 text-white flex items-center justify-center">
                  <CheckCircle2 className="w-3 h-3" />
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default AIPoweredFeaturesSection;
