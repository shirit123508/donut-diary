# Utility Classes 🛠️

תיקיית ה-Utils מכילה utility classes שמספקות פונקציונליות עזר לכל האפליקציה.

## 📦 Utils זמינים

### ErrorHandler
ניהול שגיאות מרכזי עם הודעות ידידותיות בעברית

### DateFormatter
פורמט תאריכים עקבי בעברית (he-IL)

### ValidationHelper
וולידציה של inputs עם הודעות בעברית

---

## 🎯 דוגמאות שימוש

## ErrorHandler

### Custom Error Classes

```javascript
import {
  AppError,
  AuthenticationError,
  ValidationError,
  NotFoundError
} from '../utils';

// שגיאה כללית
throw new AppError("משהו השתבש", "MY_ERROR");

// שגיאת authentication
throw new AuthenticationError("אימייל או סיסמה שגויים");

// שגיאת validation
throw new ValidationError("השדה הזה הוא חובה", "fieldName");

// משאב לא נמצא
throw new NotFoundError("הסופגנייה");
```

### המרת שגיאות Supabase

```javascript
import { createErrorFromSupabase, ErrorHandler } from '../utils';

async function myDatabaseCall() {
  const { data, error } = await supabase
    .from('table')
    .select('*');

  if (error) {
    // הופך שגיאה טכנית להודעה ידידותית
    const appError = createErrorFromSupabase(error);
    ErrorHandler.log(appError, { method: 'myDatabaseCall' });
    throw appError;
  }

  return data;
}
```

### הודעות ידידותיות

```javascript
import { ErrorHandler } from '../utils';

// השגיאה המקורית
const error = new Error("duplicate key value violates unique constraint");

// המרה להודעה בעברית
const message = ErrorHandler.getUserFriendlyMessage(error);
console.log(message); // "הרשומה כבר קיימת במערכת"
```

### Error Logging

```javascript
import { ErrorHandler } from '../utils';

try {
  await someOperation();
} catch (error) {
  // Log עם context
  ErrorHandler.log(error, {
    userId: 'user-123',
    operation: 'createDonut',
    timestamp: Date.now()
  });

  // מקבל הודעה ידידותית
  const userMessage = ErrorHandler.handle(error);
  console.error(userMessage);
}
```

### Decorator Pattern

```javascript
import { ErrorHandler } from '../utils';

// עוטף פונקציה עם error handling
const safeFunction = ErrorHandler.withErrorHandling(
  async (param) => {
    // יכול לזרוק שגיאות
    await riskyOperation(param);
  },
  { context: 'myOperation' }
);

// השתמש
try {
  await safeFunction('test');
} catch (error) {
  // השגיאה כבר logged וממומרת
  console.error(error.message);
}
```

---

## DateFormatter

### פורמט תאריכים בסיסי

```javascript
import { DateFormatter } from '../utils';

const date = "2025-12-17T14:30:00";

// פורמט בינוני (ברירת מחדל)
console.log(DateFormatter.toMediumDateTime(date));
// "17 בדצמ׳ 2025, 14:30"

// פורמט ארוך
console.log(DateFormatter.toLongDateTime(date));
// "17 בדצמבר 2025, 14:30"

// פורמט מלא
console.log(DateFormatter.toFullDateTime(date));
// "יום שלישי, 17 בדצמבר 2025 בשעה 14:30:00"
```

### תאריך בלבד / שעה בלבד

```javascript
import { DateFormatter } from '../utils';

const date = "2025-12-17T14:30:00";

// תאריך בלבד
console.log(DateFormatter.toDateOnly(date));
// "17 בדצמ׳ 2025"

// תאריך מלא
console.log(DateFormatter.toFullDate(date));
// "יום שלישי, 17 בדצמבר 2025"

// שעה בלבד
console.log(DateFormatter.toTimeOnly(date));
// "14:30"

// תאריך קצר
console.log(DateFormatter.toShortDate(date));
// "17/12/2025"
```

### Relative Time

```javascript
import { DateFormatter } from '../utils';

// לפני 5 דקות
const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
console.log(DateFormatter.toRelativeTime(fiveMinutesAgo));
// "לפני 5 דקות"

// אתמול
const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
console.log(DateFormatter.toRelativeTime(yesterday));
// "אתמול"

// לפני שבוע
const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
console.log(DateFormatter.toRelativeTime(lastWeek));
// "לפני שבוע"
```

### בדיקות תאריך

```javascript
import { DateFormatter } from '../utils';

const today = new Date();
const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

console.log(DateFormatter.isToday(today)); // true
console.log(DateFormatter.isToday(yesterday)); // false

console.log(DateFormatter.isYesterday(yesterday)); // true
console.log(DateFormatter.isYesterday(today)); // false
```

### שימוש ב-Components

```javascript
import { DateFormatter } from '../utils';

export default function DonutCard({ donut }) {
  return (
    <div>
      <h3>{donut.place_name}</h3>
      <p>{DateFormatter.toMediumDateTime(donut.date)}</p>
      <p>{DateFormatter.toRelativeTime(donut.created_at)}</p>
    </div>
  );
}
```

---

## ValidationHelper

### Validation בסיסית

```javascript
import { ValidationHelper } from '../utils';

// אימייל
const isValid = ValidationHelper.isValidEmail("test@example.com");
console.log(isValid); // true

// זריקת שגיאה
try {
  ValidationHelper.isValidEmail("invalid-email", true);
} catch (error) {
  console.error(error.message); // "כתובת האימייל אינה תקינה"
}
```

### Validation של סיסמה

```javascript
import { ValidationHelper } from '../utils';

// בדיקה
const isValid = ValidationHelper.isValidPassword("123456");
console.log(isValid); // true

const isTooShort = ValidationHelper.isValidPassword("12345");
console.log(isTooShort); // false

// עם שגיאה
try {
  ValidationHelper.isValidPassword("12345", true);
} catch (error) {
  console.error(error.message);
  // "הסיסמה חייבת להכיל לפחות 6 תווים"
}
```

### Validation של קוד הצטרפות

```javascript
import { ValidationHelper } from '../utils';

// תקין
ValidationHelper.isValidJoinCode("ABC123", true); // ✓

// לא תקין
try {
  ValidationHelper.isValidJoinCode("abc", true);
} catch (error) {
  console.error(error.message);
  // "קוד ההצטרפות חייב להכיל 6 תווים..."
}
```

### Validation של רשומת סופגנייה

```javascript
import { ValidationHelper } from '../utils';

const entry = {
  place_name: "רולדין",
  donut_name: "נוטלה",
  rating: 9,
  price: 8,
  notes: "מעולה!"
};

const result = ValidationHelper.validateDonutEntry(entry);

if (result.valid) {
  console.log('הרשומה תקינה!');
} else {
  console.error('שגיאות:', result.errors);
  // { place_name: "השדה הזה חובה", ... }
}
```

### Validation במידה

```javascript
import { ValidationHelper } from '../utils';

// אורך string
const isValid = ValidationHelper.isValidLength(
  "שם הקבוצה",
  1,        // min
  50,       // max
  "שם הקבוצה",
  true      // throw on error
); // ✓

// טווח מספרים
const ratingValid = ValidationHelper.isInRange(
  8,        // value
  1,        // min
  10,       // max
  "דירוג",
  true
); // ✓

// דירוג ספציפי
const isValidRating = ValidationHelper.isValidRating(9);
console.log(isValidRating); // true
```

### Sanitization

```javascript
import { ValidationHelper } from '../utils';

const userInput = "<script>alert('xss')</script>Hello";
const clean = ValidationHelper.sanitize(userInput);
console.log(clean); // "alert('xss')Hello"
```

### שימוש ב-Forms

```javascript
import { useState } from 'react';
import { ValidationHelper } from '../utils';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  function handleEmailChange(e) {
    const value = e.target.value;
    setEmail(value);

    try {
      ValidationHelper.isValidEmail(value, true);
      setEmailError('');
    } catch (error) {
      setEmailError(error.message);
    }
  }

  return (
    <div>
      <input
        type="email"
        value={email}
        onChange={handleEmailChange}
      />
      {emailError && <p style={{ color: 'red' }}>{emailError}</p>}
    </div>
  );
}
```

---

## 🏗️ ארכיטקטורה

### למה Utility Classes?

**1. קוד ניקי וארגון**
```javascript
// לפני
function formatDate(date) {
  try {
    return new Date(date).toLocaleString("he-IL", ...);
  } catch {
    return date;
  }
}
// חוזר ב-10 מקומות

// אחרי
DateFormatter.toMediumDateTime(date);
// קיים במקום אחד
```

**2. עקביות**
```javascript
// כל התאריכים באפליקציה בעברית ובפורמט אחיד
DateFormatter.toMediumDateTime(date);
```

**3. Testability**
```javascript
// קל לבדוק
expect(DateFormatter.isToday(new Date())).toBe(true);
expect(ValidationHelper.isValidEmail("test@test.com")).toBe(true);
```

---

## 🔧 הרחבה

### איך להוסיף Utility חדש?

**1. צור קובץ חדש** - `utils/MyHelper.js`

```javascript
export class MyHelper {
  static myMethod(param) {
    // logic here
    return result;
  }

  static anotherMethod(param) {
    // more logic
  }
}
```

**2. הוסף ל-index.js**

```javascript
export { MyHelper } from "./MyHelper";
```

**3. השתמש**

```javascript
import { MyHelper } from '../utils';

const result = MyHelper.myMethod('test');
```

---

## 📊 Error Code Reference

### ErrorHandler - קודי שגיאה

| Code | Class | תיאור |
|------|-------|--------|
| `AUTH_ERROR` | AuthenticationError | שגיאת התחברות |
| `PERMISSION_ERROR` | AuthorizationError | אין הרשאה |
| `VALIDATION_ERROR` | ValidationError | נתונים לא תקינים |
| `NETWORK_ERROR` | NetworkError | בעיית רשת |
| `NOT_FOUND` | NotFoundError | משאב לא נמצא |
| `UNKNOWN_ERROR` | AppError | שגיאה לא מזוהה |

### ValidationHelper - כללי Validation

| שדה | מינימום | מקסימום | Regex |
|-----|---------|----------|-------|
| Email | - | - | `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` |
| Password | 6 תווים | - | - |
| Join Code | 6 תווים | 6 תווים | `/^[A-Z0-9]{6}$/` |
| Group Name | 1 תו | 50 תווים | - |
| Place Name | 1 תו | 100 תווים | - |
| Donut Name | 1 תו | 100 תווים | - |
| Rating | 1 | 10 | - |
| Notes | 0 | 500 תווים | - |

---

## 📚 למידע נוסף

- **Services**: ראה `services/README.md`
- **Hooks**: ראה `hooks/README.md`
- **Components**: ראה `components/README.md`
