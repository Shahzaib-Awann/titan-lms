"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { chatBot } from "@/lib/ai/chat-bot";
import Image from "next/image";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I am your Titan LMS support assistant. How can I help you today?",
    },
  ]);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]",
      );

      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();

    setInput("");
    setIsLoading(true);

    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: userMessage },
    ];

    // Immediately show user's message
    setMessages(newMessages);

    try {
      const result = await chatBot(newMessages);

      if (!result.success) {
        throw new Error(result.error || "Failed to get response");
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: result.message ?? "" },
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again later.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <Card
          className={cn(
            "w-[calc(100vw-2rem)] sm:w-120",
            "h-[min(700px,calc(100vh-3rem))]",
            "flex flex-col overflow-hidden",
            "rounded-2xl border-border/60 bg-background/95",
            "shadow-2xl! shadow-black/25 backdrop-blur-2xl",
            "animate-in slide-in-from-bottom-4 py-0 fade-in fade-out duration-200",
          )}
        >
          {/* Header */}
          <CardHeader className="shrink-0 border-b bg-primary py-4 text-primary-foreground">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative h-9 w-9 overflow-hidden rounded-full bg-[#7658FF]">
                  <Image
                    src="/titan-logo.jpeg"
                    alt="Titan LMS"
                    fill
                    sizes="36px"
                    className="object-cover"
                  />
                </div>

                <div>
                  <CardTitle className="text-sm font-semibold text-primary-foreground">
                    LMS Assistant
                  </CardTitle>

                  <p className="text-xs text-primary-foreground/70">
                    How can I help you?
                  </p>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="size-8 rounded-full text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
              >
                <X className="size-4" />
                <span className="sr-only">Close chat</span>
              </Button>
            </div>
          </CardHeader>

          {/* Messages */}
          <CardContent className="min-h-0 flex-1 p-0">
            <ScrollArea ref={scrollAreaRef} className="h-full">
              <div className="flex flex-col gap-5 p-4">
                {messages.map((msg, idx) => {
                  const isUser = msg.role === "user";

                  return (
                    <div
                      key={idx}
                      className={cn(
                        "flex w-full gap-2.5",
                        isUser ? "justify-end" : "justify-start",
                      )}
                    >
                      {!isUser && (
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                          <Bot className="size-4" />
                        </div>
                      )}

                      <div
                        className={cn(
                          "max-w-[80%] px-3.5 py-2.5 text-sm leading-relaxed",
                          "wrap-break-word whitespace-pre-wrap",
                          isUser
                            ? "rounded-2xl rounded-br-md bg-primary text-primary-foreground"
                            : "rounded-2xl rounded-bl-md bg-secondary text-foreground",
                        )}
                      >
                        {msg.content}
                      </div>

                      {isUser && (
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <User className="size-4" />
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Loading */}
                {isLoading && (
                  <div className="flex items-start gap-2.5">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                      <Bot className="size-4" />
                    </div>

                    <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md bg-muted px-4 py-3">
                      <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
                      <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
                      <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>

          {/* Input */}
          <CardFooter className="shrink-0 border-t bg-background p-3">
            <form
              onSubmit={handleSubmit}
              className="flex w-full items-end gap-2"
            >
              <div className="relative flex-1">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask LMS Assistant..."
                  disabled={isLoading}
                  className={cn(
                    "h-11 rounded-xl border-muted-foreground/20",
                    "bg-muted/40 pr-3",
                    "focus-visible:ring-1",
                  )}
                />
              </div>

              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || isLoading}
                className="size-11 shrink-0 rounded-xl"
              >
                <Send className="size-4" />
                <span className="sr-only">Send message</span>
              </Button>
            </form>
          </CardFooter>
        </Card>
      ) : (
        <Button
          onClick={() => setIsOpen(true)}
          size="icon"
          className={cn(
            "size-14 rounded-full",
            "shadow-lg shadow-primary/25",
            "transition-all duration-200",
            "hover:scale-105 hover:shadow-xl hover:shadow-primary/30",
          )}
        >
          <MessageCircle className="size-6" />
          <span className="sr-only">Open LMS Assistant</span>
        </Button>
      )}
    </div>
  );
}
