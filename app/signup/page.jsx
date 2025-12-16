"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import NavBar from "../../components/NavBar";
import { supabase } from "../../lib/supabaseClient";
import { useSession } from "../../lib/useSession";

export default function SignupPage() {
  const router = useRouter();
  const { session, loading } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && session) router.replace("/feed");
  }, [loading, session, router]);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setBusy(false);
    if (error) setErr(error.message);
    else router.push("/feed");
  }

  return (
    <div className="container">
      <NavBar />
      <div className="card" style={{ marginTop: 14 }}>
        <h1 className="h1">הרשמה</h1>
        <p className="p">צרי משתמש כדי שתוכלי לשתף עם המשפחה.</p>

        <form onSubmit={onSubmit} className="grid2">
          <div>
            <label className="small">אימייל</label>
            <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          </div>
          <div>
            <label className="small">סיסמה</label>
            <input className="input" value={password} onChange={(e) => setPassword(e.target.value)} type="password" required minLength={6} />
            <div className="small">לפחות 6 תווים.</div>
          </div>
          <div style={{ gridColumn: "1 / -1" }} className="row">
            <button className="btn" disabled={busy} type="submit">{busy ? "נרשם…" : "יצירת משתמש"}</button>
            <button className="btnSecondary" type="button" onClick={() => router.push("/login")}>יש לי משתמש</button>
          </div>
        </form>

        {err && <div className="hr" />}
        {err && <div className="small" style={{ color: "var(--danger)" }}>{err}</div>}
      </div>
    </div>
  );
}
