import { useEffect } from "react";
import { ExternalLink, ShieldCheck } from "lucide-react";

const ADMIN_DASHBOARD_URL = "https://hy3n-admin.web.app";

/**
 * The Rider web app previously contained a build-time VITE_ADMIN_ACCESS_CODE
 * check. That variable was not configured in the deployed site, making every
 * access code fail and exposing a weak client-side gate. The dedicated HY3N
 * Admin dashboard now owns administrator authentication and verifies both a
 * Firebase sign-in and the server-side admin_access record.
 */
export default function AdminPortal() {
  useEffect(() => {
    const redirect = window.setTimeout(() => {
      window.location.replace(ADMIN_DASHBOARD_URL);
    }, 350);
    return () => window.clearTimeout(redirect);
  }, []);

  return (
    <main className="min-h-screen bg-background px-5 flex items-center justify-center">
      <section className="w-full max-w-md rounded-2xl border border-primary/25 bg-card p-7 text-center shadow-xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <ShieldCheck className="h-7 w-7 text-primary" aria-hidden="true" />
        </div>
        <h1 className="mt-5 text-xl font-bold text-foreground">Opening HY3N Admin</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Administrator access is securely managed in the dedicated dashboard.
          Sign in there with your approved administrator account; no access code is required.
        </p>
        <a
          href={ADMIN_DASHBOARD_URL}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground transition hover:bg-primary/90"
        >
          Open HY3N Admin <ExternalLink size={16} aria-hidden="true" />
        </a>
        <p className="mt-3 text-xs text-muted-foreground">Redirecting automatically…</p>
      </section>
    </main>
  );
}
