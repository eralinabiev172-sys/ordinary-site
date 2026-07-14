import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

type ProtectedRouteProps = {
  children: ReactNode;
};

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = localStorage.getItem('adminAccessToken');
  const userValue = localStorage.getItem('adminUser');

  if (!token || !userValue) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userValue) as {
      role?: string;
    };

    if (user.role !== 'ADMIN') {
      localStorage.removeItem('adminAccessToken');
      localStorage.removeItem('adminUser');

      return <Navigate to="/login" replace />;
    }
  } catch {
    localStorage.removeItem('adminAccessToken');
    localStorage.removeItem('adminUser');

    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;