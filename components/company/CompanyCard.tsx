import Link from "next/link";
import { MapPinIcon, BriefcaseIcon, UsersIcon, BadgeCheckIcon, ZapIcon } from "lucide-react";
import { CompanyAvatar } from "@/components/shared/CompanyAvatar";
import { RatingBadge } from "@/components/company/StarRating";
import { cn } from "@/lib/utils";
import type { Company } from "@/types";

type ExtendedCompany = Company & {
  responseRate?: number;
  avgResponseDays?: number;
};

interface CompanyCardProps {
  company: Company;
  className?: string;
}

export function CompanyCard({ company, className }: CompanyCardProps) {
  const ext = company as ExtendedCompany;
  return (
    <Link
      href={`/companies/${company.id}`}
      className={cn(
        "group flex flex-col gap-4 rounded-2xl border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-md",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <CompanyAvatar name={company.name} logoUrl={company.logo} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
              {company.name}
            </h3>
            {company.verified && (
              <BadgeCheckIcon className="h-4 w-4 shrink-0 text-primary" />
            )}
          </div>
          <p className="text-sm text-muted-foreground">{company.industry}</p>
          {(company.averageRating ?? 0) > 0 && (
            <div className="mt-1">
              <RatingBadge
                rating={company.averageRating ?? 0}
                count={company.reviewCount}
                size="sm"
              />
            </div>
          )}
        </div>
      </div>

      {/* Response rate badge */}
      {ext.responseRate != null && (
        <div className="flex items-center gap-1.5 text-xs">
          <span className={cn(
            "flex items-center gap-1 rounded-full px-2 py-0.5 font-medium",
            ext.responseRate >= 80
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
              : ext.responseRate >= 50
              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
              : "bg-muted text-muted-foreground"
          )}>
            <ZapIcon className="h-3 w-3" />
            {ext.responseRate}% response rate
          </span>
          {ext.avgResponseDays != null && (
            <span className="text-muted-foreground">
              ~ {ext.avgResponseDays}d reply
            </span>
          )}
        </div>
      )}

      {company.description && (
        <p className="text-sm text-muted-foreground line-clamp-2">
          {company.description}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground border-t pt-3 mt-auto">
        {company.location?.city && (
          <span className="flex items-center gap-1">
            <MapPinIcon className="h-3.5 w-3.5" />
            {company.location.city}
          </span>
        )}
        <span className="flex items-center gap-1">
          <UsersIcon className="h-3.5 w-3.5" />
          {company.size} employees
        </span>
        {(company.jobCount ?? 0) > 0 && (
          <span className="flex items-center gap-1 ml-auto text-primary font-medium">
            <BriefcaseIcon className="h-3.5 w-3.5" />
            {company.jobCount} open {company.jobCount === 1 ? "job" : "jobs"}
          </span>
        )}
      </div>
    </Link>
  );
}

export function CompareButton({ companyId }: { companyId: string }) {
  return (
    <Link
      href={`/companies/compare?ids=${companyId}`}
      onClick={(e) => e.stopPropagation()}
      className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors"
    >
      Compare
    </Link>
  );
}
