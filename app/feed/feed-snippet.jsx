/* app/feed/page.jsx */
/* ⚠️ החליפי רק את אזור הכפתורים בכרטיס ברכיב הקיים שלך */

<div className="row">
  <button
    className="btnSecondary"
    type="button"
    onClick={() => router.push(`/edit/${e.id}`)}
  >
    עריכה
  </button>

  <button
    className="btnDanger"
    type="button"
    onClick={() => removeEntry(e.id)}
  >
    מחיקה
  </button>
</div>
