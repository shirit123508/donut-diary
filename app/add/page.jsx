"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NavBar from "../../components/NavBar";
import { ProtectedRoute } from "../../components/ProtectedRoute";
import { useAuth, useAsyncOperation } from "../../hooks";
import { donutService, groupService } from "../../services";
import { ValidationHelper } from "../../utils";

export default function AddPage() {
  const router = useRouter();
  const { userId } = useAuth();
  const { busy, error, execute } = useAsyncOperation();

  const [groups, setGroups] = useState([]);
  const [formData, setFormData] = useState({
    place_name: "",
    donut_name: "",
    filling: "",
    rating: 5,
    price: "",
    notes: "",
    photo_url: "",
    visibility: "private",
    group_id: "",
  });

  useEffect(() => {
    async function loadGroups() {
      if (!userId) return;
      try {
        const data = await groupService.getUserGroups(userId);
        setGroups(data);
        // Set default group if user has groups
        if (data.length > 0 && !formData.group_id) {
          setFormData((prev) => ({ ...prev, group_id: data[0].id }));
        }
      } catch (err) {
        console.error("Failed to load groups:", err);
      }
    }
    loadGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    // Validation
    if (!formData.place_name.trim()) {
      alert("שם המקום הוא חובה");
      return;
    }
    if (!formData.donut_name.trim()) {
      alert("שם הסופגנייה הוא חובה");
      return;
    }

    await execute(async () => {
      const entry = {
        place_name: formData.place_name.trim(),
        donut_name: formData.donut_name.trim(),
        filling: formData.filling.trim() || null,
        rating: parseInt(formData.rating, 10),
        price: formData.price ? parseFloat(formData.price) : null,
        notes: formData.notes.trim() || null,
        photo_url: formData.photo_url.trim() || null,
        visibility: formData.visibility,
        group_id: formData.visibility === "group" ? formData.group_id : null,
        created_by: userId,
        date: new Date().toISOString(),
      };

      await donutService.createEntry(entry);
      router.push("/feed");
    });
  }

  const hasGroups = groups.length > 0;

  return (
    <ProtectedRoute>
      <div className="container">
        <NavBar />

        <div className="card" style={{ marginTop: 14, maxWidth: 600, margin: "14px auto 0" }}>
          <h1 className="h1">הוספת סופגנייה 🍩</h1>
          <p className="small">מלאי את הפרטים לתיעוד הטעימה.</p>

          <form onSubmit={handleSubmit}>
            <div className="hr" />

            <label className="small" htmlFor="place_name">
              שם המקום *
            </label>
            <input
              id="place_name"
              name="place_name"
              className="input"
              value={formData.place_name}
              onChange={handleChange}
              placeholder="רולדין"
              required
              aria-required="true"
            />

            <label className="small" htmlFor="donut_name" style={{ marginTop: 12 }}>
              שם הסופגנייה *
            </label>
            <input
              id="donut_name"
              name="donut_name"
              className="input"
              value={formData.donut_name}
              onChange={handleChange}
              placeholder="סופגניית נוטלה"
              required
              aria-required="true"
            />

            <label className="small" htmlFor="filling" style={{ marginTop: 12 }}>
              מילוי
            </label>
            <input
              id="filling"
              name="filling"
              className="input"
              value={formData.filling}
              onChange={handleChange}
              placeholder="נוטלה"
            />

            <div className="grid2" style={{ marginTop: 12 }}>
              <div>
                <label className="small" htmlFor="rating">
                  דירוג (1-10) *
                </label>
                <input
                  id="rating"
                  name="rating"
                  type="number"
                  min="1"
                  max="10"
                  className="input"
                  value={formData.rating}
                  onChange={handleChange}
                  required
                  aria-required="true"
                  aria-valuemin="1"
                  aria-valuemax="10"
                />
              </div>

              <div>
                <label className="small" htmlFor="price">
                  מחיר (₪)
                </label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  className="input"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="8.00"
                  aria-label="מחיר בשקלים"
                />
              </div>
            </div>

            <label className="small" htmlFor="photo_url" style={{ marginTop: 12 }}>
              קישור לתמונה
            </label>
            <input
              id="photo_url"
              name="photo_url"
              type="url"
              className="input"
              value={formData.photo_url}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              aria-label="URL של תמונת הסופגנייה"
            />
            <div className="small" style={{ marginTop: 4, opacity: 0.7 }}>
              טיפ: העלה תמונה ל-Imgur או Cloudinary והדבק את הקישור כאן
            </div>

            <label className="small" htmlFor="notes" style={{ marginTop: 12 }}>
              הערות
            </label>
            <textarea
              id="notes"
              name="notes"
              className="input"
              value={formData.notes}
              onChange={handleChange}
              placeholder="מעולה! ממש טעים..."
              rows="3"
              style={{ resize: "vertical", fontFamily: "inherit" }}
              aria-label="הערות נוספות"
            />

            <div className="hr" />

            <label className="small" htmlFor="visibility">
              נראות
            </label>
            <div className="row" style={{ marginTop: 6 }}>
              <label className="row" style={{ alignItems: "center", cursor: "pointer" }}>
                <input
                  type="radio"
                  name="visibility"
                  value="private"
                  checked={formData.visibility === "private"}
                  onChange={handleChange}
                  aria-label="רשומה פרטית"
                />
                <span style={{ marginRight: 6 }}>פרטי (רק אני)</span>
              </label>

              <label
                className="row"
                style={{
                  alignItems: "center",
                  cursor: hasGroups ? "pointer" : "not-allowed",
                  opacity: hasGroups ? 1 : 0.5,
                }}
              >
                <input
                  type="radio"
                  name="visibility"
                  value="group"
                  checked={formData.visibility === "group"}
                  onChange={handleChange}
                  disabled={!hasGroups}
                  aria-label="רשומה משותפת למשפחה"
                />
                <span style={{ marginRight: 6 }}>משפחתי (שיתוף)</span>
              </label>
            </div>

            {formData.visibility === "group" && hasGroups && (
              <>
                <label className="small" htmlFor="group_id" style={{ marginTop: 12 }}>
                  בחירת משפחה
                </label>
                <select
                  id="group_id"
                  name="group_id"
                  className="select"
                  value={formData.group_id}
                  onChange={handleChange}
                  aria-label="בחר קבוצה לשיתוף"
                >
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </>
            )}

            {formData.visibility === "group" && !hasGroups && (
              <div className="small" style={{ marginTop: 8, color: "var(--danger)" }}>
                עדיין אין לך משפחה.{" "}
                <button
                  type="button"
                  className="btnSecondary"
                  onClick={() => router.push("/family")}
                  style={{ fontSize: "inherit", padding: "4px 8px" }}
                >
                  צור/הצטרף למשפחה
                </button>
              </div>
            )}

            <div className="hr" />

            {error && (
              <div
                className="small"
                style={{ color: "var(--danger)", marginBottom: 12 }}
                role="alert"
                aria-live="polite"
              >
                {error}
              </div>
            )}

            <div className="row" style={{ justifyContent: "space-between" }}>
              <button
                type="button"
                className="btnSecondary"
                onClick={() => router.back()}
                disabled={busy}
              >
                ביטול
              </button>
              <button type="submit" className="btn" disabled={busy} aria-busy={busy}>
                {busy ? "שומר..." : "שמירה"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}
