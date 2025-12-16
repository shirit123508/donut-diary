"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import NavBar from "../../components/NavBar";
import { useSession } from "../../lib/useSession";
import { supabase } from "../../lib/supabaseClient";
import { makeJoinCode } from "../../lib/joinCode";

export default function FamilyPage() {
  const router = useRouter();
  const { session, loading } = useSession();

  const [myGroups, setMyGroups] = useState([]);
  const [activeGroupId, setActiveGroupId] = useState(null);

  const [newName, setNewName] = useState("");
  const [joinCode, setJoinCode] = useState("");

  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const userId = session?.user?.id;

  useEffect(() => {
    if (!loading && !session) router.replace("/login");
  }, [loading, session, router]);

  async function loadGroups() {
    if (!userId) return;
    setErr("");
    setMsg("");
    const { data, error } = await supabase
      .from("group_members")
      .select("group_id, groups:groups(id,name,join_code,created_by)")
      .eq("user_id", userId);

    if (error) {
      setErr(error.message);
      return;
    }
    const groups = (data || []).map((row) => row.groups).filter(Boolean);
    setMyGroups(groups);
    if (!activeGroupId && groups.length) setActiveGroupId(groups[0].id);
  }

  useEffect(() => {
    loadGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const activeGroup = useMemo(
    () => myGroups.find((g) => g.id === activeGroupId) || null,
    [myGroups, activeGroupId]
  );

  async function createGroup() {
    setErr(""); setMsg("");
    if (!newName.trim()) return;

    setBusy(true);
    // make a join code; retry on collision
    let code = makeJoinCode();
    for (let i = 0; i < 5; i++) {
      const { data: existing } = await supabase.from("groups").select("id").eq("join_code", code).maybeSingle();
      if (!existing) break;
      code = makeJoinCode();
    }

    const { data: g, error: gErr } = await supabase
      .from("groups")
      .insert({ name: newName.trim(), created_by: userId, join_code: code })
      .select()
      .single();

    if (gErr) {
      setBusy(false);
      setErr(gErr.message);
      return;
    }

    const { error: mErr } = await supabase
      .from("group_members")
      .insert({ group_id: g.id, user_id: userId, role: "admin" });

    setBusy(false);
    if (mErr) setErr(mErr.message);
    else {
      setMsg("המשפחה נוצרה! אפשר לשתף את הקוד.");
      setNewName("");
      await loadGroups();
      setActiveGroupId(g.id);
    }
  }

  async function joinGroup() {
    setErr(""); setMsg("");
    if (!joinCode.trim()) return;

    setBusy(true);
    const { data: group, error: findErr } = await supabase
      .from("groups")
      .select("id,name")
      .eq("join_code", joinCode.trim().toUpperCase())
      .maybeSingle();

    if (findErr) {
      setBusy(false);
      setErr(findErr.message);
      return;
    }
    if (!group) {
      setBusy(false);
      setErr("קוד לא נמצא. בדקי שהקלדת נכון.");
      return;
    }

    const { error: insErr } = await supabase
      .from("group_members")
      .insert({ group_id: group.id, user_id: userId, role: "member" });

    setBusy(false);
    if (insErr) setErr(insErr.message);
    else {
      setMsg(`הצטרפת למשפחה: ${group.name}`);
      setJoinCode("");
      await loadGroups();
      setActiveGroupId(group.id);
    }
  }

  async function leaveGroup(groupId) {
    setErr(""); setMsg("");
    setBusy(true);
    const { error } = await supabase
      .from("group_members")
      .delete()
      .eq("group_id", groupId)
      .eq("user_id", userId);
    setBusy(false);
    if (error) setErr(error.message);
    else {
      setMsg("יצאת מהמשפחה.");
      setActiveGroupId(null);
      await loadGroups();
    }
  }

  return (
    <div className="container">
      <NavBar />

      <div className="row" style={{ marginTop: 14 }}>
        <div className="card" style={{ flex: "1 1 420px" }}>
          <h2 className="h2">המשפחה שלי</h2>
          {!myGroups.length ? (
            <p className="p">עדיין אין משפחה. אפשר ליצור או להצטרף עם קוד.</p>
          ) : (
            <div className="row" style={{ gap: 8 }}>
              {myGroups.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  className={g.id === activeGroupId ? "btn" : "btnSecondary"}
                  onClick={() => setActiveGroupId(g.id)}
                  style={{ padding: "8px 12px" }}
                >
                  {g.name}
                </button>
              ))}
            </div>
          )}

          <div className="hr" />
          <div className="grid2">
            <div className="card" style={{ boxShadow: "none" }}>
              <div className="h2">יצירת משפחה</div>
              <label className="small">שם המשפחה</label>
              <input className="input" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="למשל: משפחת לוי" />
              <div style={{ height: 10 }} />
              <button className="btn" type="button" onClick={createGroup} disabled={busy || !newName.trim()}>
                {busy ? "יוצר…" : "יצירה"}
              </button>
            </div>

            <div className="card" style={{ boxShadow: "none" }}>
              <div className="h2">הצטרפות עם קוד</div>
              <label className="small">קוד קצר</label>
              <input className="input" value={joinCode} onChange={(e) => setJoinCode(e.target.value)} placeholder="ABC123" />
              <div style={{ height: 10 }} />
              <button className="btn" type="button" onClick={joinGroup} disabled={busy || !joinCode.trim()}>
                {busy ? "מצטרף…" : "הצטרפות"}
              </button>
            </div>
          </div>

          {(msg || err) && <div className="hr" />}
          {msg && <div className="small">{msg}</div>}
          {err && <div className="small" style={{ color: "var(--danger)" }}>{err}</div>}
        </div>

        <div className="card" style={{ flex: "1 1 320px" }}>
          <h2 className="h2">המשפחה הפעילה</h2>
          {!activeGroup ? (
            <p className="p">בחרי/צרי משפחה כדי לראות את הקוד ולשתף.</p>
          ) : (
            <>
              <div className="row" style={{ alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 18 }}>{activeGroup.name}</div>
                  <div className="small">קוד הצטרפות:</div>
                  <div className="row" style={{ alignItems: "center" }}>
                    <span className="badge" style={{ fontWeight: 800, letterSpacing: 2 }}>{activeGroup.join_code}</span>
                    <button
                      type="button"
                      className="btnSecondary"
                      onClick={() => navigator.clipboard.writeText(activeGroup.join_code)}
                    >
                      העתקה
                    </button>
                  </div>
                </div>
                <button className="btnDanger" type="button" onClick={() => leaveGroup(activeGroup.id)} disabled={busy}>
                  יציאה
                </button>
              </div>

              <div className="hr" />
              <p className="p">
                עכשיו אפשר להוסיף טעימות כ״שיתופי״ כדי שכל בני המשפחה יראו בפיד המשפחתי.
              </p>
              <button className="btn" type="button" onClick={() => router.push("/add")}>
                הוספת סופגנייה
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
