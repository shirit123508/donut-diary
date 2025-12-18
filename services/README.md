# Services Layer 🏗️

שכבת ה-Services מכילה את כל הלוגיקה העסקית של האפליקציה. כל service אחראי על תחום אחד ועוקב אחר עקרונות OOP ו-SOLID.

## 📦 Services זמינים

### DonutService
ניהול רשומות סופגניות (CRUD operations)

**מתודות:**
- `getEntries({ userId, type, groupId, limit })` - קבלת רשומות
- `deleteEntry(id)` - מחיקת רשומה
- `createEntry(entry)` - יצירת רשומה חדשה
- `updateEntry(id, updates)` - עדכון רשומה קיימת
- `getEntryById(id)` - קבלת רשומה בודדת

### GroupService
ניהול קבוצות משפחה וחברות בקבוצות

**מתודות:**
- `getUserGroups(userId)` - קבלת כל הקבוצות של משתמש
- `createGroup(name, userId)` - יצירת קבוצה חדשה
- `joinGroup(joinCode, userId)` - הצטרפות לקבוצה עם קוד
- `leaveGroup(groupId, userId)` - יציאה מקבוצה
- `getGroupById(groupId)` - קבלת פרטי קבוצה
- `isMember(groupId, userId)` - בדיקה אם משתמש חבר בקבוצה

### AuthService
ניהול אימות והתחברות משתמשים

**מתודות:**
- `signIn(email, password)` - התחברות
- `signUp(email, password)` - הרשמה
- `signOut()` - התנתקות
- `getSession()` - קבלת session נוכחי
- `getCurrentUser()` - קבלת משתמש נוכחי
- `onAuthStateChange(callback)` - האזנה לשינויי authentication
- `resetPassword(email)` - איפוס סיסמה
- `updatePassword(newPassword)` - עדכון סיסמה

---

## 🎯 דוגמאות שימוש

### DonutService - יצירת רשומה חדשה

```javascript
import { donutService } from '../services';

async function addDonut() {
  try {
    const newEntry = {
      place_name: "רולדין",
      donut_name: "סופגניית נוטלה",
      filling: "נוטלה",
      rating: 9,
      price: 8,
      date: new Date().toISOString(),
      notes: "מעולה!",
      visibility: "group",
      group_id: "group-uuid",
      created_by: "user-uuid"
    };

    const created = await donutService.createEntry(newEntry);
    console.log('נוצר בהצלחה:', created);
  } catch (error) {
    console.error('שגיאה:', error.message);
  }
}
```

### DonutService - קבלת רשומות

```javascript
import { donutService } from '../services';

async function loadMyDonuts(userId) {
  try {
    const entries = await donutService.getEntries({
      userId,
      type: 'mine',
      limit: 50
    });
    console.log('הרשומות שלי:', entries);
  } catch (error) {
    console.error('שגיאה:', error.message);
  }
}

async function loadGroupDonuts(userId, groupId) {
  try {
    const entries = await donutService.getEntries({
      userId,
      type: 'group',
      groupId,
      limit: 100
    });
    console.log('רשומות הקבוצה:', entries);
  } catch (error) {
    console.error('שגיאה:', error.message);
  }
}
```

### GroupService - יצירת קבוצה

```javascript
import { groupService } from '../services';

async function createFamily(userId) {
  try {
    const newGroup = await groupService.createGroup("משפחת כהן", userId);
    console.log('קוד הצטרפות:', newGroup.join_code);
    console.log('ID קבוצה:', newGroup.id);
  } catch (error) {
    console.error('שגיאה:', error.message);
  }
}
```

### GroupService - הצטרפות לקבוצה

```javascript
import { groupService } from '../services';

async function joinFamily(joinCode, userId) {
  try {
    const group = await groupService.joinGroup(joinCode, userId);
    console.log('הצטרפת ל:', group.name);
  } catch (error) {
    if (error.message.includes('כבר חברה')) {
      console.log('את כבר חברה בקבוצה הזו');
    } else if (error.message.includes('לא נמצא')) {
      console.log('הקוד לא תקין');
    } else {
      console.error('שגיאה:', error.message);
    }
  }
}
```

### AuthService - התחברות

```javascript
import { authService } from '../services';

async function login(email, password) {
  try {
    const { session, user } = await authService.signIn(email, password);
    console.log('משתמש מחובר:', user.email);
    console.log('Session:', session);
  } catch (error) {
    console.error('שגיאת התחברות:', error.message);
  }
}
```

---

## 🏗️ ארכיטקטורה

### עקרונות OOP

כל ה-Services בנויים על פי עקרונות:

**1. Single Responsibility Principle (SRP)**
- כל service אחראי על תחום אחד בלבד
- DonutService - רק סופגניות
- GroupService - רק קבוצות
- AuthService - רק authentication

**2. Encapsulation**
- כל הלוגיקה העסקית מוסתרת בתוך ה-service
- Components לא צריכים לדעת על Supabase
- ניתן להחליף את ה-backend בקלות

**3. Dependency Injection**
- Services מקבלים את ה-client דרך constructor
- ניתן להזריק mock client לבדיקות

```javascript
// Production
const service = new DonutService(supabaseClient);

// Testing
const mockClient = { from: jest.fn() };
const service = new DonutService(mockClient);
```

### Error Handling

כל ה-Services משתמשים ב-ErrorHandler:

```javascript
try {
  const data = await donutService.getEntries(...);
} catch (error) {
  // השגיאה כבר מתועדת ב-ErrorHandler
  // השגיאה כבר הומרה להודעה ידידותית בעברית
  console.error(error.message);
}
```

### Validation

ה-Services משתמשים ב-ValidationHelper:

```javascript
// DonutService מוודא שהנתונים תקינים לפני שמירה
await donutService.createEntry({
  place_name: "רולדין", // ✓ נבדק שהשם תקין
  rating: 15             // ✗ יזרוק שגיאה - חייב להיות 1-10
});
```

---

## 🔧 הרחבה

### איך להוסיף service חדש?

1. **צור קובץ חדש** - `services/MyService.js`

```javascript
import { ErrorHandler, createErrorFromSupabase } from "../utils";

export class MyService {
  constructor(client) {
    this.client = client;
  }

  async myMethod(params) {
    const { data, error } = await this.client
      .from("my_table")
      .select("*");

    if (error) {
      const appError = createErrorFromSupabase(error);
      ErrorHandler.log(appError, { method: "myMethod", params });
      throw appError;
    }

    return data;
  }
}
```

2. **הוסף ל-index.js**

```javascript
import { MyService } from "./MyService";

export const myService = new MyService(supabase);
export { MyService };
```

3. **השתמש בקומפוננטה**

```javascript
import { myService } from '../services';

const data = await myService.myMethod();
```

---

## 📚 למידע נוסף

- **ErrorHandler**: ראה `utils/README.md`
- **ValidationHelper**: ראה `utils/README.md`
- **Custom Hooks**: ראה `hooks/README.md`
