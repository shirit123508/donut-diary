/**
 * DonutService - Service layer for donut entries operations
 * Encapsulates all business logic related to donut entries
 * Follows Single Responsibility Principle
 */

export class DonutService {
  constructor(client) {
    this.client = client;
  }

  /**
   * Get donut entries based on filters
   * @param {Object} options - Filter options
   * @param {string} options.userId - User ID
   * @param {string} options.type - "mine" or "group"
   * @param {string} options.groupId - Group ID (required for type="group")
   * @param {number} options.limit - Maximum number of entries to return
   * @returns {Promise<Array>} Array of donut entries
   */
  async getEntries({ userId, type, groupId, limit = 200 }) {
    let query = this.client
      .from("donut_entries")
      .select("*")
      .order("date", { ascending: false })
      .limit(limit);

    if (type === "mine") {
      query = query.eq("created_by", userId);
    } else if (type === "group" && groupId) {
      query = query.eq("visibility", "group").eq("group_id", groupId);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data || [];
  }

  /**
   * Delete a donut entry by ID
   * @param {string} id - Entry ID to delete
   * @returns {Promise<void>}
   */
  async deleteEntry(id) {
    const { error } = await this.client
      .from("donut_entries")
      .delete()
      .eq("id", id);

    if (error) throw new Error(error.message);
  }

  /**
   * Create a new donut entry
   * @param {Object} entry - Entry data
   * @returns {Promise<Object>} Created entry
   */
  async createEntry(entry) {
    const { data, error } = await this.client
      .from("donut_entries")
      .insert(entry)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Update an existing donut entry
   * @param {string} id - Entry ID to update
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated entry
   */
  async updateEntry(id, updates) {
    const { data, error } = await this.client
      .from("donut_entries")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Get a single donut entry by ID
   * @param {string} id - Entry ID
   * @returns {Promise<Object|null>} Entry or null if not found
   */
  async getEntryById(id) {
    const { data, error } = await this.client
      .from("donut_entries")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data;
  }
}
