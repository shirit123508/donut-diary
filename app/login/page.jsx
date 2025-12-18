"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import NavBar from "../../components/NavBar";
import { useAuth, useAsyncOperation } from "../../hooks";

export default function LoginPage() {
  const router = useRouter();
  const { requireGuest, login } = useAuth();
  const { busy, error, execute } = useAsyncOperation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    requireGuest();
  }, [requireGuest]);

  async function onSubmit(e) {
    e.preventDefault();

    await execute(async () => {
      await login(email, password);
      router.push("/feed");
    });
  }

  return (
    <div className="container">
      <NavBar />
      <main className="card" style={{ marginTop: 14, maxWidth: 600, margin: "14px auto 0" }}>
        <h1 className="h1">כניסה</h1>
        <p className="p">התחברי כדי לראות את היומן האישי והמשפחתי.</p>

        <form onSubmit={onSubmit} className="grid2" aria-label="טופס התחברות">
          <div>
            <label className="small" htmlFor="login-email">
              אימייל
            </label>
            <input
              id="login-email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              autoComplete="email"
              aria-required="true"
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label className="small" htmlFor="login-password">
              סיסמה
            </label>
            <input
              id="login-password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              autoComplete="current-password"
              aria-required="true"
              placeholder="••••••"
            />
          </div>
          <div style={{ gridColumn: "1 / -1" }} className="row">
            <button
              className="btn"
              disabled={busy}
              type="submit"
              aria-busy={busy}
              aria-label="התחבר למערכת"
            >
              {busy ? "נכנס…" : "כניסה"}
            </button>
            <button
              className="btnSecondary"
              type="button"
              onClick={() => router.push("/signup")}
              aria-label="עבור לדף הרשמה"
            >
              אין לי משתמש
            </button>
          </div>
        </form>

        {error && (
          <>
            <div className="hr" />
            <div
              className="small"
              style={{ color: "var(--danger)" }}
              role="alert"
              aria-live="assertive"
            >
              {error}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
