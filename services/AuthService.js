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
    const { data, error } = await this.client.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Sign up a new user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Session data
   */
  async signUp(email, password) {
    const { data, error } = await this.client.auth.signUp({
      email,
      password,
    });

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Sign out the current user
   * @returns {Promise<void>}
   */
  async signOut() {
    const { error } = await this.client.auth.signOut();
    if (error) throw new Error(error.message);
  }

  /**
   * Get the current session
   * @returns {Promise<Object|null>} Current session or null
   */
  async getSession() {
    const { data, error } = await this.client.auth.getSession();
    if (error) throw new Error(error.message);
    return data.session;
  }

  /**
   * Get the current user
   * @returns {Promise<Object|null>} Current user or null
   */
  async getCurrentUser() {
    const { data, error } = await this.client.auth.getUser();
    if (error) throw new Error(error.message);
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
    const { error } = await this.client.auth.resetPasswordForEmail(email);
    if (error) throw new Error(error.message);
  }

  /**
   * Update user password
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Updated user
   */
  async updatePassword(newPassword) {
    const { data, error } = await this.client.auth.updateUser({
      password: newPassword,
    });

    if (error) throw new Error(error.message);
    return data.user;
  }
}
