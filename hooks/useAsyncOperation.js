"use client";

import { useState, useCallback } from "react";

/**
 * useAsyncOperation - Generic hook for managing async operations state
 * Handles loading, error, and success states in a consistent way
 * Follows DRY principle - eliminates repeated state management code
 *
 * @returns {Object} Async operation state and helpers
 */
export function useAsyncOperation() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /**
   * Execute an async operation with automatic state management
   * @param {Function} operation - Async function to execute
   * @returns {Promise<any>} Result of the operation
   */
  const execute = useCallback(async (operation) => {
    setError("");
    setSuccess("");
    setBusy(true);

    try {
      const result = await operation();
      setBusy(false);
      return result;
    } catch (err) {
      setBusy(false);
      setError(err.message || "אירעה שגיאה");
      throw err;
    }
  }, []);

  /**
   * Set a success message and clear error
   * @param {string} msg - Success message
   */
  const setSuccessMessage = useCallback((msg) => {
    setSuccess(msg);
    setError("");
  }, []);

  /**
   * Set an error message and clear success
   * @param {string} msg - Error message
   */
  const setErrorMessage = useCallback((msg) => {
    setError(msg);
    setSuccess("");
  }, []);

  /**
   * Clear all messages (error and success)
   */
  const clearMessages = useCallback(() => {
    setError("");
    setSuccess("");
  }, []);

  /**
   * Reset all state to initial values
   */
  const reset = useCallback(() => {
    setBusy(false);
    setError("");
    setSuccess("");
  }, []);

  return {
    // State
    busy,
    error,
    success,
    hasError: !!error,
    hasSuccess: !!success,

    // Operations
    execute,
    setSuccessMessage,
    setErrorMessage,
    clearMessages,
    reset,
  };
}
