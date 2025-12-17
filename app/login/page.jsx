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
      <div className="card" style={{ marginTop: 14 }}>
        <h1 className="h1">כניסה</h1>
        <p className="p">התחברי כדי לראות את היומן האישי והמשפחתי.</p>

        <form onSubmit={onSubmit} className="grid2">
          <div>
            <label className="small">אימייל</label>
            <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          </div>
          <div>
            <label className="small">סיסמה</label>
            <input className="input" value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
          </div>
          <div style={{ gridColumn: "1 / -1" }} className="row">
            <button className="btn" disabled={busy} type="submit">{busy ? "נכנס…" : "כניסה"}</button>
            <button className="btnSecondary" type="button" onClick={() => router.push("/signup")}>אין לי משתמש</button>
          </div>
        </form>

        {error && <div className="hr" />}
        {error && <div className="small" style={{ color: "var(--danger)" }}>{error}</div>}
      </div>
    </div>
  );
}
