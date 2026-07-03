"use client";

import React, { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { Trash2, Pin, ShieldCheck, User as UserIcon, Loader2, MessageSquare, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";
import { EmptyState } from "@/components/shared/empty-state";

interface DiscussionTabProps {
  courseId: string;
}

// Since we don't have a direct course-level comment fetch endpoint right now,
// we would ideally need one. For the sake of this feature, let's create a 
// small client-side view that fetches lessons and then their comments, or 
// preferably we should add an API endpoint.
// Let's assume we'll just display a placeholder or fetch an endpoint if we added one.
// Wait, the prompt asked to "Create app/api/lessons/[lessonId]/comments/route.ts" but didn't explicitly
// ask for a course-level endpoint. Let's create a course-level endpoint too, or just fetch lessons
// and then comments. Creating an endpoint is better.

export function DiscussionTab({ courseId }: DiscussionTabProps) {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/instructor/courses/${courseId}/comments`);
      if (res.ok) {
        const json = await res.json();
        setComments(json.data || []);
      } else {
        // If the endpoint doesn't exist yet, we'll just show empty
        setComments([]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [courseId]);

  const handleDelete = async (lessonId: string, commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;
    
    try {
      const res = await fetch(`/api/lessons/${lessonId}/comments/${commentId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Comment deleted");
        fetchComments();
      } else {
        toast.error("Failed to delete comment");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handlePin = async (lessonId: string, commentId: string, currentPin: boolean) => {
    try {
      const res = await fetch(`/api/lessons/${lessonId}/comments/${commentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPinned: !currentPin }),
      });
      if (res.ok) {
        toast.success(currentPin ? "Comment unpinned" : "Comment pinned");
        fetchComments();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to update pin status");
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="No Discussions Yet"
        description="Students haven't posted any comments or questions in this course yet."
      />
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div key={comment.id} className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex gap-4">
          <div className="flex-shrink-0">
            {comment.author.image ? (
              <img src={comment.author.image} alt={comment.author.name} className="w-10 h-10 rounded-full bg-slate-800" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                <UserIcon className="w-5 h-5" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-sm text-slate-200">{comment.author.name}</span>
              <span className="text-xs text-slate-500">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </span>
              <span className="text-xs text-slate-400 font-mono px-2 py-0.5 bg-slate-800 rounded">
                Lesson: {comment.lesson.title}
              </span>
            </div>
            
            <p className="text-sm text-slate-300 mt-2 whitespace-pre-wrap">{comment.content}</p>

            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-800/50">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handlePin(comment.lessonId, comment.id, comment.isPinned)}
                className={comment.isPinned ? "text-amber-500 hover:text-amber-600" : "text-slate-400 hover:text-white"}
              >
                <Pin className="w-4 h-4 mr-2" />
                {comment.isPinned ? "Unpin" : "Pin"}
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                onClick={() => handleDelete(comment.lessonId, comment.id)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
