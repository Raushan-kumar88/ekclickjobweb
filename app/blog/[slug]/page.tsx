import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeftIcon,
  ClockIcon,
  UserIcon,
  CalendarIcon,
  TagIcon,
  ArrowRightIcon,
  CheckCircle2Icon,
  LightbulbIcon,
  QuoteIcon,
  BookOpenIcon,
} from "lucide-react";
import { getBlogPost, blogPosts } from "@/lib/data/blogPosts";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/lib/utils/button-variants";
import type { BlogSection } from "@/lib/data/blogPosts";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};
  return {
    title: `${post.title} – EkClickJob Blog`,
    description: post.excerpt,
  };
}

const CATEGORY_COLORS: Record<string, string> = {
  "Career Tips": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  "Interview Prep": "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
  "Salary Guide": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  "Remote Work": "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
  "For Employers": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  "Fresher Zone": "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
};

function renderSection(section: BlogSection, index: number) {
  switch (section.type) {
    case "intro":
      return (
        <p key={index} className="text-lg leading-relaxed text-muted-foreground">
          {section.text}
        </p>
      );
    case "h2":
      return (
        <h2 key={index} className="mt-8 text-xl font-bold text-foreground">
          {section.text}
        </h2>
      );
    case "h3":
      return (
        <h3 key={index} className="mt-5 text-base font-semibold text-foreground">
          {section.text}
        </h3>
      );
    case "p":
      return (
        <p key={index} className="leading-relaxed text-muted-foreground">
          {section.text}
        </p>
      );
    case "ul":
      return (
        <ul key={index} className="space-y-2">
          {section.items?.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-muted-foreground">
              <CheckCircle2Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol key={index} className="space-y-2">
          {section.items?.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-muted-foreground">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {i + 1}
              </span>
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ol>
      );
    case "tip":
      return (
        <div key={index} className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800/40 dark:bg-amber-950/20">
          <div className="mb-1.5 flex items-center gap-2">
            <LightbulbIcon className="h-4 w-4 text-amber-600" />
            <span className="text-xs font-bold uppercase tracking-wide text-amber-700 dark:text-amber-400">
              {section.label ?? "Tip"}
            </span>
          </div>
          <p className="whitespace-pre-line text-sm text-amber-800 dark:text-amber-300">{section.text}</p>
        </div>
      );
    case "quote":
      return (
        <blockquote key={index} className="relative rounded-xl border-l-4 border-primary bg-primary/5 px-6 py-4">
          <QuoteIcon className="absolute right-4 top-3 h-6 w-6 text-primary/20" />
          <p className="italic leading-relaxed text-foreground">{section.text}</p>
        </blockquote>
      );
    case "cta":
      return (
        <div key={index} className="rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center">
          <BookOpenIcon className="mx-auto mb-3 h-8 w-8 text-primary" />
          <p className="mb-4 font-medium text-foreground">{section.text}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/jobs" className={cn(buttonVariants({ size: "sm" }))}>
              Browse Jobs
            </Link>
            <Link href="/register" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
              Create Account
            </Link>
          </div>
        </div>
      );
    default:
      return null;
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const related = blogPosts
    .filter((p) => p.slug !== post.slug && (p.category === post.category || p.tags.some((t) => post.tags.includes(t))))
    .slice(0, 3);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      {/* Article header */}
      <div className="border-b bg-muted/30 py-8">
        <div className="container mx-auto max-w-3xl px-4">
          <Link
            href="/blog"
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeftIcon className="h-3.5 w-3.5" />
            Back to Blog
          </Link>

          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className={cn("rounded-full px-3 py-0.5 text-xs font-semibold", CATEGORY_COLORS[post.category] ?? "bg-muted text-muted-foreground")}>
              {post.category}
            </span>
            {post.featured && (
              <span className="rounded-full bg-amber-100 px-3 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                ✦ Featured
              </span>
            )}
          </div>

          <h1 className="text-2xl font-bold leading-tight text-foreground md:text-3xl lg:text-4xl">
            {post.title}
          </h1>
          <p className="mt-3 text-muted-foreground">{post.excerpt}</p>

          <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <UserIcon className="h-4 w-4" />
              <span className="font-medium text-foreground">{post.author}</span>
              <span>·</span>
              <span>{post.authorRole}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarIcon className="h-4 w-4" />
              {post.publishedAt}
            </span>
            <span className="flex items-center gap-1.5">
              <ClockIcon className="h-4 w-4" />
              {post.readTime}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span key={tag} className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                <TagIcon className="h-2.5 w-2.5" />
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto max-w-3xl px-4 py-10">
        <div className="space-y-5">
          {post.content.map((section, i) => renderSection(section, i))}
        </div>

        {/* Divider */}
        <div className="my-12 border-t" />

        {/* Author card */}
        <div className="rounded-2xl border bg-card p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
              {post.author.charAt(0)}
            </div>
            <div>
              <p className="font-semibold">{post.author}</p>
              <p className="text-sm text-muted-foreground">{post.authorRole} at EkClickJob</p>
            </div>
          </div>
        </div>

        {/* Related posts */}
        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-5 text-xl font-bold">Related Articles</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((rel) => (
                <Link
                  key={rel.slug}
                  href={`/blog/${rel.slug}`}
                  className="group rounded-2xl border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-sm"
                >
                  <span className={cn("mb-2 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold", CATEGORY_COLORS[rel.category] ?? "bg-muted text-muted-foreground")}>
                    {rel.category}
                  </span>
                  <p className="mb-2 text-sm font-semibold leading-snug group-hover:text-primary transition-colors line-clamp-2">
                    {rel.title}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <ClockIcon className="h-3 w-3" />
                    {rel.readTime}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Back link */}
        <div className="mt-10 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 rounded-xl border px-6 py-3 text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            View all articles
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
