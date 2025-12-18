"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import NavBar from "../../components/NavBar";
import { useAuth, useAsyncOperation } from "../../hooks";

export default function SignupPage() {
  const router = useRouter();
  const { requireGuest, signup } = useAuth();
  const { busy, error, execute } = useAsyncOperation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    requireGuest();
  }, [requireGuest]);

  async function onSubmit(e) {
    e.preventDefault();

    await execute(async () => {
      await signup(email, password);
      router.push("/feed");
    });
  }

  return (
    <div className="container">
      <NavBar />
      <main className="card" style={{ marginTop: 14, maxWidth: 600, margin: "14px auto 0" }}>
        <h1 className="h1">הרשמה</h1>
        <p className="p">צרי משתמש כדי שתוכלי לשתף עם המשפחה.</p>

        <form onSubmit={onSubmit} className="grid2" aria-label="טופס הרשמה">
          <div>
            <label className="small" htmlFor="signup-email">
              אימייל
            </label>
            <input
              id="signup-email"
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
            <label className="small" htmlFor="signup-password">
              סיסמה
            </label>
            <input
              id="signup-password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              aria-required="true"
              aria-describedby="password-hint"
              placeholder="••••••"
            />
            <div id="password-hint" className="small" style={{ marginTop: 4 }}>
              לפחות 6 תווים.
            </div>
          </div>
          <div style={{ gridColumn: "1 / -1" }} className="row">
            <button
              className="btn"
              disabled={busy}
              type="submit"
              aria-busy={busy}
              aria-label="צור משתמש חדש"
            >
              {busy ? "נרשם…" : "יצירת משתמש"}
            </button>
            <button
              className="btnSecondary"
              type="button"
              onClick={() => router.push("/login")}
              aria-label="עבור לדף התחברות"
            >
              יש לי משתמש
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
