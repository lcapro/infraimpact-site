import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const { token, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="p-6 text-sm">Laden...</div>;
  if (!token) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
};

export default RequireAuth;
