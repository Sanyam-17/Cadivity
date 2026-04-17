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
import { UserMinus, UserPlus, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ROLES } from "@/lib/roles";

interface StudentActionsProps {
  studentId: string;
  isActive: boolean;
  studentName: string;
}

export function StudentActions({ studentId, isActive, studentName }: StudentActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const toggleStatus = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${studentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !isActive }),
      });

      if (!res.ok) throw new Error("Failed to update status");
      
      toast.success(`${studentName} is now ${isActive ? "inactive" : "active"}`);
      router.refresh();
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setIsLoading(false);
    }
  };

  const promoteToInstructor = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${studentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: ROLES.INSTRUCTOR }),
      });

      if (!res.ok) throw new Error("Failed to promote student");
      
      toast.success(`${studentName} has been promoted to Instructor`);
      router.refresh();
    } catch (error) {
      toast.error("Promotion failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Active/Inactive Toggle */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className={`h-8 w-8 ${isActive ? "text-orange-600 hover:text-orange-700" : "text-emerald-600 hover:text-emerald-700"}`}
            title={isActive ? "Deactivate" : "Activate"}
            disabled={isLoading}
          >
            {isActive ? <UserMinus className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {isActive 
                ? `Deactivating ${studentName} will prevent them from logging in or access their courses.` 
                : `Reactivating ${studentName} will restore their access to the platform.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={toggleStatus} className={isActive ? "bg-orange-600 hover:bg-orange-700" : "bg-emerald-600 hover:bg-emerald-700"}>
              {isActive ? "Deactivate" : "Activate"} User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Promote to Instructor */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 text-blue-600 hover:text-blue-700"
            title="Promote to Instructor"
            disabled={isLoading}
          >
            <ShieldAlert className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Promote to Instructor?</AlertDialogTitle>
            <AlertDialogDescription>
              This will grant {studentName} the ability to create and manage courses. 
              This action is logged for audit purposes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={promoteToInstructor} className="bg-blue-600 hover:bg-blue-700">
              Promote
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
