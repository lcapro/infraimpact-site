import { Route, Routes } from 'react-router-dom';
import AuthPage from '../pages/AuthPage';
import WorkspacePage from '../pages/WorkspacePage';
import SettingsPage from '../pages/SettingsPage';
import Navbar from '../components/Navbar';
import RequireAuth from '../components/RequireAuth';

const App = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Routes>
        <Route path="/" element={<AuthPage mode="login" />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />
        <Route
          path="/app"
          element={(
            <RequireAuth>
              <WorkspacePage />
            </RequireAuth>
          )}
        />
        <Route
          path="/app/projects/:id"
          element={(
            <RequireAuth>
              <WorkspacePage />
            </RequireAuth>
          )}
        />
        <Route
          path="/settings"
          element={(
            <RequireAuth>
              <SettingsPage />
            </RequireAuth>
          )}
        />
      </Routes>
    </div>
  );
};

export default App;
