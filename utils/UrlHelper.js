/**
 * UrlHelper - Utility class for URL operations
 * Provides helpers for URL manipulation, query params, and paths
 * Follows Single Responsibility Principle
 */

export class UrlHelper {
  /**
   * Build URL with query parameters
   * @param {string} base - Base URL
   * @param {Object} params - Query parameters
   * @returns {string} Complete URL with query string
   */
  static buildUrl(base, params = {}) {
    try {
      const url = new URL(base, window.location.origin);

      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          url.searchParams.append(key, String(value));
        }
      });

      return url.toString();
    } catch (error) {
      console.error('Failed to build URL:', error);
      return base;
    }
  }

  /**
   * Parse query string to object
   * @param {string} queryString - Query string (with or without '?')
   * @returns {Object} Parsed parameters
   */
  static parseQuery(queryString = '') {
    try {
      const query = queryString.startsWith('?')
        ? queryString.substring(1)
        : queryString;

      const params = new URLSearchParams(query);
      const result = {};

      params.forEach((value, key) => {
        // Handle arrays (key[] or multiple same keys)
        if (key.endsWith('[]')) {
          const baseKey = key.slice(0, -2);
          if (!result[baseKey]) {
            result[baseKey] = [];
          }
          result[baseKey].push(value);
        } else if (result[key]) {
          // Multiple values for same key
          if (Array.isArray(result[key])) {
            result[key].push(value);
          } else {
            result[key] = [result[key], value];
          }
        } else {
          result[key] = value;
        }
      });

      return result;
    } catch (error) {
      console.error('Failed to parse query string:', error);
      return {};
    }
  }

  /**
   * Get current URL query parameters
   * @returns {Object} Current query parameters
   */
  static getCurrentQuery() {
    if (typeof window === 'undefined') return {};

    return this.parseQuery(window.location.search);
  }

  /**
   * Add or update query parameter in current URL
   * @param {string} key - Parameter key
   * @param {string} value - Parameter value
   * @param {boolean} pushState - Whether to push new state (default: true)
   * @returns {string} New URL
   */
  static setQueryParam(key, value, pushState = true) {
    if (typeof window === 'undefined') return '';

    try {
      const url = new URL(window.location.href);
      url.searchParams.set(key, String(value));

      if (pushState) {
        window.history.pushState({}, '', url.toString());
      }

      return url.toString();
    } catch (error) {
      console.error('Failed to set query parameter:', error);
      return window.location.href;
    }
  }

  /**
   * Remove query parameter from current URL
   * @param {string} key - Parameter key
   * @param {boolean} pushState - Whether to push new state (default: true)
   * @returns {string} New URL
   */
  static removeQueryParam(key, pushState = true) {
    if (typeof window === 'undefined') return '';

    try {
      const url = new URL(window.location.href);
      url.searchParams.delete(key);

      if (pushState) {
        window.history.pushState({}, '', url.toString());
      }

      return url.toString();
    } catch (error) {
      console.error('Failed to remove query parameter:', error);
      return window.location.href;
    }
  }

  /**
   * Get specific query parameter value
   * @param {string} key - Parameter key
   * @param {string} defaultValue - Default value if not found
   * @returns {string|null} Parameter value
   */
  static getQueryParam(key, defaultValue = null) {
    if (typeof window === 'undefined') return defaultValue;

    try {
      const params = new URLSearchParams(window.location.search);
      return params.get(key) || defaultValue;
    } catch (error) {
      console.error('Failed to get query parameter:', error);
      return defaultValue;
    }
  }

  /**
   * Check if URL is absolute
   * @param {string} url - URL to check
   * @returns {boolean} True if absolute
   */
  static isAbsolute(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if URL is external (different origin)
   * @param {string} url - URL to check
   * @returns {boolean} True if external
   */
  static isExternal(url) {
    if (typeof window === 'undefined') return false;

    try {
      const urlObj = new URL(url, window.location.origin);
      return urlObj.origin !== window.location.origin;
    } catch {
      return false;
    }
  }

  /**
   * Get URL parts
   * @param {string} url - URL to parse
   * @returns {Object} URL parts
   */
  static parse(url) {
    try {
      const urlObj = new URL(url, window?.location?.origin);

      return {
        protocol: urlObj.protocol,
        host: urlObj.host,
        hostname: urlObj.hostname,
        port: urlObj.port,
        pathname: urlObj.pathname,
        search: urlObj.search,
        hash: urlObj.hash,
        origin: urlObj.origin,
        href: urlObj.href,
      };
    } catch (error) {
      console.error('Failed to parse URL:', error);
      return null;
    }
  }

  /**
   * Join path segments
   * @param {...string} segments - Path segments
   * @returns {string} Joined path
   */
  static joinPath(...segments) {
    return segments
      .map((segment, index) => {
        // Remove leading slash from all except first
        if (index > 0 && segment.startsWith('/')) {
          segment = segment.substring(1);
        }
        // Remove trailing slash from all except last
        if (index < segments.length - 1 && segment.endsWith('/')) {
          segment = segment.substring(0, segment.length - 1);
        }
        return segment;
      })
      .filter(Boolean)
      .join('/');
  }

  /**
   * Extract filename from URL
   * @param {string} url - URL
   * @returns {string} Filename
   */
  static getFilename(url) {
    try {
      const urlObj = new URL(url, window?.location?.origin);
      const pathname = urlObj.pathname;
      const parts = pathname.split('/');
      return parts[parts.length - 1] || '';
    } catch (error) {
      console.error('Failed to get filename:', error);
      return '';
    }
  }

  /**
   * Extract file extension from URL
   * @param {string} url - URL
   * @returns {string} Extension (without dot)
   */
  static getExtension(url) {
    const filename = this.getFilename(url);
    const parts = filename.split('.');

    if (parts.length > 1) {
      return parts[parts.length - 1];
    }

    return '';
  }

  /**
   * Sanitize URL for safe usage
   * @param {string} url - URL to sanitize
   * @returns {string} Sanitized URL
   */
  static sanitize(url) {
    if (!url) return '';

    try {
      // Remove dangerous protocols
      const dangerous = ['javascript:', 'data:', 'vbscript:', 'file:'];
      const lower = url.toLowerCase();

      for (const protocol of dangerous) {
        if (lower.startsWith(protocol)) {
          return '';
        }
      }

      return url.trim();
    } catch (error) {
      console.error('Failed to sanitize URL:', error);
      return '';
    }
  }

  /**
   * Encode URL component safely
   * @param {string} str - String to encode
   * @returns {string} Encoded string
   */
  static encode(str) {
    try {
      return encodeURIComponent(str);
    } catch (error) {
      console.error('Failed to encode URL component:', error);
      return str;
    }
  }

  /**
   * Decode URL component safely
   * @param {string} str - String to decode
   * @returns {string} Decoded string
   */
  static decode(str) {
    try {
      return decodeURIComponent(str);
    } catch (error) {
      console.error('Failed to decode URL component:', error);
      return str;
    }
  }

  /**
   * Get base URL (origin + pathname without query/hash)
   * @param {string} url - URL
   * @returns {string} Base URL
   */
  static getBase(url) {
    try {
      const urlObj = new URL(url, window?.location?.origin);
      return urlObj.origin + urlObj.pathname;
    } catch (error) {
      console.error('Failed to get base URL:', error);
      return url;
    }
  }

  /**
   * Convert relative URL to absolute
   * @param {string} relativeUrl - Relative URL
   * @param {string} base - Base URL (default: current origin)
   * @returns {string} Absolute URL
   */
  static toAbsolute(relativeUrl, base = null) {
    try {
      const baseUrl = base || (typeof window !== 'undefined' ? window.location.origin : '');
      const url = new URL(relativeUrl, baseUrl);
      return url.href;
    } catch (error) {
      console.error('Failed to convert to absolute URL:', error);
      return relativeUrl;
    }
  }

  /**
   * Check if two URLs point to the same resource
   * @param {string} url1 - First URL
   * @param {string} url2 - Second URL
   * @returns {boolean} True if same
   */
  static isSame(url1, url2) {
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const parsed1 = new URL(url1, origin);
      const parsed2 = new URL(url2, origin);

      return (
        parsed1.origin === parsed2.origin &&
        parsed1.pathname === parsed2.pathname
      );
    } catch (error) {
      return url1 === url2;
    }
  }
}
