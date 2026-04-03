import { cn } from "@/lib/utils";
import type { ResumeTemplate } from "@/hooks/useResumeBuilder";

interface TemplatePreviewCardProps {
  template: ResumeTemplate;
  className?: string;
}

// ── Shared placeholder blocks ──────────────────────────────────────────────

function Lines({ count = 3, widths, className }: { count?: number; widths?: string[]; className?: string }) {
  const defaults = ["w-full", "w-5/6", "w-4/6", "w-3/4", "w-11/12"];
  return (
    <div className={cn("space-y-1", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={cn("h-[5px] rounded-full bg-gray-200", widths?.[i] ?? defaults[i % defaults.length])} />
      ))}
    </div>
  );
}

function BulletLines({ count = 3 }: { count?: number }) {
  const widths = ["w-11/12", "w-4/5", "w-full", "w-3/4"];
  return (
    <div className="space-y-1 pl-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <div className="h-[3px] w-[3px] rounded-full bg-gray-400 shrink-0" />
          <div className={cn("h-[4.5px] rounded-full bg-gray-200", widths[i % widths.length])} />
        </div>
      ))}
    </div>
  );
}

function SectionLabel({ text, color = "bg-gray-800" }: { text: string; color?: string }) {
  return (
    <div className="flex items-center gap-1.5 mb-1.5">
      <div className={cn("h-[5px] rounded-full", color)} style={{ width: `${text.length * 5.2}px`, maxWidth: "80px" }} />
    </div>
  );
}

// ── CLASSIC ────────────────────────────────────────────────────────────────

function ClassicPreview() {
  return (
    <div className="bg-white p-4 text-[0px] font-sans h-full">
      {/* Header */}
      <div className="border-b-[2.5px] border-blue-600 pb-2.5 mb-3">
        <div className="h-[11px] w-28 rounded bg-gray-800 mb-1" />
        <div className="h-[6px] w-20 rounded bg-blue-500 mb-2" />
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {["w-16", "w-12", "w-14", "w-16"].map((w, i) => (
            <div key={i} className={cn("h-[4px] rounded bg-gray-300", w)} />
          ))}
        </div>
      </div>
      {/* Summary */}
      <div className="mb-3">
        <div className="h-[5px] w-24 rounded bg-blue-600 mb-1.5" />
        <Lines count={3} />
      </div>
      {/* Experience */}
      <div className="mb-3">
        <div className="h-[5px] w-20 rounded bg-blue-600 mb-1.5" />
        <div className="mb-2">
          <div className="flex justify-between mb-0.5">
            <div className="h-[5px] w-24 rounded bg-gray-700" />
            <div className="h-[4px] w-14 rounded bg-gray-300" />
          </div>
          <div className="h-[4px] w-20 rounded bg-gray-400 mb-1" />
          <BulletLines count={3} />
        </div>
        <div>
          <div className="flex justify-between mb-0.5">
            <div className="h-[5px] w-20 rounded bg-gray-700" />
            <div className="h-[4px] w-12 rounded bg-gray-300" />
          </div>
          <div className="h-[4px] w-18 rounded bg-gray-400 mb-1" />
          <BulletLines count={2} />
        </div>
      </div>
      {/* Education */}
      <div className="mb-3">
        <div className="h-[5px] w-16 rounded bg-blue-600 mb-1.5" />
        <div className="h-[5px] w-32 rounded bg-gray-700 mb-0.5" />
        <div className="h-[4px] w-24 rounded bg-gray-400" />
      </div>
      {/* Skills */}
      <div>
        <div className="h-[5px] w-10 rounded bg-blue-600 mb-1.5" />
        <div className="flex flex-wrap gap-1">
          {["w-10", "w-8", "w-12", "w-9", "w-11", "w-8", "w-10"].map((w, i) => (
            <div key={i} className={cn("h-[14px] rounded border border-blue-200 bg-blue-50", w)} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── MODERN ─────────────────────────────────────────────────────────────────

function ModernPreview() {
  return (
    <div className="bg-white flex h-full text-[0px]">
      {/* Dark sidebar */}
      <div className="w-[33%] bg-[#1e3a5f] p-3 flex flex-col">
        <div className="h-[9px] w-full rounded bg-white/90 mb-1" />
        <div className="h-[5px] w-4/5 rounded bg-blue-300 mb-3" />
        <div className="space-y-1.5 mb-4">
          {["w-full", "w-4/5", "w-3/4", "w-full"].map((w, i) => (
            <div key={i} className={cn("h-[4px] rounded bg-white/40", w)} />
          ))}
        </div>
        {/* Skills sidebar */}
        <div className="h-[5px] w-10 rounded bg-blue-300 mb-1.5" />
        <div className="flex flex-wrap gap-1 mb-4">
          {["w-10", "w-8", "w-12", "w-9", "w-8", "w-11"].map((w, i) => (
            <div key={i} className={cn("h-[11px] rounded bg-white/20", w)} />
          ))}
        </div>
        {/* Languages */}
        <div className="h-[5px] w-14 rounded bg-blue-300 mb-1.5" />
        {["English", "Hindi"].map((_, i) => (
          <div key={i} className="mb-1.5">
            <div className="h-[4px] w-12 rounded bg-white/60 mb-0.5" />
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map((j) => (
                <div key={j} className={cn("h-[3px] flex-1 rounded-full", j <= (i === 0 ? 4 : 5) ? "bg-blue-300" : "bg-white/20")} />
              ))}
            </div>
          </div>
        ))}
      </div>
      {/* Main content */}
      <div className="flex-1 p-3">
        <div className="mb-2">
          <div className="h-[5px] w-16 rounded bg-[#1e3a5f] mb-1" />
          <Lines count={3} />
        </div>
        <div className="mb-2">
          <div className="h-[5px] w-16 rounded bg-[#1e3a5f] mb-1" />
          <div className="mb-1.5">
            <div className="flex justify-between mb-0.5">
              <div className="h-[5px] w-20 rounded bg-gray-700" />
              <div className="h-[4px] w-12 rounded bg-gray-300" />
            </div>
            <div className="h-[4px] w-16 rounded bg-gray-400 mb-1" />
            <BulletLines count={3} />
          </div>
          <div>
            <div className="flex justify-between mb-0.5">
              <div className="h-[5px] w-16 rounded bg-gray-700" />
              <div className="h-[4px] w-10 rounded bg-gray-300" />
            </div>
            <div className="h-[4px] w-14 rounded bg-gray-400 mb-1" />
            <BulletLines count={2} />
          </div>
        </div>
        <div>
          <div className="h-[5px] w-16 rounded bg-[#1e3a5f] mb-1" />
          <div className="h-[5px] w-28 rounded bg-gray-700 mb-0.5" />
          <div className="h-[4px] w-20 rounded bg-gray-400" />
        </div>
      </div>
    </div>
  );
}

// ── MINIMAL ────────────────────────────────────────────────────────────────

function MinimalPreview() {
  return (
    <div className="bg-white p-4 text-[0px]">
      {/* Header */}
      <div className="border-b border-gray-200 pb-2.5 mb-3">
        <div className="h-[12px] w-28 rounded bg-gray-800 font-light mb-1.5" />
        <div className="h-[5.5px] w-20 rounded bg-gray-500 mb-1.5" />
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {["w-14", "w-10", "w-16", "w-12"].map((w, i) => (
            <div key={i} className={cn("h-[4px] rounded bg-gray-300", w)} />
          ))}
        </div>
      </div>
      {/* Sections */}
      {[
        { label: "w-14", lines: 3 },
        { label: "w-16", lines: 0, exp: true },
        { label: "w-16", lines: 2, edOnly: true },
      ].map((s, si) => (
        <div key={si} className="mb-3">
          <div className={cn("h-[5px] rounded bg-gray-400 mb-1.5", s.label)} />
          {s.exp ? (
            <>
              <div className="flex justify-between mb-0.5">
                <div className="h-[5px] w-24 rounded bg-gray-700" />
                <div className="h-[4px] w-12 rounded bg-gray-300" />
              </div>
              <div className="h-[4px] w-20 rounded bg-gray-400 mb-1" />
              <BulletLines count={3} />
              <div className="mt-1.5 flex justify-between mb-0.5">
                <div className="h-[5px] w-20 rounded bg-gray-700" />
                <div className="h-[4px] w-10 rounded bg-gray-300" />
              </div>
              <div className="h-[4px] w-16 rounded bg-gray-400 mb-1" />
              <BulletLines count={2} />
            </>
          ) : s.edOnly ? (
            <>
              <div className="h-[5px] w-28 rounded bg-gray-700 mb-0.5" />
              <div className="h-[4px] w-20 rounded bg-gray-400 mb-0.5" />
              <Lines count={s.lines} />
            </>
          ) : (
            <Lines count={s.lines} />
          )}
        </div>
      ))}
      {/* Skills — dots */}
      <div className="h-[5px] w-10 rounded bg-gray-400 mb-1.5" />
      <div className="text-[10px] text-gray-600">
        <div className="flex flex-wrap gap-1.5">
          {["w-10", "w-7", "w-12", "w-9", "w-11", "w-8"].map((w, i) => (
            <div key={i} className={cn("h-[4.5px] rounded bg-gray-300", w)} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── EXECUTIVE ──────────────────────────────────────────────────────────────

function ExecutivePreview() {
  return (
    <div className="bg-white text-[0px] h-full">
      {/* Top header */}
      <div className="bg-[#1a2e44] px-4 py-3">
        <div className="h-[10px] w-28 rounded bg-white/90 mb-1" />
        <div className="h-[5px] w-20 rounded bg-blue-300 mb-1.5" />
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {["w-14", "w-10", "w-16", "w-14"].map((w, i) => (
            <div key={i} className={cn("h-[4px] rounded bg-white/40", w)} />
          ))}
        </div>
      </div>
      {/* Two-column body */}
      <div className="flex flex-1">
        {/* Left sidebar */}
        <div className="w-[35%] bg-gray-50 border-r border-gray-200 p-3">
          <div className="h-[5px] w-16 rounded bg-[#1a2e44] mb-1.5" />
          {["w-11", "w-8", "w-12", "w-10", "w-9", "w-11"].map((w, i) => (
            <div key={i} className="flex items-center gap-1.5 mb-1">
              <div className="h-[5px] w-[5px] rounded-full bg-blue-500 shrink-0" />
              <div className={cn("h-[4px] rounded bg-gray-300", w)} />
            </div>
          ))}
          <div className="mt-2 h-[5px] w-14 rounded bg-[#1a2e44] mb-1.5" />
          <div className="h-[5px] w-24 rounded bg-gray-700 mb-0.5" />
          <div className="h-[4px] w-16 rounded bg-gray-400 mb-1.5" />
          <div className="mt-1 h-[5px] w-20 rounded bg-[#1a2e44] mb-1.5" />
          {[["w-20", "w-14"], ["w-16", "w-12"]].map(([n, i], idx) => (
            <div key={idx} className="mb-1">
              <div className={cn("h-[4.5px] rounded bg-gray-700 mb-0.5", n)} />
              <div className={cn("h-[4px] rounded bg-gray-400", i)} />
            </div>
          ))}
        </div>
        {/* Right main */}
        <div className="flex-1 p-3">
          {/* Achievements */}
          <div className="mb-2">
            <div className="h-[5px] w-24 rounded bg-blue-700 mb-1.5 border-b border-blue-200 pb-1" />
            {[0, 1].map((i) => (
              <div key={i} className="rounded border border-amber-200 bg-amber-50 p-1.5 mb-1">
                <div className="flex gap-1 mb-0.5">
                  <div className="h-[5px] w-5 rounded bg-amber-400 shrink-0" />
                  <div className="h-[5px] w-20 rounded bg-gray-700" />
                  <div className="ml-auto h-[5px] w-10 rounded bg-emerald-300" />
                </div>
                <div className="h-[4px] w-full rounded bg-gray-200 ml-6" />
              </div>
            ))}
          </div>
          <div className="mb-2">
            <div className="h-[5px] w-14 rounded bg-blue-700 mb-1.5" />
            <Lines count={2} />
          </div>
          <div>
            <div className="h-[5px] w-14 rounded bg-blue-700 mb-1.5" />
            {[0, 1].map((i) => (
              <div key={i} className="mb-1.5">
                <div className="flex justify-between mb-0.5">
                  <div className="h-[5px] w-20 rounded bg-gray-700" />
                  <div className="h-[4px] w-12 rounded bg-gray-300" />
                </div>
                <div className="h-[4px] w-16 rounded bg-gray-400 mb-1" />
                <BulletLines count={2} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── CREATIVE ───────────────────────────────────────────────────────────────

function CreativePreview() {
  return (
    <div className="bg-white text-[0px] h-full">
      {/* Gradient header */}
      <div style={{ background: "linear-gradient(135deg, #0f2942 0%, #1d4ed8 100%)" }} className="px-4 py-3">
        <div className="h-[12px] w-28 rounded bg-white/95 mb-1" />
        <div className="h-[5px] w-20 rounded bg-blue-200 mb-2" />
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {["w-14", "w-10", "w-16"].map((w, i) => (
            <div key={i} className={cn("h-[4px] rounded bg-white/40", w)} />
          ))}
        </div>
      </div>
      {/* Two-column body */}
      <div className="flex">
        {/* Main */}
        <div className="flex-1 p-3 border-r border-gray-100">
          {/* About */}
          <div className="mb-2">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="h-[12px] w-[3px] rounded-full bg-blue-600" />
              <div className="h-[5px] w-14 rounded bg-gray-800" />
            </div>
            <Lines count={3} />
          </div>
          {/* Achievements */}
          <div className="mb-2">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="h-[12px] w-[3px] rounded-full bg-blue-600" />
              <div className="h-[5px] w-20 rounded bg-gray-800" />
            </div>
            {[0, 1].map((i) => (
              <div key={i} className="flex gap-1.5 mb-1.5">
                <div className="h-[14px] w-[14px] rounded bg-blue-600 shrink-0" />
                <div>
                  <div className="h-[5px] w-20 rounded bg-gray-700 mb-0.5" />
                  <div className="h-[4px] w-full rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
          {/* Experience */}
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <div className="h-[12px] w-[3px] rounded-full bg-blue-600" />
              <div className="h-[5px] w-16 rounded bg-gray-800" />
            </div>
            <div className="flex justify-between mb-0.5">
              <div className="h-[5px] w-20 rounded bg-gray-700" />
              <div className="h-[4px] w-12 rounded bg-gray-300" />
            </div>
            <div className="h-[4px] w-16 rounded bg-gray-400 mb-1" />
            <BulletLines count={3} />
          </div>
        </div>
        {/* Right sidebar */}
        <div className="w-[38%] p-3 bg-gray-50/60">
          {/* Skills */}
          <div className="h-[5px] w-10 rounded bg-blue-700 mb-1.5" />
          <div className="flex flex-wrap gap-1 mb-3">
            {["w-10", "w-8", "w-12", "w-9", "w-11", "w-8"].map((w, i) => (
              <div key={i} className={cn("h-[13px] rounded border border-blue-200 bg-blue-50", w)} />
            ))}
          </div>
          {/* Education */}
          <div className="h-[5px] w-14 rounded bg-blue-700 mb-1.5" />
          <div className="h-[5px] w-20 rounded bg-gray-700 mb-0.5" />
          <div className="h-[4px] w-16 rounded bg-gray-400 mb-2" />
          {/* Certs */}
          <div className="h-[5px] w-18 rounded bg-blue-700 mb-1.5" />
          {[0, 1].map((i) => (
            <div key={i} className="mb-1">
              <div className="h-[4.5px] w-20 rounded bg-gray-700 mb-0.5" />
              <div className="h-[4px] w-14 rounded bg-gray-400" />
            </div>
          ))}
          {/* Languages */}
          <div className="mt-2 h-[5px] w-14 rounded bg-blue-700 mb-1.5" />
          {[4, 5, 2].map((level, i) => (
            <div key={i} className="mb-1.5">
              <div className="flex justify-between mb-0.5">
                <div className="h-[4px] w-10 rounded bg-gray-600" />
                <div className="h-[4px] w-8 rounded bg-gray-400" />
              </div>
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map((j) => (
                  <div key={j} className={cn("h-[3px] flex-1 rounded-full", j <= level ? "bg-blue-600" : "bg-gray-200")} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main export ─────────────────────────────────────────────────────────────

export function TemplatePreviewCard({ template, className }: TemplatePreviewCardProps) {
  return (
    <div className={cn("w-full h-full overflow-hidden", className)}>
      {template === "classic"   && <ClassicPreview />}
      {template === "modern"    && <ModernPreview />}
      {template === "minimal"   && <MinimalPreview />}
      {template === "executive" && <ExecutivePreview />}
      {template === "creative"  && <CreativePreview />}
    </div>
  );
}
