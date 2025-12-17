import { ValidationError } from "./ErrorHandler";

/**
 * ValidationHelper - Utility class for input validation
 * Follows Single Responsibility Principle
 * Provides consistent validation across the application
 */

export class ValidationHelper {
  // Common regex patterns
  static PATTERNS = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    JOIN_CODE: /^[A-Z0-9]{6}$/,
    PHONE_IL: /^0\d{1,2}-?\d{7}$/,
    URL: /^https?:\/\/.+/,
  };

  // Validation rules
  static RULES = {
    PASSWORD_MIN_LENGTH: 6,
    JOIN_CODE_LENGTH: 6,
    DONUT_NAME_MAX_LENGTH: 100,
    PLACE_NAME_MAX_LENGTH: 100,
    NOTES_MAX_LENGTH: 500,
    GROUP_NAME_MAX_LENGTH: 50,
    RATING_MIN: 1,
    RATING_MAX: 10,
  };

  /**
   * Validate email address
   * @param {string} email - Email to validate
   * @param {boolean} throwOnError - If true, throws ValidationError instead of returning boolean
   * @returns {boolean} True if valid
   * @throws {ValidationError} If throwOnError is true and validation fails
   */
  static isValidEmail(email, throwOnError = false) {
    if (!email || typeof email !== "string") {
      if (throwOnError) {
        throw new ValidationError("נא להזין כתובת אימייל", "email");
      }
      return false;
    }

    const valid = this.PATTERNS.EMAIL.test(email.trim());

    if (!valid && throwOnError) {
      throw new ValidationError("כתובת האימייל אינה תקינה", "email");
    }

    return valid;
  }

  /**
   * Validate password
   * @param {string} password - Password to validate
   * @param {boolean} throwOnError - If true, throws ValidationError
   * @returns {boolean} True if valid
   * @throws {ValidationError} If validation fails
   */
  static isValidPassword(password, throwOnError = false) {
    if (!password || typeof password !== "string") {
      if (throwOnError) {
        throw new ValidationError("נא להזין סיסמה", "password");
      }
      return false;
    }

    const valid = password.length >= this.RULES.PASSWORD_MIN_LENGTH;

    if (!valid && throwOnError) {
      throw new ValidationError(
        `הסיסמה חייבת להכיל לפחות ${this.RULES.PASSWORD_MIN_LENGTH} תווים`,
        "password"
      );
    }

    return valid;
  }

  /**
   * Validate join code format
   * @param {string} code - Join code to validate
   * @param {boolean} throwOnError - If true, throws ValidationError
   * @returns {boolean} True if valid
   */
  static isValidJoinCode(code, throwOnError = false) {
    if (!code || typeof code !== "string") {
      if (throwOnError) {
        throw new ValidationError("נא להזין קוד הצטרפות", "joinCode");
      }
      return false;
    }

    const normalized = code.trim().toUpperCase();
    const valid = this.PATTERNS.JOIN_CODE.test(normalized);

    if (!valid && throwOnError) {
      throw new ValidationError(
        "קוד ההצטרפות חייב להכיל 6 תווים (אותיות ומספרים באנגלית)",
        "joinCode"
      );
    }

    return valid;
  }

  /**
   * Validate required field
   * @param {any} value - Value to check
   * @param {string} fieldName - Field name for error message
   * @param {boolean} throwOnError - If true, throws ValidationError
   * @returns {boolean} True if not empty
   */
  static isRequired(value, fieldName = "שדה זה", throwOnError = false) {
    const valid =
      value !== null &&
      value !== undefined &&
      value !== "" &&
      (typeof value !== "string" || value.trim() !== "");

    if (!valid && throwOnError) {
      throw new ValidationError(`${fieldName} הוא שדה חובה`, fieldName);
    }

    return valid;
  }

  /**
   * Validate string length
   * @param {string} value - String to validate
   * @param {number} min - Minimum length (inclusive)
   * @param {number} max - Maximum length (inclusive)
   * @param {string} fieldName - Field name for error message
   * @param {boolean} throwOnError - If true, throws ValidationError
   * @returns {boolean} True if valid
   */
  static isValidLength(
    value,
    min = 0,
    max = Infinity,
    fieldName = "שדה זה",
    throwOnError = false
  ) {
    if (!value || typeof value !== "string") {
      if (throwOnError && min > 0) {
        throw new ValidationError(`${fieldName} הוא שדה חובה`, fieldName);
      }
      return min === 0;
    }

    const length = value.trim().length;
    const valid = length >= min && length <= max;

    if (!valid && throwOnError) {
      if (length < min) {
        throw new ValidationError(
          `${fieldName} חייב להכיל לפחות ${min} תווים`,
          fieldName
        );
      } else {
        throw new ValidationError(
          `${fieldName} חייב להכיל עד ${max} תווים`,
          fieldName
        );
      }
    }

    return valid;
  }

  /**
   * Validate number range
   * @param {number} value - Number to validate
   * @param {number} min - Minimum value (inclusive)
   * @param {number} max - Maximum value (inclusive)
   * @param {string} fieldName - Field name for error message
   * @param {boolean} throwOnError - If true, throws ValidationError
   * @returns {boolean} True if valid
   */
  static isInRange(
    value,
    min,
    max,
    fieldName = "שדה זה",
    throwOnError = false
  ) {
    const num = Number(value);

    if (isNaN(num)) {
      if (throwOnError) {
        throw new ValidationError(`${fieldName} חייב להיות מספר`, fieldName);
      }
      return false;
    }

    const valid = num >= min && num <= max;

    if (!valid && throwOnError) {
      throw new ValidationError(
        `${fieldName} חייב להיות בין ${min} ל-${max}`,
        fieldName
      );
    }

    return valid;
  }

  /**
   * Validate donut rating
   * @param {number} rating - Rating to validate
   * @param {boolean} throwOnError - If true, throws ValidationError
   * @returns {boolean} True if valid
   */
  static isValidRating(rating, throwOnError = false) {
    return this.isInRange(
      rating,
      this.RULES.RATING_MIN,
      this.RULES.RATING_MAX,
      "דירוג",
      throwOnError
    );
  }

  /**
   * Validate donut entry
   * @param {Object} entry - Donut entry to validate
   * @returns {Object} Validation result { valid: boolean, errors: Object }
   */
  static validateDonutEntry(entry) {
    const errors = {};

    try {
      this.isRequired(entry.place_name, "שם המקום", true);
      this.isValidLength(
        entry.place_name,
        1,
        this.RULES.PLACE_NAME_MAX_LENGTH,
        "שם המקום",
        true
      );
    } catch (error) {
      errors.place_name = error.message;
    }

    try {
      this.isRequired(entry.donut_name, "שם הסופגנייה", true);
      this.isValidLength(
        entry.donut_name,
        1,
        this.RULES.DONUT_NAME_MAX_LENGTH,
        "שם הסופגנייה",
        true
      );
    } catch (error) {
      errors.donut_name = error.message;
    }

    try {
      this.isRequired(entry.rating, "דירוג", true);
      this.isValidRating(entry.rating, true);
    } catch (error) {
      errors.rating = error.message;
    }

    if (entry.notes) {
      try {
        this.isValidLength(
          entry.notes,
          0,
          this.RULES.NOTES_MAX_LENGTH,
          "הערות",
          true
        );
      } catch (error) {
        errors.notes = error.message;
      }
    }

    if (entry.price !== null && entry.price !== undefined) {
      try {
        this.isInRange(entry.price, 0, 1000, "מחיר", true);
      } catch (error) {
        errors.price = error.message;
      }
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors,
    };
  }

  /**
   * Validate group name
   * @param {string} name - Group name to validate
   * @param {boolean} throwOnError - If true, throws ValidationError
   * @returns {boolean} True if valid
   */
  static isValidGroupName(name, throwOnError = false) {
    return this.isValidLength(
      name,
      1,
      this.RULES.GROUP_NAME_MAX_LENGTH,
      "שם המשפחה",
      throwOnError
    );
  }

  /**
   * Sanitize string (remove dangerous characters)
   * @param {string} value - String to sanitize
   * @returns {string} Sanitized string
   */
  static sanitize(value) {
    if (!value || typeof value !== "string") return "";

    return value
      .trim()
      .replace(/[<>]/g, "") // Remove < and >
      .replace(/javascript:/gi, "") // Remove javascript: protocol
      .substring(0, 1000); // Limit length
  }

  /**
   * Validate URL
   * @param {string} url - URL to validate
   * @param {boolean} throwOnError - If true, throws ValidationError
   * @returns {boolean} True if valid
   */
  static isValidUrl(url, throwOnError = false) {
    if (!url || typeof url !== "string") {
      if (throwOnError) {
        throw new ValidationError("נא להזין כתובת URL", "url");
      }
      return false;
    }

    const valid = this.PATTERNS.URL.test(url.trim());

    if (!valid && throwOnError) {
      throw new ValidationError("כתובת ה-URL אינה תקינה", "url");
    }

    return valid;
  }

  /**
   * Validate date is not in the future
   * @param {Date|string} date - Date to validate
   * @param {boolean} throwOnError - If true, throws ValidationError
   * @returns {boolean} True if valid
   */
  static isNotFutureDate(date, throwOnError = false) {
    const parsedDate = new Date(date);
    const now = new Date();

    const valid = parsedDate <= now;

    if (!valid && throwOnError) {
      throw new ValidationError("התאריך לא יכול להיות בעתיד", "date");
    }

    return valid;
  }
}
