"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { UserMinus, UserPlus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ROLES, VALID_ROLES } from "@/lib/roles";

interface UserActionsProps {
  userId: string;
  isActive: boolean;
  currentRole: string;
  userName: string;
}

export function UserActions({ userId, isActive, currentRole, userName }: UserActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleUpdate = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Action failed");
      }
      
      toast.success("User updated successfully");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Delete failed");
      
      toast.success("User deleted permanently");
      router.refresh();
    } catch (error) {
      toast.error("Failed to delete user");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Role Change Dropdown */}
      <Select 
        disabled={isLoading} 
        onValueChange={(val) => handleUpdate({ role: val })} 
        defaultValue={currentRole}
      >
        <SelectTrigger className="h-8 w-[130px] text-xs">
          <SelectValue placeholder="Role" />
        </SelectTrigger>
        <SelectContent>
          {VALID_ROLES.map((role) => (
            <SelectItem key={role} value={role} className="text-xs uppercase">
              {role}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Toggle Status */}
      <Button
        variant="outline"
        size="icon"
        className={`h-8 w-8 ${isActive ? "text-orange-600" : "text-emerald-600"}`}
        title={isActive ? "Deactivate" : "Activate"}
        disabled={isLoading}
        onClick={() => handleUpdate({ active: !isActive })}
      >
        {isActive ? <UserMinus className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
      </Button>

      {/* Hard Delete */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" size="icon" className="h-8 w-8 text-destructive" disabled={isLoading}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Permanent Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {userName}? This will remove all their 
              data, enrollments, and progress. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete Forever
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
