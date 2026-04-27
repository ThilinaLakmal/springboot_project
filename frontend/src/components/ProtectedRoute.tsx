import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  requiredRole?: 'ADMIN' | 'USER' | 'STUDENT';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRole }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Admin has access to everything
  if (requiredRole && user?.role !== 'ADMIN') {
    // If the required role is USER or STUDENT, allow both USER and STUDENT
    const isStudentOrUser = user?.role === 'USER' || user?.role === 'STUDENT';
    const requiredIsStudentOrUser = requiredRole === 'USER' || requiredRole === 'STUDENT';

    if (!(isStudentOrUser && requiredIsStudentOrUser) && user?.role !== requiredRole) {
      return <Navigate to="/app/facilities/dashboard" replace />;
    }
  }

  return <Outlet />;
};
