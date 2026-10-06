import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader } from './Feedback';

export function RequireAuth({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Loader />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  return children;
}

export function RequireRole({ children, roles = [] }) {
  const { role, loading, isAuthenticated } = useAuth();
  const location = useLocation();
  if (loading) return <Loader />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (roles.length > 0 && !roles.includes(role)) return <Navigate to="/admin" replace />;
  return children;
}
