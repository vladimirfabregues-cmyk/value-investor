"use client";

import { useRef, useState, type ReactNode } from "react";

export interface ResultSection {
  id: string;
  label: string;
  content: ReactNode;
}

interface ResultSectionsProps {
  sections: ResultSection[];
}

/**
 * Progressive disclosure for the long result report.
 *
 * Implements the WAI-ARIA tabs pattern with a roving tabindex: only the active
 * tab is in the tab order, and the arrow keys move between tabs. The tablist
 * scrolls horizontally on narrow screens rather than duplicating every panel
 * into a second accordion tree, which would double the DOM and risk the two
 * copies drifting apart.
 */
export function ResultSections({ sections }: ResultSectionsProps) {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  function focusTab(index: number) {
    const next = (index + sections.length) % sections.length;
    setActive(next);
    tabRefs.current[next]?.focus();
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    switch (event.key) {
      case "ArrowRight":
        event.preventDefault();
        focusTab(index + 1);
        break;
      case "ArrowLeft":
        event.preventDefault();
        focusTab(index - 1);
        break;
      case "Home":
        event.preventDefault();
        focusTab(0);
        break;
      case "End":
        event.preventDefault();
        focusTab(sections.length - 1);
        break;
    }
  }

  return (
    <div>
      <div
        role="tablist"
        aria-label="Analysis sections"
        className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0"
      >
        {sections.map((section, index) => {
          const selected = index === active;
          return (
            <button
              key={section.id}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              role="tab"
              id={`tab-${section.id}`}
              aria-selected={selected}
              aria-controls={`panel-${section.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(index)}
              onKeyDown={(event) => onKeyDown(event, index)}
              className={`shrink-0 whitespace-nowrap rounded-lg border px-3.5 py-2 text-sm font-medium transition ${
                selected
                  ? "border-primary/40 bg-primary/12 text-primary"
                  : "border-white/[0.07] bg-white/[0.02] text-muted-foreground hover:border-white/15 hover:text-foreground"
              }`}
            >
              {section.label}
            </button>
          );
        })}
      </div>

      {sections.map((section, index) => (
        <div
          key={section.id}
          role="tabpanel"
          id={`panel-${section.id}`}
          aria-labelledby={`tab-${section.id}`}
          hidden={index !== active}
          tabIndex={0}
          className="mt-4 space-y-6 focus-visible:outline-none"
        >
          {index === active && section.content}
        </div>
      ))}
    </div>
  );
}
