"use client";

import { useEffect } from "react";
import { useAuth } from "../hooks";

/**
 * ProtectedRoute - Higher-Order Component for route protection
 * Automatically redirects unauthenticated users to login
 * Follows Single Responsibility Principle - handles only authentication check
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authenticated
 * @returns {React.ReactNode} Children or loading state
 */
export function ProtectedRoute({ children }) {
  const { requireAuth, loading } = useAuth();

  useEffect(() => {
    requireAuth();
  }, [requireAuth]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="container" style={{ marginTop: 60, textAlign: "center" }}>
        <div className="card">
          <div className="h2">טוען...</div>
          <div className="small" style={{ marginTop: 8 }}>
            בודק הרשאות...
          </div>
        </div>
      </div>
    );
  }

  // Render children only if authenticated
  return children;
}
