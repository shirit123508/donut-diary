/**
 * StorageHelper - Utility class for localStorage operations
 * Provides type-safe localStorage with JSON serialization
 * Follows Single Responsibility Principle
 */

export class StorageHelper {
  /**
   * Get item from localStorage
   * @param {string} key - Storage key
   * @param {any} defaultValue - Default value if key doesn't exist
   * @returns {any} Parsed value or default value
   */
  static get(key, defaultValue = null) {
    if (typeof window === 'undefined') return defaultValue;

    try {
      const item = window.localStorage.getItem(key);
      if (item === null) return defaultValue;

      // Try to parse JSON
      return JSON.parse(item);
    } catch (error) {
      console.warn(`Failed to get item "${key}" from localStorage:`, error);
      return defaultValue;
    }
  }

  /**
   * Set item in localStorage
   * @param {string} key - Storage key
   * @param {any} value - Value to store (will be JSON stringified)
   * @returns {boolean} True if successful
   */
  static set(key, value) {
    if (typeof window === 'undefined') return false;

    try {
      const serialized = JSON.stringify(value);
      window.localStorage.setItem(key, serialized);
      return true;
    } catch (error) {
      console.error(`Failed to set item "${key}" in localStorage:`, error);
      return false;
    }
  }

  /**
   * Remove item from localStorage
   * @param {string} key - Storage key
   * @returns {boolean} True if successful
   */
  static remove(key) {
    if (typeof window === 'undefined') return false;

    try {
      window.localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Failed to remove item "${key}" from localStorage:`, error);
      return false;
    }
  }

  /**
   * Clear all items from localStorage
   * @returns {boolean} True if successful
   */
  static clear() {
    if (typeof window === 'undefined') return false;

    try {
      window.localStorage.clear();
      return true;
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
      return false;
    }
  }

  /**
   * Check if key exists in localStorage
   * @param {string} key - Storage key
   * @returns {boolean} True if key exists
   */
  static has(key) {
    if (typeof window === 'undefined') return false;

    return window.localStorage.getItem(key) !== null;
  }

  /**
   * Get all keys from localStorage
   * @returns {string[]} Array of keys
   */
  static keys() {
    if (typeof window === 'undefined') return [];

    try {
      return Object.keys(window.localStorage);
    } catch (error) {
      console.error('Failed to get localStorage keys:', error);
      return [];
    }
  }

  /**
   * Get number of items in localStorage
   * @returns {number} Number of items
   */
  static length() {
    if (typeof window === 'undefined') return 0;

    try {
      return window.localStorage.length;
    } catch (error) {
      console.error('Failed to get localStorage length:', error);
      return 0;
    }
  }

  /**
   * Get all items from localStorage as object
   * @returns {Object} Object with all key-value pairs
   */
  static getAll() {
    if (typeof window === 'undefined') return {};

    try {
      const items = {};
      const keys = this.keys();

      keys.forEach(key => {
        items[key] = this.get(key);
      });

      return items;
    } catch (error) {
      console.error('Failed to get all localStorage items:', error);
      return {};
    }
  }

  /**
   * Set multiple items at once
   * @param {Object} items - Object with key-value pairs
   * @returns {boolean} True if all successful
   */
  static setMultiple(items) {
    if (typeof window === 'undefined') return false;

    try {
      Object.entries(items).forEach(([key, value]) => {
        this.set(key, value);
      });
      return true;
    } catch (error) {
      console.error('Failed to set multiple items:', error);
      return false;
    }
  }

  /**
   * Remove multiple items at once
   * @param {string[]} keys - Array of keys to remove
   * @returns {boolean} True if all successful
   */
  static removeMultiple(keys) {
    if (typeof window === 'undefined') return false;

    try {
      keys.forEach(key => {
        this.remove(key);
      });
      return true;
    } catch (error) {
      console.error('Failed to remove multiple items:', error);
      return false;
    }
  }

  /**
   * Get item with expiration check
   * @param {string} key - Storage key
   * @param {any} defaultValue - Default value if expired or not found
   * @returns {any} Value or default
   */
  static getWithExpiry(key, defaultValue = null) {
    if (typeof window === 'undefined') return defaultValue;

    try {
      const itemStr = window.localStorage.getItem(key);
      if (!itemStr) return defaultValue;

      const item = JSON.parse(itemStr);
      const now = new Date();

      // Check if expired
      if (item.expiry && now.getTime() > item.expiry) {
        this.remove(key);
        return defaultValue;
      }

      return item.value;
    } catch (error) {
      console.warn(`Failed to get item with expiry "${key}":`, error);
      return defaultValue;
    }
  }

  /**
   * Set item with expiration time
   * @param {string} key - Storage key
   * @param {any} value - Value to store
   * @param {number} ttl - Time to live in milliseconds
   * @returns {boolean} True if successful
   */
  static setWithExpiry(key, value, ttl) {
    if (typeof window === 'undefined') return false;

    try {
      const now = new Date();
      const item = {
        value: value,
        expiry: now.getTime() + ttl,
      };

      window.localStorage.setItem(key, JSON.stringify(item));
      return true;
    } catch (error) {
      console.error(`Failed to set item with expiry "${key}":`, error);
      return false;
    }
  }

  /**
   * Check storage size in bytes
   * @returns {number} Approximate size in bytes
   */
  static getSize() {
    if (typeof window === 'undefined') return 0;

    try {
      let total = 0;
      for (let key in window.localStorage) {
        if (window.localStorage.hasOwnProperty(key)) {
          total += window.localStorage[key].length + key.length;
        }
      }
      return total;
    } catch (error) {
      console.error('Failed to get localStorage size:', error);
      return 0;
    }
  }

  /**
   * Check if localStorage is available
   * @returns {boolean} True if available
   */
  static isAvailable() {
    if (typeof window === 'undefined') return false;

    try {
      const testKey = '__storage_test__';
      window.localStorage.setItem(testKey, 'test');
      window.localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      return false;
    }
  }
}
