import { makeJoinCode } from "../lib/joinCode";

/**
 * GroupService - Service layer for family group operations
 * Encapsulates all business logic related to groups and group membership
 * Follows Single Responsibility Principle
 */

export class GroupService {
  constructor(client) {
    this.client = client;
  }

  /**
   * Get all groups for a specific user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Array of groups
   */
  async getUserGroups(userId) {
    const { data, error } = await this.client
      .from("group_members")
      .select("group_id, groups:groups(id,name,join_code,created_by)")
      .eq("user_id", userId);

    if (error) throw new Error(error.message);
    return (data || []).map((row) => row.groups).filter(Boolean);
  }

  /**
   * Create a new group with a unique join code
   * @param {string} name - Group name
   * @param {string} userId - Creator user ID
   * @returns {Promise<Object>} Created group
   */
  async createGroup(name, userId) {
    // Generate unique join code with retry logic
    let code = makeJoinCode();
    for (let i = 0; i < 5; i++) {
      const { data: existing } = await this.client
        .from("groups")
        .select("id")
        .eq("join_code", code)
        .maybeSingle();

      if (!existing) break;
      code = makeJoinCode();
    }

    // Create the group
    const { data: group, error: groupError } = await this.client
      .from("groups")
      .insert({ name: name.trim(), created_by: userId, join_code: code })
      .select()
      .single();

    if (groupError) throw new Error(groupError.message);

    // Add creator as admin
    const { error: memberError } = await this.client
      .from("group_members")
      .insert({ group_id: group.id, user_id: userId, role: "admin" });

    if (memberError) throw new Error(memberError.message);

    return group;
  }

  /**
   * Join an existing group using a join code
   * @param {string} joinCode - 6-character join code
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Joined group
   */
  async joinGroup(joinCode, userId) {
    // Find group by join code
    const { data: group, error: findError } = await this.client
      .from("groups")
      .select("id,name")
      .eq("join_code", joinCode.trim().toUpperCase())
      .maybeSingle();

    if (findError) throw new Error(findError.message);
    if (!group) throw new Error("קוד לא נמצא. בדקי שהקלדת נכון.");

    // Add user to group
    const { error: insertError } = await this.client
      .from("group_members")
      .insert({ group_id: group.id, user_id: userId, role: "member" });

    if (insertError) {
      // Check if already a member
      if (insertError.code === "23505") {
        throw new Error("את כבר חברה במשפחה הזו");
      }
      throw new Error(insertError.message);
    }

    return group;
  }

  /**
   * Leave a group (remove membership)
   * @param {string} groupId - Group ID
   * @param {string} userId - User ID
   * @returns {Promise<void>}
   */
  async leaveGroup(groupId, userId) {
    const { error } = await this.client
      .from("group_members")
      .delete()
      .eq("group_id", groupId)
      .eq("user_id", userId);

    if (error) throw new Error(error.message);
  }

  /**
   * Get a single group by ID
   * @param {string} groupId - Group ID
   * @returns {Promise<Object|null>} Group or null if not found
   */
  async getGroupById(groupId) {
    const { data, error } = await this.client
      .from("groups")
      .select("*")
      .eq("id", groupId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Check if a user is a member of a group
   * @param {string} groupId - Group ID
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} True if user is a member
   */
  async isMember(groupId, userId) {
    const { data, error } = await this.client
      .from("group_members")
      .select("group_id")
      .eq("group_id", groupId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return !!data;
  }
}
