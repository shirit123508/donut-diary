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

  async function createGroup(e) {
    e?.preventDefault();
    if (!newName.trim()) return;

    await execute(async () => {
      const group = await groupService.createGroup(newName.trim(), userId);
      setSuccessMessage("המשפחה נוצרה! אפשר לשתף את הקוד.");
      setNewName("");
      await loadGroups();
      setActiveGroupId(group.id);
    });
  }

  async function joinGroup(e) {
    e?.preventDefault();
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
    if (!confirm("האם את/ה בטוח/ה שאת/ה רוצה לעזוב את המשפחה?")) return;

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

        <div className="row" style={{ marginTop: 14, alignItems: "flex-start" }}>
          <section
            className="card"
            style={{ flex: "1 1 420px" }}
            aria-labelledby="my-families-heading"
          >
            <h1 id="my-families-heading" className="h2">
              המשפחה שלי 👨‍👩‍👧‍👦
            </h1>
            {!myGroups.length ? (
              <p className="p">עדיין אין משפחה. אפשר ליצור או להצטרף עם קוד.</p>
            ) : (
              <div className="row" style={{ gap: 8, flexWrap: "wrap" }} role="group" aria-label="רשימת המשפחות שלי">
                {myGroups.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    className={g.id === activeGroupId ? "btn" : "btnSecondary"}
                    onClick={() => setActiveGroupId(g.id)}
                    style={{ padding: "8px 12px" }}
                    aria-pressed={g.id === activeGroupId}
                    aria-label={`בחר משפחה: ${g.name}`}
                  >
                    {g.name}
                  </button>
                ))}
              </div>
            )}

            <div className="hr" />
            <div className="grid2">
              {/* Create Group Form */}
              <form
                onSubmit={createGroup}
                className="card"
                style={{ boxShadow: "none" }}
                aria-labelledby="create-group-heading"
              >
                <h2 id="create-group-heading" className="h2">
                  יצירת משפחה
                </h2>
                <label className="small" htmlFor="new-group-name">
                  שם המשפחה
                </label>
                <input
                  id="new-group-name"
                  className="input"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="למשל: משפחת לוי"
                  aria-required="true"
                  required
                />
                <div style={{ height: 10 }} />
                <button
                  className="btn"
                  type="submit"
                  disabled={busy || !newName.trim()}
                  aria-busy={busy}
                >
                  {busy ? "יוצר…" : "יצירה"}
                </button>
              </form>

              {/* Join Group Form */}
              <form
                onSubmit={joinGroup}
                className="card"
                style={{ boxShadow: "none" }}
                aria-labelledby="join-group-heading"
              >
                <h2 id="join-group-heading" className="h2">
                  הצטרפות עם קוד
                </h2>
                <label className="small" htmlFor="join-code-input">
                  קוד קצר
                </label>
                <input
                  id="join-code-input"
                  className="input"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="ABC123"
                  maxLength={6}
                  aria-required="true"
                  required
                  style={{ textTransform: "uppercase", letterSpacing: "2px" }}
                />
                <div style={{ height: 10 }} />
                <button
                  className="btn"
                  type="submit"
                  disabled={busy || !joinCode.trim()}
                  aria-busy={busy}
                >
                  {busy ? "מצטרף…" : "הצטרפות"}
                </button>
              </form>
            </div>

            {(success || error) && <div className="hr" />}
            {success && (
              <div className="small" style={{ color: "var(--success, green)" }} role="status" aria-live="polite">
                ✓ {success}
              </div>
            )}
            {error && (
              <div className="small" style={{ color: "var(--danger)" }} role="alert" aria-live="assertive">
                ✗ {error}
              </div>
            )}
          </section>

          {/* Active Group Info */}
          <section
            className="card"
            style={{ flex: "1 1 320px" }}
            aria-labelledby="active-group-heading"
          >
            <h2 id="active-group-heading" className="h2">
              המשפחה הפעילה
            </h2>
            {!activeGroup ? (
              <p className="p">בחרי/צרי משפחה כדי לראות את הקוד ולשתף.</p>
            ) : (
              <>
                <div className="row" style={{ alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 18 }} id={`group-name-${activeGroup.id}`}>
                      {activeGroup.name}
                    </div>
                    <div className="small" style={{ marginTop: 8 }}>
                      קוד הצטרפות:
                    </div>
                    <div className="row" style={{ alignItems: "center", gap: 8, marginTop: 4 }}>
                      <span
                        className="badge"
                        style={{ fontWeight: 800, letterSpacing: 2, fontSize: 16 }}
                        aria-label={`קוד הצטרפות: ${activeGroup.join_code}`}
                      >
                        {activeGroup.join_code}
                      </span>
                      <button
                        type="button"
                        className="btnSecondary"
                        onClick={() => {
                          navigator.clipboard.writeText(activeGroup.join_code);
                          alert("הקוד הועתק ללוח!");
                        }}
                        aria-label="העתק קוד הצטרפות ללוח"
                        style={{ fontSize: 14, padding: "6px 12px" }}
                      >
                        📋 העתקה
                      </button>
                    </div>
                  </div>
                  <button
                    className="btnDanger"
                    type="button"
                    onClick={() => leaveGroup(activeGroup.id)}
                    disabled={busy}
                    aria-label={`עזוב את משפחת ${activeGroup.name}`}
                    aria-busy={busy}
                  >
                    יציאה
                  </button>
                </div>

                <div className="hr" />
                <p className="p">
                  עכשיו אפשר להוסיף טעימות כ״שיתופי״ כדי שכל בני המשפחה יראו בפיד המשפחתי.
                </p>
                <button
                  className="btn"
                  type="button"
                  onClick={() => router.push("/add")}
                  aria-label="הוסף סופגנייה חדשה"
                >
                  + הוספת סופגנייה
                </button>
              </>
            )}
          </section>
        </div>
      </div>
    </ProtectedRoute>
  );
}
