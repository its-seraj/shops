import Link from "next/link";
import { loginAdmin } from "@/app/admin/actions";
import { LogoMark } from "@/components/logo-mark";
import { getSupabaseConfig } from "@/lib/supabase/config";

export default async function AdminLogin({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const config = getSupabaseConfig();

  return (
    <main className="admin-layout">
      <section className="container section admin-login-shell">
        <div className="admin-login-brand">
          <Link className="brand admin-brand" href="/">
            <LogoMark />
            <span>
              <strong>Wholesale India</strong>
              <small>Back office</small>
            </span>
          </Link>
        </div>
        <div className="admin-heading admin-hero-panel">
          <div>
            <span className="badge">Secure access</span>
            <h1>Admin login</h1>
            <p className="muted">Sign in to manage products, packs, and customer enquiries.</p>
          </div>
        </div>
        {!config.isConfigured ? (
          <div className="notice">
            Supabase is not configured yet. Add environment variables from `.env.example` to
            enable protected admin login and database-backed management.
          </div>
        ) : null}
        {error ? <p className="error">{error}</p> : null}
        <form action={loginAdmin} className="admin-card admin-form-card stack">
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" required disabled={!config.isConfigured} />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              disabled={!config.isConfigured}
            />
          </div>
          <button className="primary-button" type="submit" disabled={!config.isConfigured}>
            Sign in
          </button>
        </form>
      </section>
    </main>
  );
}
