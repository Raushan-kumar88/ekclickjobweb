"use client";

import { useState, useRef } from "react";
import { XIcon } from "lucide-react";
import { POPULAR_SKILLS } from "@/lib/utils/constants";

interface SkillsSectionProps {
  skills: string[];
  onAdd: (skill: string) => void;
  onRemove: (skill: string) => void;
}

export function SkillsSection({ skills, onAdd, onRemove }: SkillsSectionProps) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = input.length > 0
    ? POPULAR_SKILLS.filter(
        (s) =>
          s.toLowerCase().includes(input.toLowerCase()) &&
          !skills.includes(s)
      ).slice(0, 6)
    : [];

  function handleAdd(skill: string) {
    onAdd(skill);
    setInput("");
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if ((e.key === "Enter" || e.key === ",") && input.trim()) {
      e.preventDefault();
      handleAdd(input.trim().replace(/,$/, ""));
    } else if (e.key === "Backspace" && !input && skills.length > 0) {
      onRemove(skills[skills.length - 1]);
    }
  }

  return (
    <div className="space-y-3">
      {/* Tag input */}
      <div
        className="flex min-h-[44px] flex-wrap gap-2 rounded-xl border bg-background p-2 focus-within:ring-2 focus-within:ring-primary/30 cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {skills.map((skill) => (
          <span key={skill}
            className="flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1 text-sm font-medium text-primary">
            {skill}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onRemove(skill); }}
              className="ml-0.5 rounded text-primary/60 hover:text-primary transition-colors"
            >
              <XIcon className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={skills.length === 0 ? "Type a skill and press Enter…" : "Add more…"}
          className="flex-1 min-w-[120px] bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>
      <p className="text-xs text-muted-foreground">Press Enter or comma to add · Backspace to remove last</p>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => handleAdd(s)}
              className="rounded-lg border px-2.5 py-1 text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors"
            >
              + {s}
            </button>
          ))}
        </div>
      )}

      {/* Popular chips (when input is empty) */}
      {input.length === 0 && skills.length < 5 && (
        <div>
          <p className="mb-2 text-xs text-muted-foreground font-medium">Popular skills:</p>
          <div className="flex flex-wrap gap-2">
            {POPULAR_SKILLS.filter((s) => !skills.includes(s)).slice(0, 12).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handleAdd(s)}
                className="rounded-lg border px-2.5 py-1 text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              >
                + {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
