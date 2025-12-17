import { ErrorHandler, ValidationHelper, createErrorFromSupabase } from "../utils";

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
    if (error) {
      const appError = createErrorFromSupabase(error);
      ErrorHandler.log(appError, { method: "getEntries", userId, type, groupId });
      throw appError;
    }
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

    if (error) {
      const appError = createErrorFromSupabase(error);
      ErrorHandler.log(appError, { method: "deleteEntry", id });
      throw appError;
    }
  }

  /**
   * Create a new donut entry
   * @param {Object} entry - Entry data
   * @returns {Promise<Object>} Created entry
   */
  async createEntry(entry) {
    // Validate entry
    const validation = ValidationHelper.validateDonutEntry(entry);
    if (!validation.valid) {
      const firstError = Object.values(validation.errors)[0];
      const validationError = new ValidationError(firstError);
      ErrorHandler.log(validationError, { method: "createEntry", entry });
      throw validationError;
    }

    const { data, error } = await this.client
      .from("donut_entries")
      .insert(entry)
      .select()
      .single();

    if (error) {
      const appError = createErrorFromSupabase(error);
      ErrorHandler.log(appError, { method: "createEntry", entry });
      throw appError;
    }
    return data;
  }

  /**
   * Update an existing donut entry
   * @param {string} id - Entry ID to update
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated entry
   */
  async updateEntry(id, updates) {
    // Validate updates if they contain critical fields
    if (updates.place_name || updates.donut_name || updates.rating) {
      const validation = ValidationHelper.validateDonutEntry({
        place_name: updates.place_name || "placeholder",
        donut_name: updates.donut_name || "placeholder",
        rating: updates.rating || 5,
        ...updates,
      });

      if (!validation.valid) {
        const firstError = Object.values(validation.errors)[0];
        const validationError = new ValidationError(firstError);
        ErrorHandler.log(validationError, { method: "updateEntry", id, updates });
        throw validationError;
      }
    }

    const { data, error } = await this.client
      .from("donut_entries")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      const appError = createErrorFromSupabase(error);
      ErrorHandler.log(appError, { method: "updateEntry", id, updates });
      throw appError;
    }
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

    if (error) {
      const appError = createErrorFromSupabase(error);
      ErrorHandler.log(appError, { method: "getEntryById", id });
      throw appError;
    }
    return data;
  }
}
