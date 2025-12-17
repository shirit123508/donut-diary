/**
 * ErrorHandler - Centralized error handling and transformation
 * Follows Single Responsibility Principle
 * Provides consistent error handling across the application
 */

/**
 * Base application error class
 */
export class AppError extends Error {
  constructor(message, code = "UNKNOWN_ERROR", originalError = null) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.originalError = originalError;
    this.timestamp = new Date();

    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Authentication related errors
 */
export class AuthenticationError extends AppError {
  constructor(message, originalError = null) {
    super(message, "AUTH_ERROR", originalError);
  }
}

/**
 * Authorization/Permission related errors
 */
export class AuthorizationError extends AppError {
  constructor(message, originalError = null) {
    super(message, "PERMISSION_ERROR", originalError);
  }
}

/**
 * Validation errors (input validation)
 */
export class ValidationError extends AppError {
  constructor(message, field = null, originalError = null) {
    super(message, "VALIDATION_ERROR", originalError);
    this.field = field;
  }
}

/**
 * Network/API related errors
 */
export class NetworkError extends AppError {
  constructor(message, originalError = null) {
    super(message, "NETWORK_ERROR", originalError);
  }
}

/**
 * Resource not found errors
 */
export class NotFoundError extends AppError {
  constructor(resource, originalError = null) {
    super(`${resource} לא נמצא`, "NOT_FOUND", originalError);
    this.resource = resource;
  }
}

/**
 * ErrorHandler - Main error handling utility
 */
export class ErrorHandler {
  /**
   * Transform technical errors to user-friendly Hebrew messages
   * @param {Error} error - The error to transform
   * @returns {string} User-friendly error message in Hebrew
   */
  static getUserFriendlyMessage(error) {
    // If already an AppError, return its message
    if (error instanceof AppError) {
      return error.message;
    }

    const message = error.message || "";
    const lowerMessage = message.toLowerCase();

    // Authentication errors
    if (lowerMessage.includes("invalid login credentials")) {
      return "אימייל או סיסמה שגויים";
    }
    if (lowerMessage.includes("email not confirmed")) {
      return "נא לאמת את כתובת האימייל שלך";
    }
    if (lowerMessage.includes("user already registered")) {
      return "המשתמש כבר רשום במערכת";
    }
    if (lowerMessage.includes("password")) {
      return "הסיסמה חייבת להכיל לפחות 6 תווים";
    }

    // Database/Supabase errors
    if (lowerMessage.includes("duplicate key")) {
      return "הרשומה כבר קיימת במערכת";
    }
    if (lowerMessage.includes("foreign key")) {
      return "לא ניתן למחוק - קיימים קשרים למידע זה";
    }
    if (lowerMessage.includes("row level security")) {
      return "אין לך הרשאה לבצע פעולה זו";
    }
    if (lowerMessage.includes("permission denied")) {
      return "אין לך הרשאה לבצע פעולה זו";
    }

    // Network errors
    if (lowerMessage.includes("network") || lowerMessage.includes("fetch")) {
      return "בעיית תקשורת. נא לבדוק את החיבור לאינטרנט";
    }
    if (lowerMessage.includes("timeout")) {
      return "הפעולה לקחה יותר מדי זמן. נסי שוב";
    }

    // Validation errors
    if (lowerMessage.includes("required")) {
      return "נא למלא את כל השדות הנדרשים";
    }
    if (lowerMessage.includes("invalid email")) {
      return "כתובת האימייל אינה תקינה";
    }

    // Generic fallback
    if (message) {
      return message;
    }

    return "אירעה שגיאה לא צפויה. נסי שוב";
  }

  /**
   * Log error to console (can be extended to send to monitoring service)
   * @param {Error} error - The error to log
   * @param {Object} context - Additional context
   */
  static log(error, context = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        code: error.code,
        stack: error.stack,
      },
      context,
    };

    // In production, send to monitoring service (Sentry, LogRocket, etc.)
    if (process.env.NODE_ENV === "production") {
      // TODO: Send to monitoring service
      console.error("[Error]", logEntry);
    } else {
      // In development, log to console with nice formatting
      console.group("🔴 Error Occurred");
      console.error("Error:", error);
      console.log("Context:", context);
      console.log("User-friendly message:", this.getUserFriendlyMessage(error));
      console.groupEnd();
    }
  }

  /**
   * Handle an error: log it and return user-friendly message
   * @param {Error} error - The error to handle
   * @param {Object} context - Additional context
   * @returns {string} User-friendly error message
   */
  static handle(error, context = {}) {
    this.log(error, context);
    return this.getUserFriendlyMessage(error);
  }

  /**
   * Decorator function to wrap async functions with error handling
   * @param {Function} fn - Async function to wrap
   * @param {Object} context - Context for error logging
   * @returns {Function} Wrapped function
   */
  static withErrorHandling(fn, context = {}) {
    return async (...args) => {
      try {
        return await fn(...args);
      } catch (error) {
        const userMessage = this.handle(error, {
          ...context,
          functionName: fn.name,
          args,
        });

        // Re-throw with user-friendly message
        const wrappedError = new AppError(
          userMessage,
          error.code || "UNKNOWN_ERROR",
          error
        );
        throw wrappedError;
      }
    };
  }

  /**
   * Check if error is of specific type
   * @param {Error} error - Error to check
   * @param {string} type - Error type to check against
   * @returns {boolean} True if error matches type
   */
  static isErrorType(error, type) {
    return error.code === type || error.name === type;
  }

  /**
   * Check if error is a network error
   * @param {Error} error - Error to check
   * @returns {boolean} True if network error
   */
  static isNetworkError(error) {
    return (
      error instanceof NetworkError ||
      error.message?.toLowerCase().includes("network") ||
      error.message?.toLowerCase().includes("fetch")
    );
  }

  /**
   * Check if error is an authentication error
   * @param {Error} error - Error to check
   * @returns {boolean} True if auth error
   */
  static isAuthError(error) {
    return (
      error instanceof AuthenticationError ||
      error.code === "AUTH_ERROR" ||
      error.message?.toLowerCase().includes("auth")
    );
  }
}

/**
 * Utility function to create error from Supabase error
 * @param {Object} supabaseError - Supabase error object
 * @returns {AppError} Appropriate AppError instance
 */
export function createErrorFromSupabase(supabaseError) {
  if (!supabaseError) return null;

  const message = supabaseError.message || "Unknown error";
  const code = supabaseError.code;

  // Authentication errors
  if (code === "PGRST301" || message.includes("auth")) {
    return new AuthenticationError(message, supabaseError);
  }

  // Permission errors
  if (code === "42501" || message.includes("permission")) {
    return new AuthorizationError(message, supabaseError);
  }

  // Not found errors
  if (code === "PGRST116") {
    return new NotFoundError("הרשומה", supabaseError);
  }

  // Validation/constraint errors
  if (code?.startsWith("23")) {
    return new ValidationError(message, null, supabaseError);
  }

  // Default to AppError
  return new AppError(message, code, supabaseError);
}
