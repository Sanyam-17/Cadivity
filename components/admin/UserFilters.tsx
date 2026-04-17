"use client";

import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";
import { UserSearch } from "./UserSearch";

export function UserFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/admin/users?${params.toString()}`);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 items-center">
      <UserSearch baseUrl="/admin/users" />
      
      <div className="flex gap-2">
        <Select 
          defaultValue={searchParams.get("role") || "all"} 
          onValueChange={(val) => updateParam("role", val)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="instructor">Instructor</SelectItem>
            <SelectItem value="student">Student</SelectItem>
          </SelectContent>
        </Select>

        <Select 
          defaultValue={searchParams.get("active") || "all"} 
          onValueChange={(val) => updateParam("active", val)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="true">Active</SelectItem>
            <SelectItem value="false">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
