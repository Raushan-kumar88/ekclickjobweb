import Image from "next/image";
import { cn } from "@/lib/utils";

const AVATAR_COLORS = [
  "#6D28D9", "#2563EB", "#0D9488", "#059669",
  "#D97706", "#E11D48", "#4F46E5", "#0891B2",
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

interface CompanyAvatarProps {
  name: string;
  logoUrl?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  xs: { container: "h-7 w-7 text-[10px] rounded-lg", image: 28 },
  sm: { container: "h-9 w-9 text-xs rounded-xl", image: 36 },
  md: { container: "h-12 w-12 text-sm rounded-xl", image: 48 },
  lg: { container: "h-16 w-16 text-base rounded-2xl", image: 64 },
  xl: { container: "h-20 w-20 text-lg rounded-2xl", image: 80 },
};

export function CompanyAvatar({ name, logoUrl, size = "md", className }: CompanyAvatarProps) {
  const { container, image } = sizeMap[size];
  const color = getAvatarColor(name || "?");
  const initials = getInitials(name || "?");

  if (logoUrl) {
    return (
      <div
        className={cn(
          "relative shrink-0 overflow-hidden border bg-white dark:bg-zinc-900",
          container,
          className
        )}
      >
        <Image
          src={logoUrl}
          alt={`${name} logo`}
          width={image}
          height={image}
          className="h-full w-full object-contain p-1"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center font-bold text-white",
        container,
        className
      )}
      style={{ backgroundColor: color }}
      aria-label={name}
    >
      {initials}
    </div>
  );
}
