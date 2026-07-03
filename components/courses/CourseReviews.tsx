"use client";

import * as React from "react";
import { Star, ThumbsUp, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Review {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  helpfulCount: number;
  createdAt: string;
  student: { id: string; name: string; image: string | null };
}

interface CourseReviewsProps {
  slug: string;
  isEnrolled: boolean;
  currentUserId?: string;
}

function StarRating({
  value,
  onChange,
  size = "md",
}: {
  value: number;
  onChange?: (v: number) => void;
  size?: "sm" | "md" | "lg";
}) {
  const [hovered, setHovered] = React.useState(0);
  const sz = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-7 w-7" : "h-5 w-5";

  return (
    <div className="flex gap-0.5" role="radiogroup" aria-label="Star rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          onMouseEnter={() => onChange && setHovered(star)}
          onMouseLeave={() => onChange && setHovered(0)}
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
          aria-pressed={value >= star}
          className={cn("transition-transform duration-150", onChange && "hover:scale-110 cursor-pointer")}
        >
          <Star
            className={cn(
              sz,
              (hovered || value) >= star
                ? "fill-amber-400 text-amber-400"
                : "fill-slate-200 text-slate-200"
            )}
          />
        </button>
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const initials = review.student.name.slice(0, 2).toUpperCase();
  const date = new Date(review.createdAt).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {review.student.image ? (
            <img
              src={review.student.image}
              alt={review.student.name}
              className="h-9 w-9 rounded-full object-cover border border-slate-200"
            />
          ) : (
            <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary">
              {initials}
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-slate-900">{review.student.name}</p>
            <p className="text-xs text-slate-400">{date}</p>
          </div>
        </div>
        <StarRating value={review.rating} size="sm" />
      </div>

      {review.title && (
        <p className="text-sm font-semibold text-slate-800">{review.title}</p>
      )}
      {review.body && (
        <p className="text-sm text-slate-600 leading-relaxed">{review.body}</p>
      )}

      <div className="flex items-center gap-1.5 text-xs text-slate-400 pt-1">
        <ThumbsUp className="h-3.5 w-3.5" aria-hidden="true" />
        {review.helpfulCount} found helpful
      </div>
    </div>
  );
}

export function CourseReviews({ slug, isEnrolled, currentUserId }: CourseReviewsProps) {
  const [reviews, setReviews] = React.useState<Review[]>([]);
  const [avgRating, setAvgRating] = React.useState(0);
  const [totalReviews, setTotalReviews] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  /* Write-review form state */
  const [showForm, setShowForm] = React.useState(false);
  const [myRating, setMyRating] = React.useState(0);
  const [myTitle, setMyTitle] = React.useState("");
  const [myBody, setMyBody] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);

  React.useEffect(() => {
    fetch(`/api/courses/${slug}/reviews`)
      .then((r) => r.json())
      .then((data) => {
        setReviews(data.reviews ?? []);
        setAvgRating(data.avgRating ?? 0);
        setTotalReviews(data.totalReviews ?? 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug, submitted]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (myRating === 0) {
      setSubmitError("Please select a star rating.");
      return;
    }
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch(`/api/courses/${slug}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: myRating, title: myTitle, body: myBody }),
      });
      if (!res.ok) {
        const err = await res.json();
        setSubmitError(err.error ?? "Failed to submit review.");
        return;
      }
      setSubmitted(true);
      setShowForm(false);
      setMyRating(0);
      setMyTitle("");
      setMyBody("");
    } catch {
      setSubmitError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  /* Rating distribution */
  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  const alreadyReviewed = currentUserId
    ? reviews.some((r) => r.student.id === currentUserId)
    : false;

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold font-display tracking-tight text-slate-900 border-l-4 border-primary pl-4">
        Student Reviews
      </h2>

      {/* Summary row */}
      {!loading && totalReviews > 0 && (
        <div className="flex flex-col sm:flex-row gap-6 items-start bg-slate-50 border border-slate-200 rounded-2xl p-5">
          {/* Average */}
          <div className="flex flex-col items-center shrink-0 min-w-[80px]">
            <span className="text-5xl font-extrabold text-slate-900 font-display leading-none">
              {avgRating.toFixed(1)}
            </span>
            <StarRating value={Math.round(avgRating)} size="sm" />
            <p className="text-xs text-slate-400 mt-1">{totalReviews} reviews</p>
          </div>

          {/* Bar chart */}
          <div className="flex-1 space-y-2 w-full">
            {distribution.map(({ star, count }) => {
              const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
              return (
                <div key={star} className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 w-3 shrink-0">{star}</span>
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400 shrink-0" aria-hidden="true" />
                  <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-400 w-8 text-right shrink-0">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Write review */}
      {isEnrolled && !alreadyReviewed && !showForm && (
        <Button
          onClick={() => setShowForm(true)}
          variant="outline"
          className="border-primary text-primary hover:bg-primary/5"
        >
          Write a Review
        </Button>
      )}

      {isEnrolled && showForm && (
        <form onSubmit={handleSubmit} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
          <p className="font-semibold text-slate-800">Your Rating</p>
          <StarRating value={myRating} onChange={setMyRating} size="lg" />
          <input
            type="text"
            placeholder="Review title (optional)"
            value={myTitle}
            onChange={(e) => setMyTitle(e.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          />
          <textarea
            placeholder="Share what you liked or what could be improved…"
            value={myBody}
            onChange={(e) => setMyBody(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          />
          {submitError && <p className="text-red-500 text-sm">{submitError}</p>}
          <div className="flex gap-3">
            <Button type="submit" disabled={submitting} className="gap-2">
              {submitting ? (
                <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Submitting…</>
              ) : (
                <><Send className="h-4 w-4" aria-hidden="true" /> Submit Review</>
              )}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {submitted && (
        <p className="text-emerald-600 text-sm font-medium">
          ✓ Your review has been submitted. Thank you!
        </p>
      )}

      {/* Review list */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-28 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
          <Star className="h-8 w-8 text-slate-300 mx-auto mb-3" aria-hidden="true" />
          <p className="text-slate-500 text-sm">No reviews yet. Be the first to leave one!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <ReviewCard key={r.id} review={r} />
          ))}
        </div>
      )}
    </section>
  );
}
