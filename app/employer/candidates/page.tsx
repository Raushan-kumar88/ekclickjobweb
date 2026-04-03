"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
  SearchIcon, XIcon, Loader2Icon, UsersIcon,
  HelpCircleIcon, ZapIcon,
} from "lucide-react";
import { useCandidates, type CandidateFilters } from "@/hooks/useCandidates";
import { CandidateCard } from "@/components/candidates/CandidateCard";
import { POPULAR_SKILLS, CITIES, NOTICE_PERIOD_OPTIONS } from "@/lib/utils/constants";

// ── Boolean query parser ──────────────────────────────────────────────────────
// Supports: Python AND React, Python OR Java, NOT Java, (Python OR JS) AND React
interface BooleanNode {
  type: "AND" | "OR" | "NOT" | "TERM";
  value?: string;
  left?: BooleanNode;
  right?: BooleanNode;
  operand?: BooleanNode;
}

function tokenize(query: string): string[] {
  return query
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function parseBooleanQuery(query: string): BooleanNode | null {
  if (!query.trim()) return null;
  const tokens = tokenize(query.toUpperCase());
  if (tokens.length === 0) return null;

  // Simple left-to-right precedence: NOT > AND > OR
  let i = 0;
  function parsePrimary(): BooleanNode {
    if (tokens[i] === "NOT") {
      i++;
      return { type: "NOT", operand: parsePrimary() };
    }
    const term = tokens[i] ?? "";
    i++;
    // Map back to original case from the original query
    const origTerms = tokenize(query);
    const origTerm = origTerms[i - 1] ?? term;
    return { type: "TERM", value: origTerm.replace(/[()]/g, "") };
  }

  function parseAnd(): BooleanNode {
    let left = parsePrimary();
    while (i < tokens.length && tokens[i] === "AND") {
      i++;
      const right = parsePrimary();
      left = { type: "AND", left, right };
    }
    return left;
  }

  function parseOr(): BooleanNode {
    let left = parseAnd();
    while (i < tokens.length && tokens[i] === "OR") {
      i++;
      const right = parseAnd();
      left = { type: "OR", left, right };
    }
    return left;
  }

  try {
    return parseOr();
  } catch {
    return null;
  }
}

function evaluateNode(node: BooleanNode | null | undefined, text: string): boolean {
  if (!node) return true;
  switch (node.type) {
    case "TERM":
      return text.toLowerCase().includes((node.value ?? "").toLowerCase());
    case "NOT":
      return !evaluateNode(node.operand, text);
    case "AND":
      return evaluateNode(node.left, text) && evaluateNode(node.right, text);
    case "OR":
      return evaluateNode(node.left, text) || evaluateNode(node.right, text);
    default:
      return true;
  }
}

import type { CandidateResult } from "@/hooks/useCandidates";
type CandidateWithProfile = CandidateResult;

function applyBooleanFilter(candidates: CandidateWithProfile[], boolQuery: string): CandidateWithProfile[] {
  if (!boolQuery.trim()) return candidates;
  const node = parseBooleanQuery(boolQuery);
  if (!node) return candidates;
  return candidates.filter((c) => {
    const searchText = [
      c.headline ?? "",
      c.skills?.join(" ") ?? "",
      c.displayName ?? "",
      c.bio ?? "",
    ].join(" ");
    return evaluateNode(node, searchText);
  });
}

const DEBOUNCE_MS = 350;

export default function CandidatesPage() {
  const [keyword, setKeyword] = useState("");
  const [city, setCity] = useState("");
  const [skill, setSkill] = useState("");
  const [booleanQuery, setBooleanQuery] = useState("");
  const [booleanMode, setBooleanMode] = useState(false);
  const [noticePeriodFilter, setNoticePeriodFilter] = useState("");
  const [openToWorkOnly, setOpenToWorkOnly] = useState(false);

  // Debounced keyword so we don't fire a server action on every keystroke
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [debouncedBooleanQuery, setDebouncedBooleanQuery] = useState("");
  const kwTimer = useRef<NodeJS.Timeout | null>(null);
  const bqTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (kwTimer.current) clearTimeout(kwTimer.current);
    kwTimer.current = setTimeout(() => setDebouncedKeyword(keyword), DEBOUNCE_MS);
    return () => { if (kwTimer.current) clearTimeout(kwTimer.current); };
  }, [keyword]);

  useEffect(() => {
    if (bqTimer.current) clearTimeout(bqTimer.current);
    bqTimer.current = setTimeout(() => setDebouncedBooleanQuery(booleanQuery), DEBOUNCE_MS);
    return () => { if (bqTimer.current) clearTimeout(bqTimer.current); };
  }, [booleanQuery]);

  // These go directly to the server action (city & skill are dropdowns — instant)
  const queryFilters: CandidateFilters = useMemo(() => ({
    keyword: (!booleanMode && debouncedKeyword.trim()) ? debouncedKeyword.trim() : undefined,
    city: city || undefined,
    skill: skill || undefined,
  }), [booleanMode, debouncedKeyword, city, skill]);

  const { data: rawCandidates = [], isLoading, isFetching } = useCandidates(queryFilters);

  const candidates = useMemo(() => {
    let list = rawCandidates;
    if (openToWorkOnly) {
      list = list.filter((c) => !!c.openToWork);
    }
    if (noticePeriodFilter) {
      list = list.filter((c) => {
        const np = c.noticePeriod;
        if (noticePeriodFilter === "immediate") return np === "immediate";
        if (noticePeriodFilter === "30days") return np === "immediate" || np === "15days" || np === "1month";
        return np === noticePeriodFilter;
      });
    }
    if (booleanMode && debouncedBooleanQuery.trim()) {
      list = applyBooleanFilter(list as CandidateWithProfile[], debouncedBooleanQuery);
    }
    return list;
  }, [rawCandidates, openToWorkOnly, noticePeriodFilter, booleanMode, debouncedBooleanQuery]);

  function clearFilters() {
    setKeyword("");
    setCity("");
    setSkill("");
    setBooleanQuery("");
    setDebouncedKeyword("");
    setDebouncedBooleanQuery("");
    setNoticePeriodFilter("");
    setOpenToWorkOnly(false);
  }

  const hasActiveFilters = !!(queryFilters.keyword || queryFilters.city || queryFilters.skill || debouncedBooleanQuery || openToWorkOnly || noticePeriodFilter);

  return (
    <div className="space-y-6">
      {/* ── Page header ── */}
      <div>
        <h1 className="text-2xl font-bold">Candidate Search</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Browse and connect with job seekers matching your requirements.
        </p>
      </div>

      {/* ── Search & filter bar ── */}
      <div className="rounded-2xl border bg-card p-4 space-y-3">
        {/* Mode toggle */}
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground">Search Mode</p>
          <div className="flex rounded-xl border overflow-hidden text-xs font-medium">
            <button
              onClick={() => setBooleanMode(false)}
              className={`px-3 py-1.5 transition-colors ${!booleanMode ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted/50"}`}
            >
              Standard
            </button>
            <button
              onClick={() => setBooleanMode(true)}
              className={`flex items-center gap-1 px-3 py-1.5 transition-colors ${booleanMode ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted/50"}`}
            >
              <ZapIcon className="h-3 w-3" /> Boolean
            </button>
          </div>
        </div>

        {/* Search input */}
        {booleanMode ? (
          <div className="space-y-1.5">
            <div className="relative">
              <ZapIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
              <input
                value={booleanQuery}
                onChange={(e) => setBooleanQuery(e.target.value)}
                placeholder='Python AND React NOT Java'
                className="w-full rounded-xl border border-primary/30 bg-background py-2.5 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              <p className="text-xs text-muted-foreground mr-1 mt-0.5">Examples:</p>
              {["Python AND React", "React OR Angular", "NOT Java", "(Python OR Go) AND AWS"].map((ex) => (
                <button key={ex} onClick={() => setBooleanQuery(ex)}
                  className="rounded-lg border px-2 py-0.5 text-[10px] text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                  {ex}
                </button>
              ))}
              <a href="#" title="AND = must have both, OR = either, NOT = exclude, use parentheses for grouping"
                className="ml-1 text-muted-foreground hover:text-primary">
                <HelpCircleIcon className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        ) : (
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search by name, headline, skills…"
              className="w-full rounded-xl border bg-background py-2.5 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
            {isFetching && (
              <Loader2Icon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
            )}
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          {/* City */}
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">All Cities</option>
            {CITIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Skill */}
          <select
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
            className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">All Skills</option>
            {POPULAR_SKILLS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Advanced filters */}
        <div className="grid gap-3 sm:grid-cols-2">
          <select
            value={noticePeriodFilter}
            onChange={(e) => setNoticePeriodFilter(e.target.value)}
            className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">Any Notice Period</option>
            <option value="30days">Available in ≤ 30 days</option>
            {NOTICE_PERIOD_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          <label className="flex items-center gap-2 rounded-xl border bg-background px-3 py-2.5 cursor-pointer text-sm hover:bg-muted/30 transition-colors">
            <input
              type="checkbox"
              checked={openToWorkOnly}
              onChange={(e) => setOpenToWorkOnly(e.target.checked)}
              className="rounded"
            />
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              Open to Work only
            </span>
          </label>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center">
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm text-muted-foreground hover:bg-muted/50 transition-colors"
            >
              <XIcon className="h-3.5 w-3.5" />
              Clear filters
            </button>
          </div>
        )}

        {/* Active filter chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 pt-1">
            {queryFilters.keyword && (
              <span className="flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                Keyword: {queryFilters.keyword}
              </span>
            )}
            {debouncedBooleanQuery && (
              <span className="flex items-center gap-1 rounded-lg bg-violet-100 dark:bg-violet-900/30 px-2.5 py-1 text-xs font-medium text-violet-700 dark:text-violet-300">
                <ZapIcon className="h-3 w-3" /> {debouncedBooleanQuery}
              </span>
            )}
            {queryFilters.city && (
              <span className="flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                City: {queryFilters.city}
              </span>
            )}
            {queryFilters.skill && (
              <span className="flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                Skill: {queryFilters.skill}
              </span>
            )}
            {openToWorkOnly && (
              <span className="flex items-center gap-1 rounded-lg bg-green-100 dark:bg-green-900/30 px-2.5 py-1 text-xs font-medium text-green-700 dark:text-green-300">
                🟢 Open to Work
              </span>
            )}
            {noticePeriodFilter && (
              <span className="flex items-center gap-1 rounded-lg bg-amber-100 dark:bg-amber-900/30 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-300">
                Notice: {NOTICE_PERIOD_OPTIONS.find((o) => o.value === noticePeriodFilter)?.label ?? noticePeriodFilter}
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Results header ── */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {isLoading || isFetching ? (
            <span className="flex items-center gap-1.5">
              <Loader2Icon className="h-3.5 w-3.5 animate-spin" />
              Searching…
            </span>
          ) : (
            <>
              <span className="font-medium text-foreground">{candidates.length}</span>
              {rawCandidates.length !== candidates.length && (
                <span> (filtered from {rawCandidates.length})</span>
              )}
              {" "}candidate{candidates.length !== 1 ? "s" : ""} found
            </>
          )}
        </p>
        {booleanMode && (
          <span className="flex items-center gap-1 rounded-full bg-violet-100 dark:bg-violet-900/30 px-2.5 py-1 text-[10px] font-semibold text-violet-700 dark:text-violet-300">
            <ZapIcon className="h-3 w-3" /> Boolean Mode Active
          </span>
        )}
      </div>

      {/* ── Candidate grid ── */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-52 rounded-2xl border bg-muted/30 animate-pulse" />
          ))}
        </div>
      ) : candidates.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 text-center">
          <UsersIcon className="h-12 w-12 text-muted-foreground/30 mb-3" />
          <p className="font-medium">No candidates found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {hasActiveFilters
              ? "Try adjusting or clearing your filters."
              : "No seekers have set up their profiles yet."}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-4 rounded-xl border px-4 py-2 text-sm hover:bg-muted/50 transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {candidates.map((c) => (
            <CandidateCard key={c.uid} candidate={c} />
          ))}
        </div>
      )}

      {/* Skills quick-filter chips */}
      {!hasActiveFilters && !isLoading && (
        <div className="rounded-2xl border bg-muted/20 p-4">
          <p className="mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Browse by skill
          </p>
          <div className="flex flex-wrap gap-2">
            {POPULAR_SKILLS.slice(0, 16).map((s) => (
              <button
                key={s}
                onClick={() => setSkill(s)}
                className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:border-primary hover:text-primary transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
