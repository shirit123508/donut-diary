# יומן סופגניות 🍩

אפליקציית Next.js + Supabase לניהול דירוגי סופגניות עם שיתוף משפחתי.

## ✨ תכונות

- 🔐 **התחברות והרשמה** - אימות מאובטח
- 📝 **יומן אישי** - רשומות פרטיות
- 👨‍👩‍👧‍👦 **פיד משפחתי** - שיתוף עם המשפחה
- 🔑 **קוד הצטרפות** - הצטרפות קלה לקבוצות
- 🌙 **ערכות נושא** - בהיר / כהה / חנוכה
- 🇮🇱 **ממשק בעברית** - RTL מלא
- ⚡ **ארכיטקטורה נקייה** - OOP + SOLID principles

---

## 📁 מבנה הפרויקט

```
donut-diary/
├── app/                    # Next.js App Router
│   ├── feed/              # דף הפיד
│   ├── family/            # ניהול קבוצות
│   ├── login/             # התחברות
│   ├── signup/            # הרשמה
│   └── add/               # הוספת רשומה
│
├── services/              # שכבת Services (Business Logic)
│   ├── DonutService.js    # CRUD סופגניות
│   ├── GroupService.js    # ניהול קבוצות
│   ├── AuthService.js     # Authentication
│   └── README.md          # תיעוד מלא
│
├── hooks/                 # Custom React Hooks
│   ├── useAuth.js         # ניהול authentication
│   ├── useAsyncOperation.js # ניהול async state
│   └── README.md          # תיעוד מלא
│
├── utils/                 # Utility Classes
│   ├── ErrorHandler.js    # ניהול שגיאות
│   ├── DateFormatter.js   # פורמט תאריכים
│   ├── ValidationHelper.js # Validation
│   ├── StorageHelper.js   # localStorage wrapper
│   ├── UrlHelper.js       # URL utilities
│   └── README.md          # תיעוד מלא
│
├── components/            # React Components
│   ├── NavBar.jsx         # ניווט
│   ├── ThemeSwitcher.jsx  # בחירת ערכת נושא
│   └── ProtectedRoute.jsx # HOC לדפים מוגנים
│
├── lib/                   # Shared libraries
│   ├── supabaseClient.js  # Supabase client
│   ├── useSession.js      # Session hook
│   └── joinCode.js        # יצירת קודי הצטרפות
│
└── supabase/              # Database
    └── schema.sql         # סכימת מסד נתונים
```

---

## 🚀 התקנה מהירה

### דרישות מקדימות

- Node.js 18+ (מומלץ 20+)
- חשבון Supabase (חינמי)

### שלבי התקנה

#### 1. הקמת Supabase

```bash
# פתחי פרויקט חדש ב-Supabase
# הריצי את ה-SQL מהקובץ:
supabase/schema.sql
```

#### 2. הגדרת משתני סביבה

```bash
# צרי קובץ .env.local
cp .env.example .env.local
```

הוסיפי:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

> 💡 **טיפ:** מוצאים ב-Supabase → Project Settings → API

#### 3. התקנה והרצה

```bash
# התקנת תלויות
npm install

# הפעלת development server
npm run dev

# פתיחת הדפדפן
open http://localhost:3000
```

---

## 🏗️ ארכיטקטורה

### עקרונות תכנון

הפרויקט בנוי על פי עקרונות **OOP** ו-**SOLID**:

#### 1. **Services Layer**
כל הלוגיקה העסקית מופרדת ל-services:

```javascript
// ✓ נכון - משתמשים ב-service
import { donutService } from '../services';
const donuts = await donutService.getEntries({ userId, type: 'mine' });

// ✗ לא נכון - קריאה ישירה ל-Supabase
const { data } = await supabase.from('donut_entries').select('*');
```

**יתרונות:**
- 🎯 **Single Responsibility** - כל service אחראי על תחום אחד
- 🔒 **Encapsulation** - הלוגיקה מוסתרת מה-components
- 🧪 **Testable** - קל לבדוק עם mocks
- 🔄 **Reusable** - שימוש חוזר בכל האפליקציה

#### 2. **Custom Hooks**
הפרדת state management מה-UI:

```javascript
// ✓ נכון - משתמשים ב-hook
import { useAuth, useAsyncOperation } from '../hooks';
const { userId } = useAuth();
const { busy, error, execute } = useAsyncOperation();

// ✗ לא נכון - קוד חוזר בכל component
const [busy, setBusy] = useState(false);
const [error, setError] = useState('');
// ... עוד 10 שורות
```

**יתרונות:**
- ♻️ **DRY** - אין קוד חוזר
- 🎨 **Separation of Concerns** - UI מופרד מלוגיקה
- 📦 **Reusability** - hook אחד לכל האפליקציה

#### 3. **Utility Classes**
פונקציות עזר מרכזיות:

```javascript
import { DateFormatter, ValidationHelper, StorageHelper } from '../utils';

// תאריכים בעברית
const formatted = DateFormatter.toMediumDateTime(date);

// Validation עם הודעות בעברית
ValidationHelper.isValidEmail(email, true);

// localStorage type-safe
StorageHelper.set('theme', 'dark');
```

**יתרונות:**
- 🎯 **Consistency** - פורמט אחיד
- 🌍 **i18n** - תמיכה בעברית
- 🛡️ **Type Safety** - פחות שגיאות

---

## 📚 תיעוד מפורט

### Services

ראה [services/README.md](services/README.md) לתיעוד מלא:

```javascript
// דוגמת שימוש
import { donutService } from '../services';

const entry = await donutService.createEntry({
  place_name: "רולדין",
  donut_name: "נוטלה",
  rating: 9,
  visibility: "group"
});
```

### Hooks

ראה [hooks/README.md](hooks/README.md) לתיעוד מלא:

```javascript
// דוגמת שימוש
import { useAuth, useAsyncOperation } from '../hooks';

export default function MyPage() {
  const { userId, requireAuth } = useAuth();
  const { busy, error, execute } = useAsyncOperation();

  useEffect(() => {
    requireAuth();
  }, [requireAuth]);

  async function loadData() {
    await execute(async () => {
      // your async operation
    });
  }
}
```

### Utils

ראה [utils/README.md](utils/README.md) לתיעוד מלא:

```javascript
// דוגמאות שימוש
import {
  DateFormatter,
  ValidationHelper,
  StorageHelper,
  ErrorHandler
} from '../utils';

// תאריכים
DateFormatter.toMediumDateTime(date);
DateFormatter.toRelativeTime(date); // "לפני 5 דקות"

// Validation
ValidationHelper.isValidEmail("test@test.com"); // true
ValidationHelper.validateDonutEntry(entry);

// Storage
StorageHelper.set('theme', 'dark');
const theme = StorageHelper.get('theme', 'light');

// Error handling
const userMessage = ErrorHandler.getUserFriendlyMessage(error);
```

---

## 💡 דוגמאות קוד

### יצירת דף חדש מוגן

```javascript
"use client";

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { useAuth, useAsyncOperation } from '../hooks';
import { donutService } from '../services';

export default function MyPage() {
  const { userId } = useAuth();
  const { busy, error, execute } = useAsyncOperation();
  const [data, setData] = useState([]);

  useEffect(() => {
    loadData();
  }, [userId]);

  async function loadData() {
    await execute(async () => {
      const result = await donutService.getEntries({
        userId,
        type: 'mine'
      });
      setData(result);
    });
  }

  if (busy) return <div>טוען...</div>;
  if (error) return <div>{error}</div>;

  return (
    <ProtectedRoute>
      <div>
        {data.map(item => (
          <div key={item.id}>{item.place_name}</div>
        ))}
      </div>
    </ProtectedRoute>
  );
}
```

### שימוש ב-Services

```javascript
import { groupService } from '../services';

// יצירת קבוצה
const group = await groupService.createGroup("משפחת כהן", userId);
console.log('קוד הצטרפות:', group.join_code);

// הצטרפות לקבוצה
try {
  await groupService.joinGroup("ABC123", userId);
} catch (error) {
  console.error(error.message); // הודעה בעברית!
}
```

---

## 🎨 ערכות נושא

האפליקציה תומכת ב-3 ערכות נושא:

- **בהיר** (Light) - ברירת מחדל
- **כהה** (Dark) - מצב לילה
- **חנוכה** (Hanukkah) - עיצוב מיוחד

השינוי נשמר ב-localStorage אוטומטית.

---

## 🗄️ מסד הנתונים

### טבלאות

- **`groups`** - קבוצות משפחה
- **`group_members`** - חברות בקבוצות
- **`donut_entries`** - רשומות סופגניות

### Row Level Security (RLS)

כל הטבלאות מוגנות עם RLS:

```sql
-- משתמש רואה רק את הרשומות שלו
CREATE POLICY "Users can view own entries"
  ON donut_entries FOR SELECT
  USING (created_by = auth.uid());

-- משתמש רואה רשומות משותפות בקבוצות שלו
CREATE POLICY "Users can view group entries"
  ON donut_entries FOR SELECT
  USING (
    visibility = 'group' AND
    is_member_of_group(group_id)
  );
```

---

## 🧪 Testing (עתידי)

הפרויקט מוכן ל-testing:

```javascript
// דוגמה לבדיקת service
import { DonutService } from '../services';

describe('DonutService', () => {
  it('should create entry', async () => {
    const mockClient = { from: jest.fn() };
    const service = new DonutService(mockClient);

    await service.createEntry({ ... });

    expect(mockClient.from).toHaveBeenCalled();
  });
});
```

---

## 🔒 אבטחה

### Best Practices

1. **Environment Variables** - מפתחות ב-.env.local
2. **Row Level Security** - הגנה ברמת מסד הנתונים
3. **Input Validation** - ValidationHelper בכל input
4. **XSS Protection** - Sanitization של inputs
5. **HTTPS Only** - בproduction

### Validation

```javascript
import { ValidationHelper } from '../utils';

// אימות לפני שליחה
try {
  ValidationHelper.isValidEmail(email, true);
  ValidationHelper.isValidPassword(password, true);
} catch (error) {
  console.error(error.message); // הודעה בעברית
}
```

---

## 📦 Deployment

### Vercel (מומלץ)

```bash
# התקנת Vercel CLI
npm i -g vercel

# Deploy
vercel

# הוספת environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### Build Local

```bash
npm run build
npm start
```

---

## 🤝 Contributing

### הוספת Feature חדש

1. **Service חדש** → ראה `services/README.md`
2. **Hook חדש** → ראה `hooks/README.md`
3. **Utility חדש** → ראה `utils/README.md`

### Code Style

- TypeScript לא נדרש (אבל JSDoc מומלץ)
- ESLint rules מוגדרות
- Hebrew comments מעודדים!

---

## 📝 License

MIT

---

## 💬 קרדיטים

נבנה עם:
- ⚛️ [Next.js 14](https://nextjs.org/)
- 🗄️ [Supabase](https://supabase.com/)
- 🎨 CSS Variables + Custom Themes
- 🏗️ OOP Architecture

---

## 📞 תמיכה

יש שאלות? בעיות?

1. בדקי את התיעוד המפורט:
   - [services/README.md](services/README.md)
   - [hooks/README.md](hooks/README.md)
   - [utils/README.md](utils/README.md)

2. פתחי issue ב-GitHub

---

**בהצלחה! 🍩**
