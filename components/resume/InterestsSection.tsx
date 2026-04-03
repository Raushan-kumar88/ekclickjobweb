"use client";

import { useState, useRef } from "react";
import { XIcon } from "lucide-react";

const POPULAR_INTERESTS = [
  "Reading", "Travel", "Photography", "Cooking", "Fitness", "Hiking",
  "Music", "Gaming", "Blogging", "Open Source", "Yoga", "Chess",
  "Cycling", "Drawing", "Podcasting", "Volunteering", "Meditation", "Football",
];

interface InterestsSectionProps {
  interests: string[];
  onAdd: (interest: string) => void;
  onRemove: (interest: string) => void;
}

export function InterestsSection({ interests, onAdd, onRemove }: InterestsSectionProps) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = input.length > 0
    ? POPULAR_INTERESTS.filter((s) => s.toLowerCase().includes(input.toLowerCase()) && !interests.includes(s)).slice(0, 6)
    : [];

  function handleAdd(interest: string) {
    onAdd(interest);
    setInput("");
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if ((e.key === "Enter" || e.key === ",") && input.trim()) {
      e.preventDefault();
      handleAdd(input.trim().replace(/,$/, ""));
    } else if (e.key === "Backspace" && !input && interests.length > 0) {
      onRemove(interests[interests.length - 1]);
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Interests add personality to your resume — include hobbies that reflect curiosity, teamwork, or discipline.
      </p>
      <div
        className="flex min-h-[44px] flex-wrap gap-2 rounded-xl border bg-background p-2 focus-within:ring-2 focus-within:ring-primary/30 cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {interests.map((interest) => (
          <span key={interest}
            className="flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1 text-sm font-medium text-primary">
            {interest}
            <button type="button" onClick={(e) => { e.stopPropagation(); onRemove(interest); }}
              className="ml-0.5 rounded text-primary/60 hover:text-primary transition-colors">
              <XIcon className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={interests.length === 0 ? "Type an interest and press Enter…" : "Add more…"}
          className="flex-1 min-w-[120px] bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>
      <p className="text-xs text-muted-foreground">Press Enter or comma to add · Backspace to remove last</p>

      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button key={s} type="button" onClick={() => handleAdd(s)}
              className="rounded-lg border px-2.5 py-1 text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors">
              + {s}
            </button>
          ))}
        </div>
      )}

      {input.length === 0 && interests.length < 4 && (
        <div>
          <p className="mb-2 text-xs text-muted-foreground font-medium">Popular interests:</p>
          <div className="flex flex-wrap gap-2">
            {POPULAR_INTERESTS.filter((s) => !interests.includes(s)).slice(0, 10).map((s) => (
              <button key={s} type="button" onClick={() => handleAdd(s)}
                className="rounded-lg border px-2.5 py-1 text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                + {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
