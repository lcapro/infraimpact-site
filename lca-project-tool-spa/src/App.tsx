import { Route, Routes, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { AuthPage } from './pages/AuthPage';
import { WorkspacePage } from './pages/WorkspacePage';
import { useAuth } from './lib/useAuth';

export default function App() {
  const { session, bootstrap } = useAuth();

  if (!bootstrap) {
    return null;
  }

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route
          path="/workspace"
          element={session?.verified ? <WorkspacePage /> : <Navigate to="/" replace />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
}
