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
import { Eye as EyeIcon, Power as PowerIcon, PowerOff as PowerOffIcon, Trash2 as TrashIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface CourseActionsProps {
  courseId: string;
  isPublished: boolean;
  courseSlug: string;
}

export function CourseActions({ courseId, isPublished, courseSlug }: CourseActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const togglePublish = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/courses/${courseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !isPublished }),
      });

      if (!res.ok) throw new Error("Failed to toggle status");
      
      toast.success(isPublished ? "Course unpublished" : "Course published");
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCourse = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/courses/${courseId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete course");
      
      toast.success("Course deleted permanently");
      router.refresh();
    } catch (error) {
      toast.error("Failed to delete course");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        title="View Course"
        onClick={() => window.open(`/courses/${courseSlug}`, "_blank")}
      >
        <EyeIcon className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        className={`h-8 w-8 ${isPublished ? "text-amber-600 hover:text-amber-700" : "text-emerald-600 hover:text-emerald-700"}`}
        title={isPublished ? "Unpublish" : "Publish"}
        onClick={togglePublish}
        disabled={isLoading}
      >
        {isPublished ? <PowerOffIcon className="h-4 w-4" /> : <PowerIcon className="h-4 w-4" />}
      </Button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" title="Delete Course" disabled={isLoading}>
            <TrashIcon className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the course,
              including all its modules, lessons, and student enrollments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteCourse} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Course
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
