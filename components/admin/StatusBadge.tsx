import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status?: string | boolean;
  type?: "course" | "user";
  className?: string;
}

export function StatusBadge({ status, type = "course", className }: StatusBadgeProps) {
  let label = String(status);
  let badgeStyle = "bg-gray-100 text-gray-700 border-gray-200";

  if (type === "course") {
    const isPublished = typeof status === "boolean" ? status : status === "published";
    label = isPublished ? "Published" : "Draft";
    badgeStyle = isPublished 
      ? "bg-emerald-100 text-emerald-700 border-emerald-200" 
      : "bg-amber-100 text-amber-700 border-amber-200";
  } else if (type === "user") {
    const isActive = typeof status === "boolean" ? status : status === "active" || status === "true";
    label = isActive ? "Active" : "Inactive";
    badgeStyle = isActive 
      ? "bg-emerald-100 text-emerald-700 border-emerald-200" 
      : "bg-orange-100 text-orange-700 border-orange-200";
  }

  return (
    <Badge 
      variant="outline" 
      className={cn("capitalize px-2.5 py-0.5 font-medium", badgeStyle, className)}
    >
      {label}
    </Badge>
  );
}
