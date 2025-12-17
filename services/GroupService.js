import { makeJoinCode } from "../lib/joinCode";
import { ErrorHandler, ValidationHelper, NotFoundError, createErrorFromSupabase } from "../utils";

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

    if (error) {
      const appError = createErrorFromSupabase(error);
      ErrorHandler.log(appError, { method: "getUserGroups", userId });
      throw appError;
    }
    return (data || []).map((row) => row.groups).filter(Boolean);
  }

  /**
   * Create a new group with a unique join code
   * @param {string} name - Group name
   * @param {string} userId - Creator user ID
   * @returns {Promise<Object>} Created group
   */
  async createGroup(name, userId) {
    // Validate group name
    ValidationHelper.isValidGroupName(name, true);

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

    if (groupError) {
      const appError = createErrorFromSupabase(groupError);
      ErrorHandler.log(appError, { method: "createGroup", name, userId });
      throw appError;
    }

    // Add creator as admin
    const { error: memberError } = await this.client
      .from("group_members")
      .insert({ group_id: group.id, user_id: userId, role: "admin" });

    if (memberError) {
      const appError = createErrorFromSupabase(memberError);
      ErrorHandler.log(appError, { method: "createGroup:addMember", groupId: group.id, userId });
      throw appError;
    }

    return group;
  }

  /**
   * Join an existing group using a join code
   * @param {string} joinCode - 6-character join code
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Joined group
   */
  async joinGroup(joinCode, userId) {
    // Validate join code format
    ValidationHelper.isValidJoinCode(joinCode, true);

    // Find group by join code
    const { data: group, error: findError } = await this.client
      .from("groups")
      .select("id,name")
      .eq("join_code", joinCode.trim().toUpperCase())
      .maybeSingle();

    if (findError) {
      const appError = createErrorFromSupabase(findError);
      ErrorHandler.log(appError, { method: "joinGroup:find", joinCode });
      throw appError;
    }

    if (!group) {
      const notFoundError = new NotFoundError("קוד ההצטרפות");
      ErrorHandler.log(notFoundError, { method: "joinGroup", joinCode });
      throw notFoundError;
    }

    // Add user to group
    const { error: insertError } = await this.client
      .from("group_members")
      .insert({ group_id: group.id, user_id: userId, role: "member" });

    if (insertError) {
      // Check if already a member (duplicate key error)
      if (insertError.code === "23505") {
        const duplicateError = new ValidationError("את כבר חברה במשפחה הזו");
        ErrorHandler.log(duplicateError, { method: "joinGroup:duplicate", groupId: group.id, userId });
        throw duplicateError;
      }
      const appError = createErrorFromSupabase(insertError);
      ErrorHandler.log(appError, { method: "joinGroup:insert", groupId: group.id, userId });
      throw appError;
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

    if (error) {
      const appError = createErrorFromSupabase(error);
      ErrorHandler.log(appError, { method: "leaveGroup", groupId, userId });
      throw appError;
    }
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

    if (error) {
      const appError = createErrorFromSupabase(error);
      ErrorHandler.log(appError, { method: "getGroupById", groupId });
      throw appError;
    }
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

    if (error) {
      const appError = createErrorFromSupabase(error);
      ErrorHandler.log(appError, { method: "isMember", groupId, userId });
      throw appError;
    }
    return !!data;
  }
}
