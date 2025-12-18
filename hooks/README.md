# Custom Hooks 🎣

תיקיית ה-Hooks מכילה React hooks מותאמים אישית שמפשטים את הניהול של state ולוגיקה חוזרת.

## 📦 Hooks זמינים

### useAuth
Hook מתקדם לניהול authentication

**Returns:**
```typescript
{
  // State
  session: Object | null,
  loading: boolean,
  user: Object | null,
  userId: string | undefined,
  isAuthenticated: boolean,

  // Operations
  requireAuth: () => void,
  requireGuest: () => void,
  logout: () => Promise<void>,
  login: (email, password) => Promise<Object>,
  signup: (email, password) => Promise<Object>
}
```

### useAsyncOperation
Hook גנרי לניהול async operations

**Returns:**
```typescript
{
  // State
  busy: boolean,
  error: string,
  success: string,
  hasError: boolean,
  hasSuccess: boolean,

  // Operations
  execute: (operation) => Promise<any>,
  setSuccessMessage: (msg) => void,
  setErrorMessage: (msg) => void,
  clearMessages: () => void,
  reset: () => void
}
```

---

## 🎯 דוגמאות שימוש

### useAuth - דף מוגן

```javascript
import { useEffect } from 'react';
import { useAuth } from '../hooks';

export default function FeedPage() {
  const { userId, isAuthenticated, requireAuth } = useAuth();

  // הפנה ל-login אם לא מחובר
  useEffect(() => {
    requireAuth();
  }, [requireAuth]);

  if (!isAuthenticated) {
    return <div>טוען...</div>;
  }

  return (
    <div>
      <h1>שלום משתמש {userId}</h1>
    </div>
  );
}
```

### useAuth - התחברות

```javascript
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleLogin(e) {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
      router.push('/feed');
    } catch (err) {
      setError(err.message); // הודעה בעברית אוטומטית!
    }
  }

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">כניסה</button>
      {error && <div>{error}</div>}
    </form>
  );
}
```

### useAuth - התנתקות

```javascript
import { useAuth } from '../hooks';

export default function NavBar() {
  const { logout, isAuthenticated, user } = useAuth();

  async function handleLogout() {
    await logout(); // הפונה אוטומטית ל-/login
  }

  return (
    <nav>
      {isAuthenticated ? (
        <>
          <span>שלום {user?.email}</span>
          <button onClick={handleLogout}>התנתקות</button>
        </>
      ) : (
        <a href="/login">כניסה</a>
      )}
    </nav>
  );
}
```

### useAsyncOperation - טעינת נתונים

```javascript
import { useEffect, useState } from 'react';
import { useAuth, useAsyncOperation } from '../hooks';
import { donutService } from '../services';

export default function MyDonutsPage() {
  const { userId } = useAuth();
  const { busy, error, execute } = useAsyncOperation();
  const [donuts, setDonuts] = useState([]);

  useEffect(() => {
    loadDonuts();
  }, [userId]);

  async function loadDonuts() {
    await execute(async () => {
      const data = await donutService.getEntries({
        userId,
        type: 'mine',
        limit: 50
      });
      setDonuts(data);
    });
  }

  if (busy) return <div>טוען...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      {donuts.map(donut => (
        <div key={donut.id}>{donut.place_name}</div>
      ))}
    </div>
  );
}
```

### useAsyncOperation - שליחת טופס

```javascript
import { useState } from 'react';
import { useAuth, useAsyncOperation } from '../hooks';
import { groupService } from '../services';

export default function CreateGroupForm() {
  const { userId } = useAuth();
  const { busy, error, success, execute, setSuccessMessage } = useAsyncOperation();
  const [name, setName] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();

    await execute(async () => {
      const group = await groupService.createGroup(name, userId);
      setSuccessMessage(`הקבוצה נוצרה! קוד: ${group.join_code}`);
      setName('');
      return group;
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="שם הקבוצה"
        disabled={busy}
      />
      <button type="submit" disabled={busy || !name.trim()}>
        {busy ? 'יוצר...' : 'צור קבוצה'}
      </button>

      {error && <div style={{ color: 'red' }}>{error}</div>}
      {success && <div style={{ color: 'green' }}>{success}</div>}
    </form>
  );
}
```

### useAsyncOperation - מחיקה עם אישור

```javascript
import { useAsyncOperation } from '../hooks';
import { donutService } from '../services';

export default function DonutCard({ donut, onDeleted }) {
  const { busy, execute } = useAsyncOperation();

  async function handleDelete() {
    if (!confirm('למחוק את הרשומה?')) return;

    await execute(async () => {
      await donutService.deleteEntry(donut.id);
      onDeleted(donut.id);
    });
  }

  return (
    <div>
      <h3>{donut.place_name}</h3>
      <button onClick={handleDelete} disabled={busy}>
        {busy ? 'מוחק...' : 'מחיקה'}
      </button>
    </div>
  );
}
```

---

## 🏗️ ארכיטקטורה

### למה Custom Hooks?

**1. DRY (Don't Repeat Yourself)**
```javascript
// לפני - קוד חוזר בכל component
const [busy, setBusy] = useState(false);
const [error, setError] = useState('');
// ... עוד 10 שורות

// אחרי - שורה אחת
const { busy, error, execute } = useAsyncOperation();
```

**2. Separation of Concerns**
```javascript
// useAuth מפריד בין:
// - Auth logic (useAuth)
// - UI logic (Component)
// - Business logic (Services)
```

**3. Reusability**
```javascript
// משתמשים באותו hook ב-10+ components
import { useAuth } from '../hooks';
```

### Hook Composition

אפשר לשלב hooks:

```javascript
export default function MyComponent() {
  const { userId, requireAuth } = useAuth();
  const { busy, error, execute } = useAsyncOperation();

  useEffect(() => {
    requireAuth();
  }, [requireAuth]);

  async function loadData() {
    await execute(async () => {
      // fetch data with userId
    });
  }

  // ...
}
```

---

## 🔧 הרחבה

### איך ליצור hook חדש?

**1. צור קובץ חדש** - `hooks/useMyHook.js`

```javascript
"use client";

import { useState, useCallback } from 'react';

export function useMyHook() {
  const [state, setState] = useState(null);

  const myOperation = useCallback(async (param) => {
    // logic here
    setState(param);
  }, []);

  return {
    state,
    myOperation
  };
}
```

**2. הוסף ל-index.js**

```javascript
export { useMyHook } from "./useMyHook";
```

**3. השתמש**

```javascript
import { useMyHook } from '../hooks';

const { state, myOperation } = useMyHook();
```

---

## ⚡ Performance Tips

### useMemo & useCallback

ה-hooks כבר משתמשים ב-useCallback:

```javascript
// בתוך useAuth.js
const requireAuth = useCallback(() => {
  if (!loading && !session) {
    router.replace("/login");
  }
}, [loading, session, router]);
```

זה מונע re-renders מיותרים.

### Dependency Arrays

שים לב ל-dependency arrays:

```javascript
useEffect(() => {
  requireAuth();
}, [requireAuth]); // ✓ נכון

useEffect(() => {
  requireAuth();
}, []); // ✗ לא נכון - requireAuth עשוי להשתנות
```

---

## 🎓 Best Practices

### 1. תמיד השתמש ב-execute

```javascript
// ✓ טוב - execute מטפל בכל השגיאות
await execute(async () => {
  await myService.doSomething();
});

// ✗ רע - צריך לטפל בשגיאות ידנית
try {
  setBusy(true);
  await myService.doSomething();
  setBusy(false);
} catch (error) {
  setError(error.message);
  setBusy(false);
}
```

### 2. requireAuth מוקדם

```javascript
export default function ProtectedPage() {
  const { requireAuth } = useAuth();

  // עשה את זה בהתחלה
  useEffect(() => {
    requireAuth();
  }, [requireAuth]);

  // ...
}
```

### 3. טיפול בהודעות

```javascript
const { error, success, clearMessages } = useAsyncOperation();

// נקה הודעות כשמשתנים דפים
useEffect(() => {
  return () => clearMessages();
}, [clearMessages]);
```

---

## 📚 למידע נוסף

- **Services**: ראה `services/README.md`
- **Components**: ראה `components/README.md`
- **Utils**: ראה `utils/README.md`
