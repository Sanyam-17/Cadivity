import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconClassName?: string;
  trend?: { value: string | number; label: string; color?: string };
}

export function StatsCard({ title, value, icon, iconClassName, trend }: StatsCardProps) {
  return (
    <Card className="relative overflow-hidden border border-slate-100 shadow-sm bg-white rounded-xl">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", iconClassName || "bg-blue-50")}>
            <div className="h-5 w-5">
              {icon}
            </div>
          </div>
          {trend && (
            <span
              className={cn(
                "text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-tight",
                trend.color || "bg-emerald-50 text-emerald-600"
              )}
            >
              {trend.value}
            </span>
          )}
        </div>
        <div className="mt-4 space-y-0.5">
          <p className="text-[12px] font-medium text-slate-500 uppercase tracking-tight">{title}</p>
          <div className="text-3xl font-black text-slate-800 tracking-tighter">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}
