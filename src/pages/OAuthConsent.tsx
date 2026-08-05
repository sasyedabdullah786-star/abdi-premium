import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function OAuthConsent() {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) return setError("Missing authorization_id");
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        const next = window.location.pathname + window.location.search;
        window.location.href = "/auth?next=" + encodeURIComponent(next);
        return;
      }
      const { data, error } = await (supabase.auth as any).oauth.getAuthorizationDetails(authorizationId);
      if (!active) return;
      if (error) return setError(error.message);
      const immediate = data?.redirect_url ?? data?.redirect_to;
      if (immediate && !data?.client) {
        window.location.href = immediate;
        return;
      }
      setDetails(data);
    })();
    return () => {
      active = false;
    };
  }, [authorizationId]);

  async function decide(approve: boolean) {
    setBusy(true);
    const oauth = (supabase.auth as any).oauth;
    const { data, error } = approve
      ? await oauth.approveAuthorization(authorizationId)
      : await oauth.denyAuthorization(authorizationId);
    if (error) {
      setBusy(false);
      return setError(error.message);
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      return setError("No redirect returned by the authorization server.");
    }
    window.location.href = target;
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="glass-card p-8 w-full max-w-md">
        <div className="font-display text-2xl font-bold gradient-text text-center mb-6">ABD"I</div>
        {error ? (
          <p className="text-sm text-destructive text-center">Could not load this authorization request: {error}</p>
        ) : !details ? (
          <p className="text-sm text-muted-foreground text-center">Loading…</p>
        ) : (
          <>
            <h1 className="font-display text-xl font-bold text-center mb-2">
              Connect {details.client?.name ?? "an app"} to your account
            </h1>
            <p className="text-sm text-muted-foreground text-center mb-6">
              This lets {details.client?.name ?? "the client"} browse courses and manage your study plan as you.
            </p>
            <div className="flex gap-3">
              <button
                disabled={busy}
                onClick={() => decide(false)}
                className="flex-1 h-10 rounded-lg border border-border text-sm font-medium disabled:opacity-50"
              >
                Deny
              </button>
              <button disabled={busy} onClick={() => decide(true)} className="btn-gradient flex-1">
                Approve
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
