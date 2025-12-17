"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import NavBar from "../../components/NavBar";
import { ProtectedRoute } from "../../components/ProtectedRoute";
import { useAuth, useAsyncOperation } from "../../hooks";
import { donutService, groupService } from "../../services";
import { DateFormatter } from "../../utils";

export default function FeedPage() {
  const router = useRouter();
  const { userId } = useAuth();
  const { busy, error, execute } = useAsyncOperation();

  const [tab, setTab] = useState("family"); // family | mine
  const [entries, setEntries] = useState([]);
  const [groups, setGroups] = useState([]);
  const [activeGroupId, setActiveGroupId] = useState(null);

  useEffect(() => {
    async function loadGroups() {
      if (!userId) return;
      try {
        const data = await groupService.getUserGroups(userId);
        const g = data.map((group) => ({ id: group.id, name: group.name }));
        setGroups(g);
        if (g.length && !activeGroupId) setActiveGroupId(g[0].id);
      } catch (err) {
        console.error("Failed to load groups:", err);
      }
    }
    loadGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  async function loadEntries() {
    if (!userId) return;

    // Skip loading if on family tab with no active group
    if (tab === "family" && !activeGroupId) {
      setEntries([]);
      return;
    }

    await execute(async () => {
      const data = await donutService.getEntries({
        userId,
        type: tab,
        groupId: activeGroupId,
        limit: 200,
      });
      setEntries(data);
    });
  }

  useEffect(() => {
    if (!userId) return;
    loadEntries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, tab, activeGroupId]);

  const hasFamily = useMemo(() => groups.length > 0, [groups]);

  async function removeEntry(id) {
    if (!confirm("למחוק את הרשומה?")) return;

    await execute(async () => {
      await donutService.deleteEntry(id);
      await loadEntries();
    });
  }

  return (
    <ProtectedRoute>
      <div className="container">
        <NavBar />

        <div className="card" style={{ marginTop: 14 }}>
          <div className="row" style={{ alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <h1 className="h1" style={{ marginBottom: 4 }}>פיד</h1>
              <div className="small">בוחרים בין משפחתי לאישי.</div>
            </div>

            <button className="btn" type="button" onClick={() => router.push("/add")}>+ הוספה</button>
          </div>

          <div className="hr" />

          <div className="row" style={{ alignItems: "center", justifyContent: "space-between" }}>
            <div className="row">
              <button className={tab === "family" ? "btn" : "btnSecondary"} type="button" onClick={() => setTab("family")}>
                משפחה
              </button>
              <button className={tab === "mine" ? "btn" : "btnSecondary"} type="button" onClick={() => setTab("mine")}>
                שלי
              </button>
            </div>

            {tab === "family" && (
              hasFamily ? (
                <select className="select" style={{ maxWidth: 260 }} value={activeGroupId || ""} onChange={(e) => setActiveGroupId(e.target.value)}>
                  {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              ) : (
                <button className="btnSecondary" type="button" onClick={() => router.push("/family")}>אין משפחה — יצירה/הצטרפות</button>
              )
            )}
          </div>

          {busy && <div className="hr" />}
          {busy && <div className="small">טוען…</div>}

          {error && <div className="hr" />}
          {error && <div className="small" style={{ color: "var(--danger)" }}>{error}</div>}

        {!busy && !entries.length && (
          <>
            <div className="hr" />
            <div className="small">אין עדיין רשומות כאן. הוסיפי את הראשונה 🙂</div>
          </>
        )}

        <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
          {entries.map((e) => (
            <div key={e.id} className="card" style={{ boxShadow: "none" }}>
              <div className="row" style={{ alignItems: "flex-start", justifyContent: "space-between" }}>
                <div>
                  <div className="row" style={{ alignItems: "center" }}>
                    <div style={{ fontWeight: 900, fontSize: 18 }}>{e.place_name}</div>
                    <span className="badge">{e.visibility === "group" ? "משותף" : "פרטי"}</span>
                    <span className="badge">⭐ {e.rating}/10</span>
                  </div>
                  <div className="small">{DateFormatter.toMediumDateTime(e.date)}</div>
                  <div style={{ marginTop: 6, fontWeight: 700 }}>{e.donut_name}{e.filling ? ` · ${e.filling}` : ""}</div>
                  {e.price != null && <div className="small">מחיר: ₪{e.price}</div>}
                  {e.notes && <div style={{ marginTop: 8 }}>{e.notes}</div>}
                </div>

                <button className="btnDanger" type="button" onClick={() => removeEntry(e.id)}>
                  מחיקה
                </button>
              </div>
            </div>
          ))}
        </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
