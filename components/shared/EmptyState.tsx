import React from "react";
import Link from "next/link";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/lib/utils/button-variants";

type ActionShape = { label: string; href?: string; onClick?: () => void };

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode | ActionShape;
  className?: string;
}

function isActionShape(action: unknown): action is ActionShape {
  return typeof action === "object" && action !== null && "label" in action;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  let actionNode: React.ReactNode = null;
  if (isActionShape(action)) {
    if (action.href) {
      actionNode = (
        <Link href={action.href} className={buttonVariants({ variant: "outline" })}>
          {action.label}
        </Link>
      );
    } else if (action.onClick) {
      actionNode = (
        <button
          onClick={action.onClick}
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          {action.label}
        </button>
      );
    }
  } else {
    actionNode = action as React.ReactNode;
  }

  return (
    <div className={cn("flex flex-col items-center justify-center gap-4 py-16 text-center", className)}>
      {Icon && (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
      )}
      <div className="space-y-1">
        <p className="text-base font-semibold">{title}</p>
        {description && (
          <p className="text-sm text-muted-foreground max-w-xs">{description}</p>
        )}
      </div>
      {actionNode && <div className="mt-2">{actionNode}</div>}
    </div>
  );
}
