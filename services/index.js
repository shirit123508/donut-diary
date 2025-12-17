/**
 * Services Index - Centralized export for all services
 * Creates singleton instances of each service with the Supabase client
 * Follows Singleton Pattern and Dependency Injection
 */

import { supabase } from "../lib/supabaseClient";
import { DonutService } from "./DonutService";
import { GroupService } from "./GroupService";
import { AuthService } from "./AuthService";

// Create singleton instances
export const donutService = new DonutService(supabase);
export const groupService = new GroupService(supabase);
export const authService = new AuthService(supabase);

// Export classes for testing purposes (allows dependency injection)
export { DonutService, GroupService, AuthService };
