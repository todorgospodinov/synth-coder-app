import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

/** Tracks the current signed-in user (client-side only). */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return { user, loading };
}

export function getFullName(user: User | null): string {
  const name = user?.user_metadata?.["full_name"];
  return typeof name === "string" ? name : "";
}

/** Admin flag lives in app_metadata (server-controlled; users can't edit it). */
export function isAdmin(user: User | null): boolean {
  return user?.app_metadata?.["is_admin"] === true;
}
