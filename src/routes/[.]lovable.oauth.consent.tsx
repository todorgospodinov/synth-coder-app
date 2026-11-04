import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthCard, FormError } from "@/components/auth/AuthCard";
import { Button } from "@/components/ui/button";

type OAuthResult = { data: Record<string, any> | null; error: { message: string } | null };
type OAuthApi = {
  getAuthorizationDetails(id: string): Promise<OAuthResult>;
  approveAuthorization(id: string): Promise<OAuthResult>;
  denyAuthorization(id: string): Promise<OAuthResult>;
};
const oauth = () => (supabase.auth as unknown as { oauth: OAuthApi }).oauth;

export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Connect an app — CodeTrainer" },
      { name: "description", content: "Approve or deny an app's access to your CodeTrainer account." },
      { property: "og:title", content: "Connect an app — CodeTrainer" },
      { property: "og:description", content: "Approve or deny an app's access to your CodeTrainer account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  validateSearch: (s: Record<string, unknown>) => ({
    authorization_id: typeof s["authorization_id"] === "string" ? s["authorization_id"] : "",
  }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("This connection link is missing or invalid.");
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw redirect({ to: "/login", search: { next: location.pathname + location.searchStr } });
  },
  loader: async ({ location }) => {
    const id = new URLSearchParams(location.search).get("authorization_id")!;
    const { data, error } = await oauth().getAuthorizationDetails(id);
    if (error) throw new Error(error.message || "This connection request has expired.");
    const immediate = data?.redirect_url ?? data?.redirect_to;
    if (immediate && !data?.client) throw redirect({ href: immediate });
    const { data: u } = await supabase.auth.getUser();
    return { details: data, email: u.user?.email ?? "" };
  },
  component: Consent,
  errorComponent: ({ error }) => (
    <main className="mx-auto flex w-[min(1120px,92%)] flex-1 items-center justify-center py-16">
      <AuthCard title="Could not load this request" subtitle={error instanceof Error ? error.message : String(error)}>
        <a href="/" className="text-sm underline underline-offset-4">Back to CodeTrainer</a>
      </AuthCard>
    </main>
  ),
});

function Consent() {
  const { details, email } = Route.useLoaderData();
  const { authorization_id } = Route.useSearch();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const client = details?.client?.name ?? "An app";
  const redirectUri = details?.redirect_uri ?? details?.client?.redirect_uri;
  const scopes = String(details?.scope ?? details?.scopes ?? "").split(/\s+/).filter(Boolean);
  const label = (s: string) => (s === "email" ? "Share your email address" : s === "profile" ? "Share your basic profile" : s === "openid" ? "Confirm your identity" : `Additional permission requested: ${s}`);

  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    const { data, error } = approve ? await oauth().approveAuthorization(authorization_id) : await oauth().denyAuthorization(authorization_id);
    if (error) { setBusy(false); return setError(error.message || (approve ? "Approval failed." : "Could not cancel.")); }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) { setBusy(false); return setError("No redirect was returned. Please try again."); }
    window.location.href = target;
  }

  return (
    <main className="mx-auto flex w-[min(1120px,92%)] flex-1 items-center justify-center py-16">
      <AuthCard title={`Connect ${client} to CodeTrainer`} subtitle={`${client} will be able to call this app's tools as you (${email}).`}>
        <div className="space-y-4 text-sm">
          {redirectUri && <p className="break-all text-muted-foreground">Returns to: <span className="font-mono">{redirectUri}</span></p>}
          <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
            <li>Search and read published tasks</li>
            <li>See your own tasks and submit new ones for review</li>
            {scopes.map((s) => <li key={s}>{label(s)}</li>)}
          </ul>
          <p className="text-muted-foreground">This does not bypass this app's permissions.</p>
          <FormError message={error} />
          <div className="flex gap-3">
            <Button className="flex-1" disabled={busy} onClick={() => decide(true)}>Approve</Button>
            <Button className="flex-1" variant="secondary" disabled={busy} onClick={() => decide(false)}>Cancel connection</Button>
          </div>
        </div>
      </AuthCard>
    </main>
  );
}
