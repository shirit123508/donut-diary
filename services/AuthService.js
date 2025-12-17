import { ErrorHandler, ValidationHelper, AuthenticationError, createErrorFromSupabase } from "../utils";

/**
 * AuthService - Service layer for authentication operations
 * Encapsulates all business logic related to user authentication
 * Follows Single Responsibility Principle
 */

export class AuthService {
  constructor(client) {
    this.client = client;
  }

  /**
   * Sign in with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Session data
   */
  async signIn(email, password) {
    // Validate inputs
    ValidationHelper.isValidEmail(email, true);
    ValidationHelper.isValidPassword(password, true);

    const { data, error } = await this.client.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      const authError = new AuthenticationError(error.message, error);
      ErrorHandler.log(authError, { method: "signIn", email });
      throw authError;
    }
    return data;
  }

  /**
   * Sign up a new user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Session data
   */
  async signUp(email, password) {
    // Validate inputs
    ValidationHelper.isValidEmail(email, true);
    ValidationHelper.isValidPassword(password, true);

    const { data, error } = await this.client.auth.signUp({
      email,
      password,
    });

    if (error) {
      const authError = new AuthenticationError(error.message, error);
      ErrorHandler.log(authError, { method: "signUp", email });
      throw authError;
    }
    return data;
  }

  /**
   * Sign out the current user
   * @returns {Promise<void>}
   */
  async signOut() {
    const { error } = await this.client.auth.signOut();
    if (error) {
      const appError = createErrorFromSupabase(error);
      ErrorHandler.log(appError, { method: "signOut" });
      throw appError;
    }
  }

  /**
   * Get the current session
   * @returns {Promise<Object|null>} Current session or null
   */
  async getSession() {
    const { data, error } = await this.client.auth.getSession();
    if (error) {
      const appError = createErrorFromSupabase(error);
      ErrorHandler.log(appError, { method: "getSession" });
      throw appError;
    }
    return data.session;
  }

  /**
   * Get the current user
   * @returns {Promise<Object|null>} Current user or null
   */
  async getCurrentUser() {
    const { data, error } = await this.client.auth.getUser();
    if (error) {
      const appError = createErrorFromSupabase(error);
      ErrorHandler.log(appError, { method: "getCurrentUser" });
      throw appError;
    }
    return data.user;
  }

  /**
   * Listen to auth state changes
   * @param {Function} callback - Callback function (event, session) => void
   * @returns {Object} Subscription object with unsubscribe method
   */
  onAuthStateChange(callback) {
    const { data } = this.client.auth.onAuthStateChange(callback);
    return data;
  }

  /**
   * Reset password for email
   * @param {string} email - User email
   * @returns {Promise<void>}
   */
  async resetPassword(email) {
    // Validate email
    ValidationHelper.isValidEmail(email, true);

    const { error } = await this.client.auth.resetPasswordForEmail(email);
    if (error) {
      const appError = createErrorFromSupabase(error);
      ErrorHandler.log(appError, { method: "resetPassword", email });
      throw appError;
    }
  }

  /**
   * Update user password
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Updated user
   */
  async updatePassword(newPassword) {
    // Validate password
    ValidationHelper.isValidPassword(newPassword, true);

    const { data, error } = await this.client.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      const appError = createErrorFromSupabase(error);
      ErrorHandler.log(appError, { method: "updatePassword" });
      throw appError;
    }
    return data.user;
  }
}
