"use client";

import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";

export function AuditLogFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateAction = (val: string) => {
    const params = new URLSearchParams(searchParams);
    if (val && val !== "all") {
      params.set("action", val);
    } else {
      params.delete("action");
    }
    params.set("page", "1"); // reset to page 1 on filter change
    router.push(`/admin/audit-logs?${params.toString()}`);
  };

  return (
    <div className="flex gap-2">
      <Select 
        defaultValue={searchParams.get("action") || "all"} 
        onValueChange={updateAction}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Filter by action" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Actions</SelectItem>
          <SelectItem value="ROLE_CHANGE">Role Change</SelectItem>
          <SelectItem value="COURSE_DELETE">Course Delete</SelectItem>
          <SelectItem value="COURSE_TOGGLE_PUBLISH">Course Publish Toggle</SelectItem>
          <SelectItem value="USER_DEACTIVATE">User Deactivate</SelectItem>
          <SelectItem value="USER_REACTIVATE">User Reactivate</SelectItem>
          <SelectItem value="USER_DELETE">User Delete</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
