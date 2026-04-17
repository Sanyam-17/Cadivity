import { Badge } from "@/components/ui/badge";
import { ROLES, type UserRole } from "@/lib/roles";
import { cn } from "@/lib/utils";

interface RoleBadgeProps {
  role: string | UserRole;
  className?: string;
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  let badgeStyle = "bg-gray-100 text-gray-700 border-gray-200";
  
  if (role === ROLES.ADMIN) {
    badgeStyle = "bg-purple-100 text-purple-700 border-purple-200";
  } else if (role === ROLES.INSTRUCTOR) {
    badgeStyle = "bg-blue-100 text-blue-700 border-blue-200";
  } else if (role === ROLES.STUDENT) {
    badgeStyle = "bg-slate-100 text-slate-600 border-slate-200";
  }

  return (
    <Badge 
      variant="outline" 
      className={cn("capitalize px-2.5 py-0.5 font-medium", badgeStyle, className)}
    >
      {role}
    </Badge>
  );
}
