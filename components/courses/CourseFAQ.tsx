"use client";

import * as React from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface FaqItem {
  question: string;
  answer: string;
}

interface CourseFAQProps {
  faq: FaqItem[];
  courseTitle: string;
}

export function CourseFAQ({ faq, courseTitle }: CourseFAQProps) {
  const [open, setOpen] = React.useState<number | null>(null);

  if (!faq || faq.length === 0) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold font-display tracking-tight text-slate-900 border-l-4 border-primary pl-4">
        Frequently Asked Questions
      </h2>

      <div className="space-y-3" role="list" aria-label={`FAQ for ${courseTitle}`}>
        {faq.map((item, i) => {
          const isOpen = open === i;
          const panelId = `faq-panel-${i}`;
          const triggerId = `faq-trigger-${i}`;
          return (
            <div
              key={i}
              className="rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden shadow-sm"
              role="listitem"
            >
              <button
                id={triggerId}
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                aria-controls={panelId}
                className="flex w-full items-center justify-between p-5 text-left hover:bg-slate-100/60 transition-colors"
              >
                <span className="font-semibold text-slate-900 text-sm md:text-base pr-4">
                  {item.question}
                </span>
                <ChevronRight
                  className={cn(
                    "h-4 w-4 text-slate-500 transition-transform duration-300 shrink-0",
                    isOpen && "rotate-90 text-primary"
                  )}
                  aria-hidden="true"
                />
              </button>

              <div
                id={panelId}
                role="region"
                aria-labelledby={triggerId}
                hidden={!isOpen}
                className="border-t border-slate-200 bg-white px-5 py-4"
              >
                <p className="text-sm text-slate-600 leading-relaxed">{item.answer}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
