"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import NavBar from "../../components/NavBar";
import { ProtectedRoute } from "../../components/ProtectedRoute";
import { useAuth, useAsyncOperation } from "../../hooks";
import { groupService } from "../../services";

export default function FamilyPage() {
  const router = useRouter();
  const { userId } = useAuth();
  const { busy, error, success, execute, setSuccessMessage } = useAsyncOperation();

  const [myGroups, setMyGroups] = useState([]);
  const [activeGroupId, setActiveGroupId] = useState(null);

  const [newName, setNewName] = useState("");
  const [joinCode, setJoinCode] = useState("");

  async function loadGroups() {
    if (!userId) return;

    try {
      const groups = await groupService.getUserGroups(userId);
      setMyGroups(groups);
      if (!activeGroupId && groups.length) setActiveGroupId(groups[0].id);
    } catch (err) {
      console.error("Failed to load groups:", err);
    }
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
    if (!newName.trim()) return;

    await execute(async () => {
      const group = await groupService.createGroup(newName.trim(), userId);
      setSuccessMessage("המשפחה נוצרה! אפשר לשתף את הקוד.");
      setNewName("");
      await loadGroups();
      setActiveGroupId(group.id);
    });
  }

  async function joinGroup() {
    if (!joinCode.trim()) return;

    await execute(async () => {
      const group = await groupService.joinGroup(joinCode, userId);
      setSuccessMessage(`הצטרפת למשפחה: ${group.name}`);
      setJoinCode("");
      await loadGroups();
      setActiveGroupId(group.id);
    });
  }

  async function leaveGroup(groupId) {
    await execute(async () => {
      await groupService.leaveGroup(groupId, userId);
      setSuccessMessage("יצאת מהמשפחה.");
      setActiveGroupId(null);
      await loadGroups();
    });
  }

  return (
    <ProtectedRoute>
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

          {(success || error) && <div className="hr" />}
          {success && <div className="small">{success}</div>}
          {error && <div className="small" style={{ color: "var(--danger)" }}>{error}</div>}
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
    </ProtectedRoute>
  );
}
