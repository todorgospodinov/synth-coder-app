import { useState, type FormEvent } from "react";
import type { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AuthCard, FormError } from "@/components/auth/AuthCard";
import { getFullName } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** Edits full name (stored in user_metadata) and email. */
export function EditProfileForm({ user }: { user: User }) {
  const [fullName, setFullName] = useState(getFullName(user));
  const [email, setEmail] = useState(user.email ?? "");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const emailChanged = email.trim() !== (user.email ?? "");
    const { error } = await supabase.auth.updateUser(
      { data: { full_name: fullName.trim() }, ...(emailChanged ? { email: email.trim() } : {}) },
      { emailRedirectTo: window.location.origin },
    );
    setBusy(false);
    if (error) return setError(error.message);
    toast.success(emailChanged ? "Profile saved. Confirm the new email via the link we sent." : "Profile saved.");
  }

  return (
    <AuthCard title="Profile" subtitle="Update your name and email.">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <FormError message={error} />
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? "Saving…" : "Save profile"}
        </Button>
      </form>
    </AuthCard>
  );
}
