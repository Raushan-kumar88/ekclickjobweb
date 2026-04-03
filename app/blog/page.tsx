"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  RssIcon,
  ClockIcon,
  SearchIcon,
  ArrowRightIcon,
  UserIcon,
  TagIcon,
} from "lucide-react";
import { blogPosts, BLOG_CATEGORIES, getFeaturedPost } from "@/lib/data/blogPosts";
import { cn } from "@/lib/utils";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const CATEGORY_COLORS: Record<string, string> = {
  "Career Tips": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  "Interview Prep": "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
  "Salary Guide": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  "Remote Work": "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
  "For Employers": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  "Fresher Zone": "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
};

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    document.title = "Career Blog & Tips | EkClickJob";
  }, []);
  const featured = getFeaturedPost();

  const filtered = useMemo(() => {
    return blogPosts.filter((post) => {
      const matchCat = activeCategory === "All" || post.category === activeCategory;
      const matchSearch =
        !search ||
        post.title.toLowerCase().includes(search.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(search.toLowerCase()) ||
        post.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [activeCategory, search]);

  const nonFeatured = filtered.filter((p) => !p.featured || activeCategory !== "All" || search);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      {/* Hero */}
      <section className="border-b bg-gradient-to-b from-primary/5 to-background py-16">
        <div className="container mx-auto max-w-5xl px-4 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-background px-4 py-1.5 text-sm text-muted-foreground shadow-sm">
            <RssIcon className="h-3.5 w-3.5 text-primary" />
            Career insights &amp; hiring tips
          </div>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            The EkClickJob <span className="text-primary">Blog</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Practical career advice, hiring guides, and job market trends — written for India&apos;s modern workforce.
          </p>

          {/* Search */}
          <div className="mx-auto mt-8 flex max-w-md items-center gap-2 rounded-xl border bg-background px-4 py-2 shadow-sm">
            <SearchIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>
      </section>

      <div className="container mx-auto max-w-5xl px-4 py-10">
        {/* Category tabs */}
        <div className="mb-8 flex flex-wrap gap-2">
          {BLOG_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-all",
                activeCategory === cat
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Featured post */}
        {featured && activeCategory === "All" && !search && (
          <Link href={`/blog/${featured.slug}`} className="group mb-10 block">
            <div className="overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:shadow-md hover:border-primary/30">
              <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background p-8 md:p-10">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className={cn("rounded-full px-3 py-0.5 text-xs font-semibold", CATEGORY_COLORS[featured.category] ?? "bg-muted text-muted-foreground")}>
                    {featured.category}
                  </span>
                  <span className="rounded-full bg-amber-100 px-3 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                    ✦ Featured
                  </span>
                </div>
                <h2 className="mb-3 text-2xl font-bold leading-snug text-foreground group-hover:text-primary transition-colors md:text-3xl">
                  {featured.title}
                </h2>
                <p className="mb-5 max-w-2xl text-muted-foreground">{featured.excerpt}</p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <UserIcon className="h-3.5 w-3.5" />
                    {featured.author}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <ClockIcon className="h-3.5 w-3.5" />
                    {featured.readTime}
                  </span>
                  <span>{featured.publishedAt}</span>
                </div>
                <div className="mt-5 flex items-center gap-1.5 font-medium text-primary">
                  Read article <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Articles grid */}
        {filtered.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-lg font-semibold text-muted-foreground">No articles found</p>
            <p className="mt-1 text-sm text-muted-foreground">Try a different search term or category.</p>
            <button
              onClick={() => { setSearch(""); setActiveCategory("All"); }}
              className="mt-4 text-sm font-medium text-primary hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {(activeCategory === "All" && !search ? nonFeatured : filtered).map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex flex-col rounded-2xl border bg-card p-5 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
              >
                <span className={cn("mb-3 self-start rounded-full px-3 py-0.5 text-xs font-semibold", CATEGORY_COLORS[post.category] ?? "bg-muted text-muted-foreground")}>
                  {post.category}
                </span>
                <h3 className="mb-2 font-semibold leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="mb-4 flex-1 text-sm text-muted-foreground line-clamp-3">{post.excerpt}</p>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <UserIcon className="h-3 w-3" />
                    {post.author}
                  </span>
                  <span className="flex items-center gap-1">
                    <ClockIcon className="h-3 w-3" />
                    {post.readTime}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {post.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Stats bar */}
        <div className="mt-16 rounded-2xl border bg-muted/30 p-6 text-center">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{blogPosts.length} articles</span> across{" "}
            <span className="font-semibold text-foreground">{BLOG_CATEGORIES.length - 1} categories</span> — and growing every week.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
