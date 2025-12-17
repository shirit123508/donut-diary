/**
 * DateFormatter - Utility class for date formatting
 * Follows Single Responsibility Principle
 * Provides consistent date formatting across the application in Hebrew
 */

export class DateFormatter {
  // Locale for Hebrew formatting
  static LOCALE = "he-IL";

  // Common date format options
  static FORMAT_OPTIONS = {
    FULL: {
      dateStyle: "full",
      timeStyle: "medium",
    },
    LONG: {
      dateStyle: "long",
      timeStyle: "short",
    },
    MEDIUM: {
      dateStyle: "medium",
      timeStyle: "short",
    },
    SHORT: {
      dateStyle: "short",
      timeStyle: "short",
    },
    DATE_ONLY: {
      dateStyle: "medium",
    },
    TIME_ONLY: {
      timeStyle: "short",
    },
    FULL_DATE: {
      dateStyle: "full",
    },
    SHORT_DATE: {
      dateStyle: "short",
    },
  };

  /**
   * Safely parse date string/object
   * @param {string|Date} dateInput - Date to parse
   * @returns {Date|null} Parsed date or null if invalid
   */
  static parseDate(dateInput) {
    if (!dateInput) return null;

    try {
      if (dateInput instanceof Date) {
        return isNaN(dateInput.getTime()) ? null : dateInput;
      }

      const parsed = new Date(dateInput);
      return isNaN(parsed.getTime()) ? null : parsed;
    } catch {
      return null;
    }
  }

  /**
   * Format date to Hebrew locale string
   * @param {string|Date} dateInput - Date to format
   * @param {Object} options - Intl.DateTimeFormat options
   * @returns {string} Formatted date or original input if invalid
   */
  static format(dateInput, options = this.FORMAT_OPTIONS.MEDIUM) {
    const date = this.parseDate(dateInput);

    if (!date) {
      return typeof dateInput === "string" ? dateInput : "";
    }

    try {
      return date.toLocaleString(this.LOCALE, options);
    } catch {
      return dateInput.toString();
    }
  }

  /**
   * Format to medium date and time (default format)
   * Example: "17 בדצמ׳ 2025, 14:30"
   * @param {string|Date} dateInput - Date to format
   * @returns {string} Formatted date and time
   */
  static toMediumDateTime(dateInput) {
    return this.format(dateInput, this.FORMAT_OPTIONS.MEDIUM);
  }

  /**
   * Format to long date and time
   * Example: "17 בדצמבר 2025, 14:30"
   * @param {string|Date} dateInput - Date to format
   * @returns {string} Formatted date and time
   */
  static toLongDateTime(dateInput) {
    return this.format(dateInput, this.FORMAT_OPTIONS.LONG);
  }

  /**
   * Format to full date and time
   * Example: "יום שלישי, 17 בדצמבר 2025 בשעה 14:30:00"
   * @param {string|Date} dateInput - Date to format
   * @returns {string} Formatted date and time
   */
  static toFullDateTime(dateInput) {
    return this.format(dateInput, this.FORMAT_OPTIONS.FULL);
  }

  /**
   * Format to date only (no time)
   * Example: "17 בדצמ׳ 2025"
   * @param {string|Date} dateInput - Date to format
   * @returns {string} Formatted date
   */
  static toDateOnly(dateInput) {
    return this.format(dateInput, this.FORMAT_OPTIONS.DATE_ONLY);
  }

  /**
   * Format to full date only
   * Example: "יום שלישי, 17 בדצמבר 2025"
   * @param {string|Date} dateInput - Date to format
   * @returns {string} Formatted full date
   */
  static toFullDate(dateInput) {
    return this.format(dateInput, this.FORMAT_OPTIONS.FULL_DATE);
  }

  /**
   * Format to time only (no date)
   * Example: "14:30"
   * @param {string|Date} dateInput - Date to format
   * @returns {string} Formatted time
   */
  static toTimeOnly(dateInput) {
    return this.format(dateInput, this.FORMAT_OPTIONS.TIME_ONLY);
  }

  /**
   * Format to short date
   * Example: "17/12/2025"
   * @param {string|Date} dateInput - Date to format
   * @returns {string} Formatted short date
   */
  static toShortDate(dateInput) {
    return this.format(dateInput, this.FORMAT_OPTIONS.SHORT_DATE);
  }

  /**
   * Get relative time (e.g., "לפני 5 דקות", "אתמול")
   * @param {string|Date} dateInput - Date to format
   * @returns {string} Relative time string
   */
  static toRelativeTime(dateInput) {
    const date = this.parseDate(dateInput);
    if (!date) return "";

    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    // Future dates
    if (diffInSeconds < 0) {
      return "בעתיד";
    }

    // Less than a minute
    if (diffInSeconds < 60) {
      return "כרגע";
    }

    // Less than an hour
    if (diffInMinutes < 60) {
      return `לפני ${diffInMinutes} ${diffInMinutes === 1 ? "דקה" : "דקות"}`;
    }

    // Less than a day
    if (diffInHours < 24) {
      return `לפני ${diffInHours} ${diffInHours === 1 ? "שעה" : "שעות"}`;
    }

    // Yesterday
    if (diffInDays === 1) {
      return "אתמול";
    }

    // Less than a week
    if (diffInDays < 7) {
      return `לפני ${diffInDays} ימים`;
    }

    // Less than a month
    if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return `לפני ${weeks} ${weeks === 1 ? "שבוע" : "שבועות"}`;
    }

    // Less than a year
    if (diffInDays < 365) {
      const months = Math.floor(diffInDays / 30);
      return `לפני ${months} ${months === 1 ? "חודש" : "חודשים"}`;
    }

    // More than a year
    const years = Math.floor(diffInDays / 365);
    return `לפני ${years} ${years === 1 ? "שנה" : "שנים"}`;
  }

  /**
   * Check if date is today
   * @param {string|Date} dateInput - Date to check
   * @returns {boolean} True if date is today
   */
  static isToday(dateInput) {
    const date = this.parseDate(dateInput);
    if (!date) return false;

    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  /**
   * Check if date is yesterday
   * @param {string|Date} dateInput - Date to check
   * @returns {boolean} True if date is yesterday
   */
  static isYesterday(dateInput) {
    const date = this.parseDate(dateInput);
    if (!date) return false;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    return (
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear()
    );
  }

  /**
   * Get ISO string for database storage
   * @param {Date} date - Date to convert
   * @returns {string} ISO string
   */
  static toISOString(date = new Date()) {
    return date.toISOString();
  }

  /**
   * Get current timestamp
   * @returns {string} Current ISO timestamp
   */
  static now() {
    return this.toISOString();
  }
}
