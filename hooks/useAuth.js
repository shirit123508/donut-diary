"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "../lib/useSession";
import { authService } from "../services";

/**
 * useAuth - Advanced authentication hook
 * Provides comprehensive auth state and operations
 * Encapsulates authentication logic following SRP
 *
 * @returns {Object} Auth state and operations
 */
export function useAuth() {
  const router = useRouter();
  const { session, loading } = useSession();

  /**
   * Redirect to login if not authenticated
   * Use this in useEffect for protected routes
   */
  const requireAuth = useCallback(() => {
    if (!loading && !session) {
      router.replace("/login");
    }
  }, [loading, session, router]);

  /**
   * Redirect to feed if already authenticated
   * Use this in useEffect for auth pages (login/signup)
   */
  const requireGuest = useCallback(() => {
    if (!loading && session) {
      router.replace("/feed");
    }
  }, [loading, session, router]);

  /**
   * Sign out and redirect to login
   */
  const logout = useCallback(async () => {
    try {
      await authService.signOut();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    }
  }, [router]);

  /**
   * Sign in with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Session data
   */
  const login = useCallback(async (email, password) => {
    return await authService.signIn(email, password);
  }, []);

  /**
   * Sign up a new user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Session data
   */
  const signup = useCallback(async (email, password) => {
    return await authService.signUp(email, password);
  }, []);

  return {
    // State
    session,
    loading,
    user: session?.user,
    userId: session?.user?.id,
    isAuthenticated: !!session,

    // Operations
    requireAuth,
    requireGuest,
    logout,
    login,
    signup,
  };
}
