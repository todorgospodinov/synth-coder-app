import { Link } from "@tanstack/react-router";
import type { AiReview } from "@/lib/ai-check.functions";

const VERDICT: Record<AiReview["verdict"], { label: string; cls: string }> = {
  correct: { label: "Correct", cls: "text-accent" },
  partially_correct: { label: "Partially correct", cls: "text-violet" },
  incorrect: { label: "Incorrect", cls: "text-destructive" },
};

export function AiReviewPanel({
  review,
  loading,
  error,
  signedIn,
}: {
  review: AiReview | null;
  loading: boolean;
  error: string | null;
  signedIn: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-glass backdrop-blur-xl">
      <h2 className="text-sm font-semibold">Gemini AI review</h2>
      {!signedIn && (
        <p className="mt-2 text-sm text-muted-foreground">
          <Link to="/login" className="text-foreground underline underline-offset-4">Sign in</Link> to check your solution with AI.
        </p>
      )}
      {signedIn && loading && <p className="mt-2 text-sm text-muted-foreground">Gemini is reviewing your code…</p>}
      {signedIn && error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      {signedIn && !loading && !error && !review && (
        <p className="mt-2 text-sm text-muted-foreground">Write the task and your solution, then press "Check with AI".</p>
      )}
      {review && !loading && (
        <div className="mt-3 space-y-3 text-sm">
          <div className="flex items-baseline gap-3">
            <span className={`text-lg font-semibold ${VERDICT[review.verdict].cls}`}>{VERDICT[review.verdict].label}</span>
            <span className="font-mono text-muted-foreground">{review.score}/100</span>
          </div>
          {review.summary && <p className="text-muted-foreground">{review.summary}</p>}
          {review.issues.length > 0 && (
            <div>
              <div className="font-medium">Issues</div>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-muted-foreground">{review.issues.map((x, i) => <li key={i}>{x}</li>)}</ul>
            </div>
          )}
          {review.suggestions.length > 0 && (
            <div>
              <div className="font-medium">Hints</div>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-muted-foreground">{review.suggestions.map((x, i) => <li key={i}>{x}</li>)}</ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
