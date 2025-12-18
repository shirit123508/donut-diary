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
              <h1 className="h1" style={{ marginBottom: 4 }}>פיד סופגניות 🍩</h1>
              <div className="small">גלריה משותפת של כל הטעימות.</div>
            </div>

            <button
              className="btn"
              type="button"
              onClick={() => router.push("/add")}
              aria-label="הוסף סופגנייה חדשה"
            >
              + הוספה
            </button>
          </div>

          <div className="hr" />

          <div className="row" style={{ alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div className="row">
              <button
                className={tab === "family" ? "btn" : "btnSecondary"}
                type="button"
                onClick={() => setTab("family")}
                aria-pressed={tab === "family"}
                aria-label="הצג פיד משפחתי"
              >
                משפחה
              </button>
              <button
                className={tab === "mine" ? "btn" : "btnSecondary"}
                type="button"
                onClick={() => setTab("mine")}
                aria-pressed={tab === "mine"}
                aria-label="הצג רשומות אישיות"
              >
                שלי
              </button>
            </div>

            {tab === "family" && (
              hasFamily ? (
                <select
                  className="select"
                  style={{ maxWidth: 260 }}
                  value={activeGroupId || ""}
                  onChange={(e) => setActiveGroupId(e.target.value)}
                  aria-label="בחר משפחה להצגה"
                >
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              ) : (
                <button
                  className="btnSecondary"
                  type="button"
                  onClick={() => router.push("/family")}
                  aria-label="אין משפחה, עבור ליצירה או הצטרפות"
                >
                  אין משפחה — יצירה/הצטרפות
                </button>
              )
            )}
          </div>

          {busy && (
            <>
              <div className="hr" />
              <div className="small" role="status" aria-live="polite">
                טוען…
              </div>
            </>
          )}

          {error && (
            <>
              <div className="hr" />
              <div className="small" style={{ color: "var(--danger)" }} role="alert" aria-live="assertive">
                {error}
              </div>
            </>
          )}

          {!busy && !entries.length && (
            <>
              <div className="hr" />
              <div className="small">אין עדיין רשומות כאן. הוסיפי את הראשונה 🙂</div>
            </>
          )}
        </div>

        {/* Pinterest-style Masonry Layout */}
        {!busy && entries.length > 0 && (
          <div
            style={{
              columnCount: "auto",
              columnWidth: "280px",
              columnGap: "14px",
              marginTop: 14,
            }}
            role="feed"
            aria-label="פיד סופגניות"
          >
            {entries.map((e) => (
              <article
                key={e.id}
                className="card"
                style={{
                  breakInside: "avoid",
                  marginBottom: 14,
                  pageBreakInside: "avoid",
                  display: "inline-block",
                  width: "100%",
                  overflow: "hidden",
                }}
                aria-labelledby={`entry-title-${e.id}`}
              >
                {/* Image */}
                {e.photo_url && (
                  <img
                    src={e.photo_url}
                    alt={`תמונה של ${e.donut_name} מ${e.place_name}`}
                    style={{
                      width: "100%",
                      height: "auto",
                      borderRadius: "12px 12px 0 0",
                      margin: "-12px -12px 12px -12px",
                      display: "block",
                      objectFit: "cover",
                    }}
                    loading="lazy"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                )}

                {/* Content */}
                <div>
                  <div className="row" style={{ alignItems: "center", flexWrap: "wrap", gap: 6 }}>
                    <h2
                      id={`entry-title-${e.id}`}
                      style={{ fontWeight: 900, fontSize: 18, margin: 0 }}
                    >
                      {e.place_name}
                    </h2>
                    <span className="badge" aria-label={`נראות: ${e.visibility === "group" ? "משותף" : "פרטי"}`}>
                      {e.visibility === "group" ? "משותף" : "פרטי"}
                    </span>
                    <span className="badge" aria-label={`דירוג: ${e.rating} מתוך 10`}>
                      ⭐ {e.rating}/10
                    </span>
                  </div>

                  <time
                    className="small"
                    dateTime={e.date}
                    style={{ display: "block", marginTop: 4 }}
                  >
                    {DateFormatter.toMediumDateTime(e.date)}
                  </time>

                  <div style={{ marginTop: 8, fontWeight: 700 }}>
                    {e.donut_name}
                    {e.filling && ` · ${e.filling}`}
                  </div>

                  {e.price != null && (
                    <div className="small" style={{ marginTop: 4 }}>
                      מחיר: ₪{e.price}
                    </div>
                  )}

                  {e.notes && (
                    <p style={{ marginTop: 8, fontSize: 14, lineHeight: 1.5 }}>
                      {e.notes}
                    </p>
                  )}

                  {/* Actions - כפתורים גדולים יותר */}
                  <div className="hr" style={{ marginTop: 12 }} />
                  <div className="row" style={{ gap: 8 }}>
                    <button
                      className="btn"
                      type="button"
                      onClick={() => router.push(`/edit/${e.id}`)}
                      aria-label={`ערוך רשומה של ${e.donut_name}`}
                      style={{ flex: 1, fontSize: 13, padding: "8px 10px" }}
                    >
                      ✏️ עריכה
                    </button>
                    <button
                      className="btnDanger"
                      type="button"
                      onClick={() => removeEntry(e.id)}
                      aria-label={`מחק רשומה של ${e.donut_name}`}
                      style={{ flex: 1, fontSize: 13, padding: "8px 10px" }}
                    >
                      🗑️ מחיקה
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
