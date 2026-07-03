"use client";

import React, { useState, useEffect, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Send, Trash2, Pin, ShieldCheck, User as UserIcon, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";

interface CommentAuthor {
  id: string;
  name: string;
  image: string | null;
  role: string;
}

interface Comment {
  id: string;
  lessonId: string;
  authorId: string;
  content: string;
  parentId: string | null;
  isInstructorAnswer: boolean;
  isPinned: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  author: CommentAuthor;
  replies?: Comment[];
}

interface LessonDiscussionProps {
  lessonId: string;
}

export function LessonDiscussion({ lessonId }: LessonDiscussionProps) {
  const { data: session } = authClient.useSession();
  const currentUserRole = (session?.user as any)?.role || "student";
  const currentUserId = session?.user?.id;

  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Polling ref
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchComments = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const res = await fetch(`/api/lessons/${lessonId}/comments`);
      if (res.ok) {
        const json = await res.json();
        setComments(json.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch comments", error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments(true);
    
    // Polling every 30s
    pollIntervalRef.current = setInterval(() => {
      fetchComments();
    }, 30000);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [lessonId]);

  const handleSubmit = async (e: React.FormEvent, parentId: string | null = null) => {
    e.preventDefault();
    const content = parentId ? newComment : newComment; // if it's a reply, use the same state or separate?
    // Actually, we should probably have a separate state for replies to avoid conflict.
    // For simplicity, let's just use `newComment` and clear `replyTo`.
    if (!content.trim()) return;

    setSubmitting(true);
    try {
      // Optimistic update
      const optimisticComment: Comment = {
        id: "temp-" + Date.now(),
        lessonId,
        authorId: currentUserId || "me",
        content,
        parentId,
        isInstructorAnswer: currentUserRole === "instructor" || currentUserRole === "admin",
        isPinned: false,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        author: {
          id: currentUserId || "me",
          name: "You",
          image: null,
          role: currentUserRole,
        },
        replies: [],
      };

      if (parentId) {
        setComments(prev => prev.map(c => 
          c.id === parentId ? { ...c, replies: [...(c.replies || []), optimisticComment] } : c
        ));
      } else {
        setComments(prev => [optimisticComment, ...prev]);
      }

      setNewComment("");
      setReplyTo(null);

      const res = await fetch(`/api/lessons/${lessonId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, parentId }),
      });

      if (!res.ok) {
        toast.error("Failed to post comment. You might be rate-limited.");
        // Revert optimistic update
        fetchComments();
        return;
      }

      // Fetch fresh to get real ID
      fetchComments();
    } catch (error) {
      toast.error("Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      // Optimistic delete
      setComments(prev => 
        prev.filter(c => c.id !== commentId).map(c => ({
          ...c,
          replies: c.replies?.filter(r => r.id !== commentId)
        }))
      );

      const res = await fetch(`/api/lessons/${lessonId}/comments/${commentId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        toast.error("Failed to delete comment");
        fetchComments(); // revert
      }
    } catch (error) {
      console.error(error);
    }
  };

  const renderComment = (comment: Comment, isReply = false) => {
    const isAuthor = currentUserId === comment.authorId;
    const canDelete = isAuthor || currentUserRole === "admin";
    const isAdmin = currentUserRole === "admin";

    return (
      <div key={comment.id} className={cn("flex gap-3", isReply ? "ml-8 mt-4" : "mt-6")}>
        <div className="flex-shrink-0">
          {comment.author.image ? (
            <img src={comment.author.image} alt={comment.author.name} className="w-8 h-8 rounded-full bg-slate-800" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
              <UserIcon className="w-4 h-4" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm text-slate-200">{comment.author.name}</span>
            {["instructor", "admin"].includes(comment.author.role) && (
              <span className="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Instructor
              </span>
            )}
            <span className="text-xs text-slate-500">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </span>
            {comment.isPinned && !isReply && (
              <span className="text-amber-500 flex items-center gap-1 text-xs">
                <Pin className="w-3 h-3" /> Pinned
              </span>
            )}
          </div>
          
          <div className={cn(
            "text-sm text-slate-300 whitespace-pre-wrap leading-relaxed",
            comment.isInstructorAnswer ? "bg-sky-500/10 border border-sky-500/20 p-3 rounded-lg" : ""
          )}>
            {comment.content}
          </div>

          <div className="flex items-center gap-4 mt-2">
            {!isReply && (
              <button 
                onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                className="text-xs text-slate-500 hover:text-slate-300 font-medium"
              >
                Reply
              </button>
            )}
            {canDelete && (
              <button 
                onClick={() => handleDelete(comment.id)}
                className="text-xs text-rose-500/70 hover:text-rose-500 font-medium flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> Delete
              </button>
            )}
          </div>

          {replyTo === comment.id && !isReply && (
            <form onSubmit={(e) => handleSubmit(e, comment.id)} className="mt-3 flex gap-2">
              <input
                type="text"
                placeholder="Write a reply..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                maxLength={2000}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-primary"
              />
              <Button type="submit" size="sm" disabled={!newComment.trim() || submitting}>
                <Send className="w-4 h-4" />
              </Button>
            </form>
          )}

          {/* Render Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-2 space-y-2">
              {comment.replies.map(reply => renderComment(reply, true))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full bg-slate-900 border-t border-slate-800">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-slate-400" />
          <h3 className="font-display font-bold text-white">Lesson Discussion</h3>
          <span className="bg-slate-800 text-slate-300 text-xs px-2 py-0.5 rounded-full font-mono">
            {comments.length}
          </span>
        </div>
        {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
      </button>

      {isExpanded && (
        <div className="px-6 pb-6">
          <form onSubmit={(e) => handleSubmit(e, null)} className="mb-6 mt-2 relative">
            <textarea
              placeholder="Ask a question or share your thoughts..."
              value={replyTo === null ? newComment : ""}
              onChange={(e) => {
                if (replyTo !== null) setReplyTo(null);
                setNewComment(e.target.value);
              }}
              maxLength={2000}
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-primary resize-none"
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-slate-500 font-mono">
                {newComment.length}/2000
              </span>
              <Button type="submit" disabled={!newComment.trim() || submitting || replyTo !== null} size="sm">
                {submitting && replyTo === null ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                Post Comment
              </Button>
            </div>
          </form>

          {loading && comments.length === 0 ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              No comments yet. Be the first to start the discussion!
            </div>
          ) : (
            <div className="space-y-2 divide-y divide-slate-800/50">
              {comments.map(c => renderComment(c, false))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
