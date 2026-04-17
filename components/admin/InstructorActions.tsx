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
import { UserMinus, UserPlus, GraduationCap } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ROLES } from "@/lib/roles";

interface InstructorActionsProps {
  instructorId: string;
  isActive: boolean;
  instructorName: string;
}

export function InstructorActions({ instructorId, isActive, instructorName }: InstructorActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const toggleStatus = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${instructorId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !isActive }),
      });

      if (!res.ok) throw new Error("Failed to update status");
      
      toast.success(`${instructorName} is now ${isActive ? "inactive" : "active"}`);
      router.refresh();
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setIsLoading(false);
    }
  };

  const demoteToStudent = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${instructorId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: ROLES.STUDENT }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to demote instructor");
      }
      
      toast.success(`${instructorName} has been demoted to Student`);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Demotion failed");
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
                ? `Deactivating ${instructorName} will prevent them from accessing their instructor dashboard and courses.` 
                : `Reactivating ${instructorName} will restore their instructor access.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={toggleStatus} className={isActive ? "bg-orange-600 hover:bg-orange-700" : "bg-emerald-600 hover:bg-emerald-700"}>
              {isActive ? "Deactivate" : "Activate"} Instructor
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Demote to Student */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 text-blue-600 hover:text-blue-700"
            title="Demote to Student"
            disabled={isLoading}
          >
            <GraduationCap className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Demote to Student?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove {instructorName}'s teaching privileges. They will no longer be able 
              to manage their courses. This action is logged.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={demoteToStudent} className="bg-blue-600 hover:bg-blue-700">
              Demote
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
