import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getFullName, isAdmin, useAuth } from "@/hooks/use-auth";

/** Session-aware header actions: sign in / register, or profile + sign out. */
export function HeaderAuth() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/login", replace: true });
  }

  if (loading) return <div className="h-9 w-40" />;

  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <Link to="/login" className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:block">
          Sign in
        </Link>
        <Link to="/register" className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:opacity-90">
          Get started
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {isAdmin(user) && (
        <Link to="/admin" className="text-sm text-accent transition-colors hover:text-foreground">
          Admin
        </Link>
      )}
      <Link to="/profile" className="hidden max-w-[16ch] truncate text-sm text-muted-foreground transition-colors hover:text-foreground sm:block">
        {getFullName(user) || user.email}
      </Link>
      <button type="button" onClick={signOut} className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition hover:bg-secondary">
        Sign out
      </button>
    </div>
  );
}
