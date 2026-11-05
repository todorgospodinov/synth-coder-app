import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { oauthReturnPath } from "@/lib/oauth-return-path";
import { AuthCard, FormError } from "@/components/auth/AuthCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create account — CodeTrainer" },
      { name: "description", content: "Create a free CodeTrainer account and start solving Python tasks." },
      { property: "og:title", content: "Create account — CodeTrainer" },
      { property: "og:description", content: "Create a free CodeTrainer account and start solving Python tasks." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  validateSearch: (s: Record<string, unknown>): { next?: string | undefined } => ({ next: typeof s["next"] === "string" ? s["next"] : undefined }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const { next } = Route.useSearch();
  const back = oauthReturnPath(next);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: new URL(back, window.location.origin).href,
        data: { full_name: fullName.trim() },
      },
    });
    setBusy(false);
    if (error) return setError(error.message);
    if (data.session) { if (back !== "/") window.location.href = back; else navigate({ to: "/" }); }
    else setSent(true);
  }

  if (sent) {
    return (
      <main className="mx-auto flex w-[min(1120px,92%)] flex-1 items-center justify-center py-16">
        <AuthCard title="Check your email" subtitle={`We sent a confirmation link to ${email}. Click it to activate your account.`}>
          <Link to="/login" className="text-sm text-foreground underline-offset-4 hover:underline">
            Back to sign in
          </Link>
        </AuthCard>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-[min(1120px,92%)] flex-1 items-center justify-center py-16">
      <AuthCard
        title="Create your account"
        subtitle="Start publishing and solving Python tasks."
        footer={
          <>
            Already registered?{" "}
            <Link to="/login" search={{ next }} className="text-foreground underline-offset-4 hover:underline">
              Sign in
            </Link>
          </>
        }
      >
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="fullName">Full name</Label>
            <Input id="fullName" autoComplete="name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <FormError message={error} />
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Creating account…" : "Create account"}
          </Button>
        </form>
      </AuthCard>
    </main>
  );
}
